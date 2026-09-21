document.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.getElementById('lightbox');
    const lightboxMediaContainer = document.getElementById('lightboxMediaContainer');
    const lightboxThumbnails = document.getElementById('lightboxThumbnails');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const projectLinks = document.querySelectorAll('.project-link');

    let currentProjectMedia = [];
    let currentMediaIndex = 0;

    // Add "more items" badge to third gallery item of each project
    function addMoreBadges() {
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            const galleryItems = card.querySelectorAll('.gallery-item');
            galleryItems.forEach(item => {
                const media = item.querySelector('.gallery-media');
                // Add video icon if it's a video
                if (media && media.tagName === 'VIDEO') {
                    if (!item.querySelector('.video-icon-badge')) {
                        const videoIcon = document.createElement('div');
                        videoIcon.className = 'video-icon-badge';
                        videoIcon.innerHTML = '▶';
                        item.appendChild(videoIcon);
                    }
                }
            });
            
            if (galleryItems.length > 3) {
                const thirdItem = galleryItems[2]; // 3rd item (index 2)
                const moreCount = galleryItems.length - 3;
                
                // Check if badge already exists
                if (!thirdItem.querySelector('.gallery-more-badge')) {
                    const badge = document.createElement('div');
                    badge.className = 'gallery-more-badge';
                    badge.textContent = `+${moreCount} more`;
                    thirdItem.appendChild(badge);
                }
            }
        });
    }

    // Call on page load
    addMoreBadges();

    let touchStartX = 0;

    // Open lightbox when clicking gallery items
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const projectCard = this.closest('.project-card');
            const project = projectCard.querySelector('.project-title').textContent;
            
            // Get all media items from this project (including hidden ones)
            currentProjectMedia = Array.from(projectCard.querySelectorAll('.gallery-media'));
            currentMediaIndex = Array.from(projectCard.querySelectorAll('.gallery-item')).indexOf(this);
            
            displayLightboxMedia();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close lightbox
    lightboxClose.addEventListener('click', function() {
        stopAllVideos();
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
        currentProjectMedia = [];
    });

    // Close lightbox when clicking outside the content
    lightbox.addEventListener('click', function(e) {
        // Close if clicking on the lightbox background (not the content)
        if (e.target === this || e.target.classList.contains('lightbox')) {
            stopAllVideos();
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
            currentProjectMedia = [];
        }
    });

    // Also close on any click outside lightbox-content
    lightbox.addEventListener('mousedown', function(e) {
        if (!e.target.closest('.lightbox-content')) {
            stopAllVideos();
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
            currentProjectMedia = [];
        }
    });

    // Previous button
    lightboxPrev.addEventListener('click', function(e) {
        e.stopPropagation();
        currentMediaIndex = (currentMediaIndex - 1 + currentProjectMedia.length) % currentProjectMedia.length;
        displayLightboxMedia();
    });

    // Next button
    lightboxNext.addEventListener('click', function(e) {
        e.stopPropagation();
        currentMediaIndex = (currentMediaIndex + 1) % currentProjectMedia.length;
        displayLightboxMedia();
    });

    lightboxMediaContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxMediaContainer.addEventListener('touchend', function(e) {
        const distance = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(distance) < 45 || currentProjectMedia.length < 2) return;

        currentMediaIndex = distance > 0
            ? (currentMediaIndex - 1 + currentProjectMedia.length) % currentProjectMedia.length
            : (currentMediaIndex + 1) % currentProjectMedia.length;
        displayLightboxMedia();
    }, { passive: true });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') {
            stopAllVideos();
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
            currentProjectMedia = [];
        } else if (e.key === 'ArrowLeft') {
            currentMediaIndex = (currentMediaIndex - 1 + currentProjectMedia.length) % currentProjectMedia.length;
            displayLightboxMedia();
        } else if (e.key === 'ArrowRight') {
            currentMediaIndex = (currentMediaIndex + 1) % currentProjectMedia.length;
            displayLightboxMedia();
        }
    });

    // Stop all videos in the lightbox
    function stopAllVideos() {
        const videos = lightboxMediaContainer.querySelectorAll('video');
        videos.forEach(video => {
            video.pause();
            video.currentTime = 0;
        });
    }

    // Display media in lightbox
    function displayLightboxMedia() {
        lightboxMediaContainer.innerHTML = '';
        const media = currentProjectMedia[currentMediaIndex];
        
        if (media.tagName === 'VIDEO') {
            const video = document.createElement('video');
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            video.preload = 'metadata';
            
            // Get source elements from original video
            const sources = media.querySelectorAll('source');
            if (sources.length > 0) {
                sources.forEach(source => {
                    const newSource = document.createElement('source');
                    newSource.src = source.src;
                    newSource.type = source.type;
                    video.appendChild(newSource);
                });
            } else {
                // Fallback to src attribute if no source elements
                video.src = media.src;
            }
            
            lightboxMediaContainer.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = media.src;
            img.alt = media.alt;
            lightboxMediaContainer.appendChild(img);
        }
        
        // Generate thumbnails
        generateThumbnails();
        
        // Update button states - disable at the end
        if (currentProjectMedia.length <= 1) {
            lightboxPrev.style.display = 'none';
            lightboxNext.style.display = 'none';
        } else {
            lightboxPrev.style.display = 'flex';
            lightboxNext.style.display = 'flex';
            
            // Disable prev button at start
            if (currentMediaIndex === 0) {
                lightboxPrev.disabled = true;
            } else {
                lightboxPrev.disabled = false;
            }
            
            // Disable next button at end
            if (currentMediaIndex === currentProjectMedia.length - 1) {
                lightboxNext.disabled = true;
            } else {
                lightboxNext.disabled = false;
            }
        }
    }

    // Generate thumbnails for all media
    function generateThumbnails() {
        lightboxThumbnails.innerHTML = '';
        
        currentProjectMedia.forEach((media, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'lightbox-thumbnail';
            if (index === currentMediaIndex) {
                thumbnail.classList.add('active');
            }
            
            if (media.tagName === 'VIDEO') {
                const posterSrc = media.getAttribute('poster') || 'Assets/PortfolioSamplePhotoc.png';
                const img = document.createElement('img');
                img.src = posterSrc;
                thumbnail.appendChild(img);
                
                // Add video play icon badge
                const videoIcon = document.createElement('div');
                videoIcon.className = 'video-icon-badge';
                videoIcon.innerHTML = '▶';
                thumbnail.appendChild(videoIcon);
            } else {
                const img = document.createElement('img');
                img.src = media.src;
                thumbnail.appendChild(img);
            }
            
            // Click on thumbnail to jump to that item
            thumbnail.addEventListener('click', function() {
                currentMediaIndex = index;
                displayLightboxMedia();
            });
            
            lightboxThumbnails.appendChild(thumbnail);
        });
        
        // Auto-scroll to the active thumbnail
        const activeThumbnail = lightboxThumbnails.querySelector('.lightbox-thumbnail.active');
        if (activeThumbnail) {
            // Scroll to center the active thumbnail
            const scrollLeft = activeThumbnail.offsetLeft - (lightboxThumbnails.clientWidth / 2) + (activeThumbnail.clientWidth / 2);
            lightboxThumbnails.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    }

    // Sidebar navigation
    projectLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            projectLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
            
            // Scroll to project
            const projectId = this.getAttribute('href');
            const projectCard = document.querySelector(projectId);
            if (projectCard) {
                projectCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Update active sidebar link based on scroll position
    window.addEventListener('scroll', function() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            const projectLink = document.querySelector(`[data-project="${index + 1}"]`);
            
            if (projectLink && rect.top <= 200 && rect.bottom > 200) {
                projectLinks.forEach(l => l.classList.remove('active'));
                projectLink.classList.add('active');
            }
        });
    });
});
