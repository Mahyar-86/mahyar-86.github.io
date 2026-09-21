document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('content/site.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`Could not load site content: ${response.status}`);
        const site = await response.json();
        renderSite(site);
    } catch (error) {
        console.error('Site content could not be loaded.', error);
    }
});

function renderSite(site) {
    const page = document.documentElement.dataset.page;
    document.title = page === 'resume' ? `${site.resume.title} - ${site.logo}` : site.siteTitle;
    renderHeader(site, page);
    renderFooter(site);
    renderBackToTop();

    if (page === 'home') renderHome(site);
    if (page === 'resume') renderResume(site);
}

function renderHeader(site, page) {
    const header = document.getElementById('site-header');
    const links = [
        { href: 'index.html', label: site.navigation.home, page: 'home' },
        { href: 'portfolio.html', label: site.navigation.portfolio, page: 'portfolio' },
        { href: 'resume.html', label: site.navigation.resume, page: 'resume' }
    ];

    const nav = document.createElement('nav');
    nav.className = 'navbar';
    const container = document.createElement('div');
    container.className = 'nav-container';
    const logo = document.createElement('div');
    logo.className = 'nav-logo';
    logo.textContent = site.logo;
    const menu = document.createElement('ul');
    menu.className = 'nav-menu';

    links.forEach(linkData => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = linkData.href;
        link.className = `nav-link${page === linkData.page ? ' active' : ''}`;
        link.textContent = linkData.label;
        item.appendChild(link);
        menu.appendChild(item);
    });

    container.append(logo, menu);
    nav.appendChild(container);
    header.replaceChildren(nav);
}

function renderFooter(site) {
    const footer = document.createElement('footer');
    footer.className = 'footer';
    const text = document.createElement('p');
    text.textContent = site.footer.text;
    footer.appendChild(text);
    document.getElementById('site-footer').replaceChildren(footer);
}

function renderBackToTop() {
    const button = document.createElement('button');
    button.className = 'back-to-top';
    button.id = 'backToTop';
    button.type = 'button';
    button.title = 'Back to top';
    button.setAttribute('aria-label', 'Back to top');
    button.textContent = '↑';
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.appendChild(button);

    window.addEventListener('scroll', () => {
        button.classList.toggle('show', window.pageYOffset > 300);
    });
}

function renderHome(site) {
    const main = document.getElementById('page-content');
    main.className = 'container';

    const section = document.createElement('section');
    section.className = 'hero';
    const photo = document.createElement('div');
    photo.className = 'hero-photo';
    const profile = document.createElement('img');
    profile.className = 'profile-image';
    profile.src = site.hero.profileImage;
    profile.alt = `${site.logo} profile photo`;
    photo.appendChild(profile);

    const content = document.createElement('div');
    content.className = 'hero-content';
    const title = document.createElement('h1');
    title.className = 'hero-title';
    title.textContent = site.hero.name;
    const subtitle = document.createElement('p');
    subtitle.className = 'hero-subtitle';
    subtitle.textContent = site.hero.subtitle;
    const description = document.createElement('p');
    description.className = 'hero-description';
    description.innerHTML = renderInlineMarkup(site.hero.description);
    content.append(title, subtitle, description, renderContact(site.contact));
    section.append(photo, content);
    main.replaceChildren(section);
}

function renderContact(contact) {
    const section = document.createElement('div');
    section.className = 'contact-section';
    const heading = document.createElement('div');
    heading.className = 'contact-heading';
    const label = document.createElement('p');
    label.className = 'contact-label';
    label.textContent = contact.label;
    const note = document.createElement('p');
    note.className = 'contact-note';
    note.textContent = contact.note;
    heading.append(label, note);

    const links = document.createElement('div');
    links.className = 'social-links';
    contact.links.forEach((link, index) => {
        const isEmail = link.kind === 'email';
        const element = document.createElement(isEmail ? 'button' : 'a');
        element.className = `contact-link${index === 0 ? ' contact-link-primary' : ''}${isEmail ? ' copy-email' : ''}`;
        if (isEmail) {
            element.type = 'button';
            element.dataset.email = link.value;
            element.setAttribute('aria-label', `Copy ${link.label.toLowerCase()}`);
            element.addEventListener('click', () => copyEmail(element, link.value));
        } else {
            element.href = link.value;
            element.target = '_blank';
            element.rel = 'noreferrer';
        }

        const icon = document.createElement('span');
        icon.className = 'contact-link-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = link.icon;
        const text = document.createElement('span');
        const linkLabel = document.createElement('strong');
        linkLabel.textContent = link.label;
        const detail = document.createElement('small');
        detail.textContent = link.detail;
        text.append(linkLabel, detail);
        element.append(icon, text);
        links.appendChild(element);
    });

    section.append(heading, links);
    return section;
}

function renderResume(site) {
    const main = document.getElementById('page-content');
    main.className = 'resume-page';
    const section = document.createElement('section');
    section.className = 'resume-section';
    const title = document.createElement('h1');
    title.className = 'resume-title';
    title.textContent = site.resume.title;
    const actions = document.createElement('div');
    actions.className = 'resume-actions';
    const download = document.createElement('a');
    download.className = 'secondary-btn';
    download.href = site.resume.file;
    download.download = site.resume.file.split('/').pop();
    const downloadLabel = document.createElement('span');
    downloadLabel.textContent = site.resume.downloadLabel;
    download.appendChild(downloadLabel);
    actions.appendChild(download);

    const viewer = document.createElement('div');
    viewer.className = 'resume-viewer';
    const iframe = document.createElement('iframe');
    iframe.src = `${site.resume.file}#toolbar=1&view=FitH`;
    iframe.title = site.resume.viewerTitle;
    iframe.loading = 'lazy';
    const fallback = document.createElement('p');
    fallback.className = 'pdf-fallback';
    fallback.append(`${site.resume.fallbackText} `);
    const fallbackLink = document.createElement('a');
    fallbackLink.href = site.resume.file;
    fallbackLink.target = '_blank';
    fallbackLink.rel = 'noopener noreferrer';
    fallbackLink.textContent = site.resume.fallbackLinkLabel;
    fallback.append(fallbackLink, '.');
    viewer.append(iframe, fallback);
    section.append(title, actions, viewer);
    main.replaceChildren(section);
}

async function copyEmail(element, email) {
    try {
        await navigator.clipboard.writeText(email);
    } catch (error) {
        const temporaryInput = document.createElement('textarea');
        temporaryInput.value = email;
        document.body.appendChild(temporaryInput);
        temporaryInput.select();
        document.execCommand('copy');
        temporaryInput.remove();
    }
    const text = element.querySelector('small');
    element.classList.add('copied');
    text.textContent = 'Copied to clipboard';
    window.setTimeout(() => {
        element.classList.remove('copied');
        text.textContent = email;
    }, 1800);
}

function renderInlineMarkup(value) {
    const escaped = String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
    return escaped.replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/g, '<b>$1</b>');
}
