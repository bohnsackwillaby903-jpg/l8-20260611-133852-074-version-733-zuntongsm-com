(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')));
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    var searchInput = document.querySelector('[data-search-input]');
    var filterGroup = document.querySelector('[data-filter-group]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var filterValue = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        var keyword = normalize(searchInput ? searchInput.value : '');

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search'));
            var type = normalize(card.getAttribute('data-type'));
            var year = normalize(card.getAttribute('data-year'));
            var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchesFilter = filterValue === 'all' || type === normalize(filterValue) || year === normalize(filterValue);

            card.hidden = !(matchesKeyword && matchesFilter);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    if (filterGroup) {
        filterGroup.addEventListener('click', function (event) {
            var button = event.target.closest('[data-filter-value]');

            if (!button) {
                return;
            }

            filterValue = button.getAttribute('data-filter-value');

            filterGroup.querySelectorAll('[data-filter-value]').forEach(function (item) {
                item.classList.toggle('active', item === button);
            });

            applyFilters();
        });
    }
})();
