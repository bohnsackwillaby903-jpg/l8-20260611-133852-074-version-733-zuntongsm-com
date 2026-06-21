(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
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

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    restart();
  }

  function setupCardFilter() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var input = panel.querySelector("[data-card-filter]");
    var type = panel.querySelector("[data-type-filter]");
    var year = panel.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var typeValue = type ? type.value : "";
      var yearValue = year ? year.value : "";
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        var ok = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (typeValue && card.getAttribute("data-type") !== typeValue) {
          ok = false;
        }
        if (yearValue && card.getAttribute("data-year") !== yearValue) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
      });
    }

    [input, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function setupSearchPage() {
    var root = document.querySelector("[data-search-page]");
    if (!root || !window.SITE_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var input = document.querySelector("[data-search-input]");
    var result = document.querySelector("[data-search-results]");
    if (!result) {
      return;
    }
    if (input) {
      input.value = query;
    }

    function card(movie) {
      return '<article class="search-card">' +
        '<a href="' + escapeHtml(movie.url) + '">' +
          '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + ' 在线观看" loading="lazy" />' +
        '</a>' +
        '<div class="search-card-body">' +
          '<h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '</div>' +
      '</article>';
    }

    function render(value) {
      var keyword = String(value || "").trim().toLowerCase();
      var pool = window.SITE_MOVIES;
      var matches = keyword ? pool.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine]
          .join(" ")
          .toLowerCase()
          .indexOf(keyword) !== -1;
      }) : pool.slice(0, 36);
      matches = matches.slice(0, 80);
      if (!matches.length) {
        result.innerHTML = '<div class="empty-state">没有找到匹配内容，请尝试更换关键词。</div>';
        return;
      }
      result.innerHTML = matches.map(card).join("");
    }

    render(query);
    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
  }

  window.initMoviePlayer = function (url) {
    var video = document.querySelector("[data-player]");
    var cover = document.querySelector("[data-player-cover]");
    if (!video) {
      return;
    }
    var attached = false;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        video.hlsPlayer = hls;
      } else {
        video.src = url;
      }
    }

    function start() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
  };

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupCardFilter();
    setupSearchPage();
  });
})();
