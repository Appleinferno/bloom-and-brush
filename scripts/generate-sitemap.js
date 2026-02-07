const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://bloomandbrush.fun';
const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'sitemap.xml');

// Files to exclude from sitemap
const EXCLUDES = ['404.html', 'google', 'yandex']; // basic excludes

function getHtmlFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        // Skip node_modules, .git, etc.
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== '.agent' && file !== 'scripts' && file !== 'assets' && file !== 'src') {
                results = results.concat(getHtmlFiles(filePath));
            }
        } else {
            if (path.extname(file) === '.html' && !EXCLUDES.includes(file)) {
                results.push(path.relative(ROOT_DIR, filePath));
            }
        }
    });
    return results;
}

function generateSitemap() {
    console.log('🔍 Scanning for HTML files...');
    const files = getHtmlFiles(ROOT_DIR);

    const currentDate = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    files.forEach(file => {
        // Convert file path to URL path
        // e.g., index.html -> /
        // e.g., about.html -> /about.html
        let urlPath = file.replace(/\\/g, '/'); // Fix windows slashes

        if (urlPath === 'index.html') {
            urlPath = '';
        }

        const loc = `${DOMAIN}/${urlPath}`;

        xml += `  <url>
    <loc>${loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${urlPath === '' ? '1.0' : '0.8'}</priority>
  </url>
`;
    });

    xml += `</urlset>`;

    fs.writeFileSync(OUTPUT_FILE, xml);
    console.log(`✅ Sitemap generated at ${OUTPUT_FILE} with ${files.length} URLs.`);
}

generateSitemap();
