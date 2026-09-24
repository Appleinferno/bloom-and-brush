const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['.git', '.agent', '.shared', 'node_modules']);
const errors = [];
const warnings = [];

function walk(directory, extension) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        if (entry.isDirectory() && !SKIP_DIRS.has(entry.name)) return walk(path.join(directory, entry.name), extension);
        if (entry.isFile() && entry.name.endsWith(extension)) return [path.join(directory, entry.name)];
        return [];
    });
}

function report(list, file, message) {
    list.push(`${path.relative(ROOT, file)}: ${message}`);
}

function resolveLocalReference(file, rawReference) {
    const reference = rawReference.split('#')[0].split('?')[0];
    if (!reference || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(reference)) return null;
    let decoded;
    try {
        decoded = decodeURIComponent(reference);
    } catch {
        return { path: reference, invalidEncoding: true };
    }
    const target = decoded.startsWith('/')
        ? path.join(ROOT, decoded.slice(1))
        : path.resolve(path.dirname(file), decoded);
    return { path: target };
}

const htmlFiles = walk(ROOT, '.html');

for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const isThankYou = file.includes(`${path.sep}thank-you${path.sep}`);

    if (!/<title>[^<]+<\/title>/i.test(html)) report(errors, file, 'missing a non-empty title');
    if (!isThankYou && !/<meta\s+name="description"/i.test(html)) report(errors, file, 'missing meta description');
    if (!isThankYou && !/<link\s+rel="canonical"/i.test(html)) report(errors, file, 'missing canonical URL');
    if (!/<h1(?:\s|>)/i.test(html)) report(errors, file, 'missing h1');
    if (!/<main(?:\s|>)/i.test(html)) report(warnings, file, 'missing main landmark');
    if (/@font-face/i.test(html)) report(errors, file, 'contains inline font declarations; fonts belong in compiled CSS');
    if (/href="#"/i.test(html)) report(warnings, file, 'contains a placeholder href="#" link');
    if (/id="mobile-menu-btn"/i.test(html) && !/id="mobile-menu-btn"[^>]+aria-expanded=/is.test(html)) {
        report(errors, file, 'mobile menu button is missing aria-expanded');
    }

    const ids = [...html.matchAll(/\sid="([^"]+)"/gi)].map((match) => match[1]);
    const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    duplicateIds.forEach((id) => report(errors, file, `duplicate id="${id}"`));

    for (const match of html.matchAll(/<(?:a|link|script|img|source)[^>]+(href|src|srcset)="([^"]+)"/gi)) {
        const candidates = match[1].toLowerCase() === 'srcset'
            ? match[2].split(',').map((value) => value.trim().split(/\s+/)[0])
            : [match[2]];
        for (const candidate of candidates) {
            const resolved = resolveLocalReference(file, candidate);
            if (!resolved) continue;
            if (resolved.invalidEncoding) {
                report(errors, file, `invalid URL encoding in ${candidate}`);
                continue;
            }
            let exists = fs.existsSync(resolved.path);
            if (exists && fs.statSync(resolved.path).isDirectory()) exists = fs.existsSync(path.join(resolved.path, 'index.html'));
            if (!exists) report(errors, file, `missing local target ${candidate}`);
        }
    }

    let imagesWithoutDimensions = 0;
    for (const image of html.matchAll(/<img\b([^>]*)>/gi)) {
        if (!/\salt="[^"]*"/i.test(image[1])) report(errors, file, 'image missing alt attribute');
        const hasEmptySource = /\ssrc=""/i.test(image[1]);
        if (!hasEmptySource && (!/\swidth="\d+"/i.test(image[1]) || !/\sheight="\d+"/i.test(image[1]))) {
            imagesWithoutDimensions += 1;
        }
    }
    if (imagesWithoutDimensions) report(warnings, file, `${imagesWithoutDimensions} images missing explicit width and height`);
}

const imageFiles = walk(path.join(ROOT, 'images'), '').filter((file) => /\.(?:avif|jpe?g|png|webp|zip)$/i.test(file));
const oversized = imageFiles.filter((file) => fs.statSync(file).size > 1024 * 1024);
if (oversized.length) {
    warnings.push(`${oversized.length} image-directory files exceed 1 MB; run an image cleanup pass before adding them to pages`);
}

warnings.forEach((warning) => console.warn(`WARN ${warning}`));
errors.forEach((error) => console.error(`ERROR ${error}`));
console.log(`Checked ${htmlFiles.length} HTML files: ${errors.length} errors, ${warnings.length} warnings.`);
process.exitCode = errors.length ? 1 : 0;
