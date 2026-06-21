(function () {
    var nav = document.querySelector(".site-nav");
    var toggle = document.querySelector("[data-nav-toggle]");
    if (nav && toggle) {
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length) {
        var activeIndex = 0;
        var showSlide = function (index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });
        showSlide(0);
        window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var filterCards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
    var empty = document.querySelector("[data-empty-state]");
    if (filterInput && filterCards.length) {
        filterInput.addEventListener("input", function () {
            var value = filterInput.value.trim().toLowerCase();
            var visible = 0;
            filterCards.forEach(function (card) {
                var haystack = (card.getAttribute("data-filter-card") || "").toLowerCase();
                var matched = !value || haystack.indexOf(value) !== -1;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        });
    }

    var searchRoot = document.querySelector("[data-search-results]");
    if (searchRoot && window.SEARCH_INDEX) {
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var input = document.querySelector("[data-search-page-input]");
        if (input) {
            input.value = query;
        }
        var sourceItems = window.SEARCH_INDEX;
        var normalized = query.toLowerCase();
        var results = sourceItems.filter(function (item) {
            if (!normalized) {
                return item.home === true;
            }
            return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(" ").toLowerCase().indexOf(normalized) !== -1;
        }).slice(0, 120);
        searchRoot.innerHTML = results.map(function (item) {
            return [
                '<a class="movie-card" href="' + item.url + '">',
                '<figure class="poster-wrap">',
                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">',
                '<span class="poster-overlay"><span class="play-symbol">▶</span></span>',
                '<span class="badge">' + escapeHtml(item.region) + '</span>',
                '<span class="year-badge">' + escapeHtml(item.year) + '</span>',
                '</figure>',
                '<div class="card-body">',
                '<h3 class="card-title line-clamp-2">' + escapeHtml(item.title) + '</h3>',
                '<p class="card-summary line-clamp-2">' + escapeHtml(item.oneLine) + '</p>',
                '<div class="card-meta"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
                '</div>',
                '</a>'
            ].join("");
        }).join("");
        var searchEmpty = document.querySelector("[data-search-empty]");
        if (searchEmpty) {
            searchEmpty.style.display = results.length ? "none" : "block";
        }
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
})();
