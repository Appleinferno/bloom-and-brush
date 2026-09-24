(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
        if (!mainContent.id) mainContent.id = 'main-content';
        const skipLink = document.createElement('a');
        skipLink.href = `#${mainContent.id}`;
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'fixed left-4 top-2 z-[100] -translate-y-20 rounded-md bg-white px-4 py-2 font-bold text-slate-900 shadow-lg transition-transform focus:translate-y-0';
        document.body.prepend(skipLink);
    }

    const menuButton = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuButton && mobileMenu) {
        const menuIcon = document.getElementById('icon-menu');
        const closeIcon = document.getElementById('icon-close');

        const setMenuOpen = (open) => {
            mobileMenu.classList.toggle('hidden', !open);
            menuButton.setAttribute('aria-expanded', String(open));
            menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
            menuIcon?.classList.toggle('hidden', open);
            closeIcon?.classList.toggle('hidden', !open);
        };

        menuButton.addEventListener('click', () => {
            setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
        });

        mobileMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => setMenuOpen(false));
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
                setMenuOpen(false);
                menuButton.focus();
            }
        });
    }

    document.querySelectorAll('[data-dropdown]').forEach((dropdown, index) => {
        const button = dropdown.querySelector('[data-dropdown-button]');
        const menu = dropdown.querySelector('[data-dropdown-menu]');
        if (!button || !menu) return;

        if (!menu.id) menu.id = `navigation-dropdown-${index + 1}`;
        button.setAttribute('aria-controls', menu.id);

        const setExpanded = (expanded) => button.setAttribute('aria-expanded', String(expanded));
        dropdown.addEventListener('focusin', () => setExpanded(true));
        dropdown.addEventListener('focusout', (event) => {
            if (!dropdown.contains(event.relatedTarget)) setExpanded(false);
        });
        dropdown.addEventListener('mouseenter', () => setExpanded(true));
        dropdown.addEventListener('mouseleave', () => setExpanded(false));
        button.addEventListener('click', () => {
            const open = button.getAttribute('aria-expanded') !== 'true';
            setExpanded(open);
            if (open) menu.querySelector('a')?.focus();
        });
        button.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setExpanded(true);
                menu.querySelector('a')?.focus();
            }
        });
        dropdown.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                setExpanded(false);
                button.focus();
            }
        });
    });

    document.querySelectorAll('form[action*="formspree.io"]').forEach((form) => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const submitButton = form.querySelector('button[type="submit"]');
            if (!submitButton) return;

            const originalContent = submitButton.innerHTML;
            const status = document.createElement('p');
            status.className = 'text-sm font-bold mt-3';
            status.setAttribute('role', 'status');
            status.setAttribute('aria-live', 'polite');
            submitButton.insertAdjacentElement('afterend', status);
            submitButton.disabled = true;
            submitButton.textContent = 'Sending…';
            status.textContent = 'Sending your request…';

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) throw new Error('Form submission failed');
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({ event: 'generate_lead' });
                window.location.assign('/thank-you/');
            } catch {
                submitButton.disabled = false;
                submitButton.innerHTML = originalContent;
                status.classList.add('text-red-700');
                status.textContent = 'Something went wrong. Please try again or call (706) 363-0238.';
            }
        });
    });
})();
