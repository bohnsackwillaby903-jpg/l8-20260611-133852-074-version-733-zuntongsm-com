(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (slides.length > 1) {
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    restart();
                });
            });
            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    restart();
                });
            }
            restart();
        }
    }

    var jumpSearch = document.querySelector("[data-jump-search]");

    if (jumpSearch) {
        jumpSearch.addEventListener("submit", function (event) {
            var input = jumpSearch.querySelector("input[name='q']");
            if (input && input.value.trim()) {
                event.preventDefault();
                window.location.href = "library.html?q=" + encodeURIComponent(input.value.trim());
            }
        });
    }

    var filterInput = document.querySelector("[data-filter-input]");

    if (filterInput) {
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";

        function applyFilter(value) {
            var query = value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                card.classList.toggle("hidden-card", query && text.indexOf(query) === -1);
            });
        }

        if (initial) {
            filterInput.value = initial;
            applyFilter(initial);
        }

        filterInput.addEventListener("input", function () {
            applyFilter(filterInput.value);
        });
    }
})();
