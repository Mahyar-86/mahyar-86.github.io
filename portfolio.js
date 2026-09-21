document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('content/projects.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`Could not load portfolio content: ${response.status}`);
        const portfolio = await response.json();
        renderPortfolio(portfolio);
        renderLightbox();
        initializePortfolioInteractions();
    } catch (error) {
        console.error('Portfolio content could not be loaded.', error);
    }
});

function renderPortfolio(portfolio) {
    const wrapper = document.createElement('div');
    wrapper.className = 'portfolio-wrapper';

    const sidebar = document.createElement('aside');
    sidebar.className = 'portfolio-sidebar';
    const content = document.createElement('main');
    content.className = 'portfolio-content';

    let projectNumber = 0;
    portfolio.categories.forEach(category => {
        const section = document.createElement('div');
        section.className = 'sidebar-section';
        const heading = document.createElement('h3');
        heading.className = 'sidebar-title';
        heading.textContent = category.name;
        const list = document.createElement('ul');
        list.className = 'project-list';

        category.projects.forEach(project => {
            projectNumber += 1;
            const projectLink = document.createElement('a');
            projectLink.className = `project-link${projectNumber === 1 ? ' active' : ''}`;
            projectLink.href = `#${project.id}`;
            projectLink.dataset.project = projectNumber;
            projectLink.textContent = project.title;
            const item = document.createElement('li');
            item.appendChild(projectLink);
            list.appendChild(item);
            content.appendChild(renderProject(project, projectNumber));
        });

        section.append(heading, list);
        sidebar.appendChild(section);
    });

    wrapper.append(sidebar, content);
    document.getElementById('page-content').replaceChildren(wrapper);
}

function renderLightbox() {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.id = 'lightbox';
    const content = document.createElement('div');
    content.className = 'lightbox-content';
    content.innerHTML = `
        <button class="lightbox-close" id="lightboxClose" type="button">&times;</button>
        <button class="lightbox-prev" id="lightboxPrev" type="button">&#10094;</button>
        <button class="lightbox-next" id="lightboxNext" type="button">&#10095;</button>
        <div class="lightbox-media-container" id="lightboxMediaContainer"></div>
        <div class="lightbox-thumbnails" id="lightboxThumbnails"></div>`;
    lightbox.appendChild(content);
    document.body.appendChild(lightbox);
}

function renderProject(project, projectNumber) {
    const card = document.createElement('section');
    card.className = 'project-card';
    card.id = project.id;

    const title = document.createElement('h2');
    title.className = 'project-title';
    title.textContent = project.title;

    const gallery = document.createElement('div');
    gallery.className = 'project-gallery';
    project.gallery.forEach((media, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.dataset.index = index;

        if (media.type === 'video') {
            const video = document.createElement('video');
            video.className = 'gallery-media';
            video.preload = 'none';
            video.poster = media.poster;
            const source = document.createElement('source');
            source.src = media.src;
            source.type = 'video/mp4';
            video.appendChild(source);
            item.appendChild(video);
        } else {
            const image = document.createElement('img');
            image.loading = 'lazy';
            image.decoding = 'async';
            image.src = media.src;
            image.alt = media.alt;
            image.className = 'gallery-media';
            item.appendChild(image);
        }

        const overlay = document.createElement('div');
        overlay.className = 'gallery-overlay';
        const expandButton = document.createElement('button');
        expandButton.className = 'gallery-expand-btn';
        expandButton.type = 'button';
        expandButton.setAttribute('aria-label', `Open ${media.alt}`);
        expandButton.innerHTML = '<span>+</span>';
        overlay.appendChild(expandButton);
        item.appendChild(overlay);
        gallery.appendChild(item);
    });

    const details = document.createElement('div');
    details.className = 'project-details';
    const description = document.createElement('ul');
    description.className = 'project-description';
    project.descriptions.forEach(text => {
        const item = document.createElement('li');
        item.textContent = text;
        description.appendChild(item);
    });
    details.appendChild(description);

    if (project.links.length > 0) {
        const links = document.createElement('div');
        links.className = 'project-links';
        project.links.forEach(link => {
            const anchor = document.createElement('a');
            anchor.href = link.url;
            anchor.target = '_blank';
            anchor.rel = 'noreferrer';
            anchor.className = `${link.style}-btn`;
            anchor.textContent = link.label;
            links.appendChild(anchor);
        });
        details.appendChild(links);
    }

    card.append(title, gallery, details);
    return card;
}

function initializePortfolioInteractions() {
    const lightbox = document.getElementById('lightbox');
    const mediaContainer = document.getElementById('lightboxMediaContainer');
    const thumbnails = document.getElementById('lightboxThumbnails');
    const closeButton = document.getElementById('lightboxClose');
    const previousButton = document.getElementById('lightboxPrev');
    const nextButton = document.getElementById('lightboxNext');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const projectLinks = document.querySelectorAll('.project-link');
    let currentMedia = [];
    let currentIndex = 0;
    let touchStartX = 0;

    document.querySelectorAll('.project-card').forEach(card => {
        const items = card.querySelectorAll('.gallery-item');
        items.forEach(item => {
            if (item.querySelector('video')) {
                const icon = document.createElement('div');
                icon.className = 'video-icon-badge';
                icon.textContent = '▶';
                item.appendChild(icon);
            }
        });
        if (items.length > 3) {
            const badge = document.createElement('div');
            badge.className = 'gallery-more-badge';
            badge.textContent = `+${items.length - 3} more`;
            items[2].appendChild(badge);
        }
    });

    galleryItems.forEach(item => item.addEventListener('click', function () {
        const card = this.closest('.project-card');
        currentMedia = Array.from(card.querySelectorAll('.gallery-media'));
        currentIndex = Array.from(card.querySelectorAll('.gallery-item')).indexOf(this);
        displayMedia();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }));

    function closeLightbox() {
        stopVideos();
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
        currentMedia = [];
    }

    closeButton.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', event => {
        if (event.target === lightbox) closeLightbox();
    });
    previousButton.addEventListener('click', event => {
        event.stopPropagation();
        currentIndex -= 1;
        displayMedia();
    });
    nextButton.addEventListener('click', event => {
        event.stopPropagation();
        currentIndex += 1;
        displayMedia();
    });
    mediaContainer.addEventListener('touchstart', event => {
        touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });
    mediaContainer.addEventListener('touchend', event => {
        const distance = event.changedTouches[0].screenX - touchStartX;
        if (Math.abs(distance) < 45 || currentMedia.length < 2) return;
        currentIndex += distance > 0 ? -1 : 1;
        displayMedia();
    }, { passive: true });
    document.addEventListener('keydown', event => {
        if (!lightbox.classList.contains('active')) return;
        if (event.key === 'Escape') closeLightbox();
        if (event.key === 'ArrowLeft') {
            currentIndex -= 1;
            displayMedia();
        }
        if (event.key === 'ArrowRight') {
            currentIndex += 1;
            displayMedia();
        }
    });

    projectLinks.forEach(link => link.addEventListener('click', event => {
        event.preventDefault();
        projectLinks.forEach(item => item.classList.remove('active'));
        link.classList.add('active');
        document.querySelector(link.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));

    window.addEventListener('scroll', () => {
        document.querySelectorAll('.project-card').forEach((card, index) => {
            const bounds = card.getBoundingClientRect();
            const link = document.querySelector(`[data-project="${index + 1}"]`);
            if (link && bounds.top <= 200 && bounds.bottom > 200) {
                projectLinks.forEach(item => item.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    function displayMedia() {
        if (!currentMedia.length) return;
        currentIndex = (currentIndex + currentMedia.length) % currentMedia.length;
        mediaContainer.replaceChildren();
        const media = currentMedia[currentIndex];

        if (media.tagName === 'VIDEO') {
            const video = document.createElement('video');
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            video.preload = 'metadata';
            media.querySelectorAll('source').forEach(source => {
                const newSource = document.createElement('source');
                newSource.src = source.src;
                newSource.type = source.type;
                video.appendChild(newSource);
            });
            mediaContainer.appendChild(video);
        } else {
            const image = document.createElement('img');
            image.src = media.src;
            image.alt = media.alt;
            mediaContainer.appendChild(image);
        }

        generateThumbnails();
        const hasMultiple = currentMedia.length > 1;
        previousButton.style.display = hasMultiple ? 'flex' : 'none';
        nextButton.style.display = hasMultiple ? 'flex' : 'none';
        previousButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex === currentMedia.length - 1;
    }

    function generateThumbnails() {
        thumbnails.replaceChildren();
        currentMedia.forEach((media, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = `lightbox-thumbnail${index === currentIndex ? ' active' : ''}`;
            const image = document.createElement('img');
            image.src = media.tagName === 'VIDEO' ? media.poster : media.src;
            thumbnail.appendChild(image);
            if (media.tagName === 'VIDEO') {
                const icon = document.createElement('div');
                icon.className = 'video-icon-badge';
                icon.textContent = '▶';
                thumbnail.appendChild(icon);
            }
            thumbnail.addEventListener('click', () => {
                currentIndex = index;
                displayMedia();
            });
            thumbnails.appendChild(thumbnail);
        });
        thumbnails.querySelector('.active')?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }

    function stopVideos() {
        mediaContainer.querySelectorAll('video').forEach(video => {
            video.pause();
            video.currentTime = 0;
        });
    }
}
