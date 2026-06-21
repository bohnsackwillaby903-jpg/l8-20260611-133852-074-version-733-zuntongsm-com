(() => {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
        });
    }

    const carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        let current = 0;
        let timer = null;

        const showSlide = (index) => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        const startTimer = () => {
            timer = window.setInterval(() => {
                showSlide(current + 1);
            }, 5200);
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                window.clearInterval(timer);
                showSlide(index);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    document.querySelectorAll('[data-filter-scope]').forEach((scope) => {
        const searchInput = scope.querySelector('[data-search-input]');
        const regionFilter = scope.querySelector('[data-region-filter]');
        const typeFilter = scope.querySelector('[data-type-filter]');
        const yearFilter = scope.querySelector('[data-year-filter]');
        const emptyState = scope.querySelector('[data-empty-state]');
        const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));

        if (!cards.length) {
            return;
        }

        const applyFilters = () => {
            const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
            const region = regionFilter ? regionFilter.value : '';
            const type = typeFilter ? typeFilter.value : '';
            const year = yearFilter ? yearFilter.value : '';
            let visibleCount = 0;

            cards.forEach((card) => {
                const text = [
                    card.dataset.title || '',
                    card.dataset.region || '',
                    card.dataset.type || '',
                    card.dataset.year || '',
                    card.dataset.tags || ''
                ].join(' ').toLowerCase();

                const matchesKeyword = !keyword || text.includes(keyword);
                const matchesRegion = !region || (card.dataset.region || '').includes(region);
                const matchesType = !type || (card.dataset.type || '').includes(type);
                const matchesYear = !year || card.dataset.year === year;
                const visible = matchesKeyword && matchesRegion && matchesType && matchesYear;

                card.hidden = !visible;
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        };

        [searchInput, regionFilter, typeFilter, yearFilter].forEach((control) => {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
    });

    const playerBox = document.querySelector('.player-box');

    if (playerBox) {
        const video = playerBox.querySelector('video');
        const overlay = playerBox.querySelector('.player-overlay');
        let attached = false;

        const attachStream = () => {
            if (!video || attached) {
                return;
            }

            const stream = video.getAttribute('data-stream');
            if (!stream) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }

            attached = true;
        };

        const playVideo = () => {
            attachStream();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            if (video) {
                video.controls = true;
                const playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(() => {});
                }
            }
        };

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('click', () => {
                if (video.paused) {
                    playVideo();
                }
            });
        }
    }
})();
