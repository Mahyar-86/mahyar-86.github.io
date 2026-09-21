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
    document.title = site.siteTitle;

    document.querySelectorAll('.nav-logo').forEach(element => {
        element.textContent = site.logo;
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        const page = link.getAttribute('href');
        if (page === 'index.html') link.textContent = site.navigation.home;
        if (page === 'portfolio.html') link.textContent = site.navigation.portfolio;
        if (page === 'resume.html') link.textContent = site.navigation.resume;
    });

    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroDescription = document.querySelector('.hero-description');
    const profileImage = document.querySelector('.profile-image');

    if (heroTitle) heroTitle.textContent = site.hero.name;
    if (heroSubtitle) heroSubtitle.textContent = site.hero.subtitle;
    if (heroDescription) heroDescription.innerHTML = renderInlineMarkup(site.hero.description);
    if (profileImage) {
        profileImage.src = site.hero.profileImage;
        profileImage.alt = `${site.logo} profile photo`;
    }

    const contactLabel = document.querySelector('.contact-label');
    const contactNote = document.querySelector('.contact-note');
    const socialLinks = document.querySelector('.social-links');

    if (contactLabel) contactLabel.textContent = site.contact.label;
    if (contactNote) contactNote.textContent = site.contact.note;
    if (socialLinks) renderContactLinks(socialLinks, site.contact.links);

    document.querySelectorAll('.footer p').forEach(element => {
        element.textContent = site.footer.text;
    });

    renderResume(site.resume);
}

function renderResume(resume) {
    const title = document.querySelector('.resume-title');
    const download = document.querySelector('.resume-actions .secondary-btn');
    const viewer = document.querySelector('.resume-viewer iframe');
    const fallback = document.querySelector('.pdf-fallback');

    if (!title) return;
    title.textContent = resume.title;
    if (download) {
        download.href = resume.file;
        download.download = resume.file.split('/').pop();
        download.querySelector('span').textContent = resume.downloadLabel;
    }
    if (viewer) {
        viewer.src = `${resume.file}#toolbar=1&view=FitH`;
        viewer.title = resume.viewerTitle;
    }
    if (fallback) {
        fallback.firstChild.textContent = `${resume.fallbackText} `;
        const link = fallback.querySelector('a');
        link.href = resume.file;
        link.textContent = resume.fallbackLinkLabel;
    }
}

function renderContactLinks(container, links) {
    container.replaceChildren();

    links.forEach((link, index) => {
        const isEmail = link.kind === 'email';
        const element = document.createElement(isEmail ? 'button' : 'a');
        element.className = `contact-link${index === 0 ? ' contact-link-primary' : ''}${isEmail ? ' copy-email' : ''}`;

        if (isEmail) {
            element.type = 'button';
            element.dataset.email = link.value;
            element.setAttribute('aria-label', `Copy ${link.label.toLowerCase()}`);
        } else {
            element.href = link.value;
            element.target = '_blank';
            element.rel = 'noreferrer';
        }

        const icon = document.createElement('span');
        icon.className = 'contact-link-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = link.icon;

        const content = document.createElement('span');
        const label = document.createElement('strong');
        label.textContent = link.label;
        const detail = document.createElement('small');
        detail.textContent = link.detail;
        content.append(label, detail);
        element.append(icon, content);

        if (isEmail) element.addEventListener('click', () => copyEmail(element, link.value));
        container.appendChild(element);
    });
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

    const emailText = element.querySelector('small');
    element.classList.add('copied');
    emailText.textContent = 'Copied to clipboard';

    window.setTimeout(() => {
        element.classList.remove('copied');
        emailText.textContent = email;
    }, 1800);
}

function renderInlineMarkup(value) {
    const escaped = String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
    return escaped.replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/g, '<b>$1</b>');
}
