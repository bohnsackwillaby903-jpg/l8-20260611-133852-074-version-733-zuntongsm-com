(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function applyImageFallback() {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-missing");
      });
    });
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector(".hero-carousel");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var root = document.querySelector(panel.getAttribute("data-filter-panel"));
      if (!root) {
        return;
      }
      var input = panel.querySelector("[data-filter-text]");
      var year = panel.querySelector("[data-filter-year]");
      var type = panel.querySelector("[data-filter-type]");
      var reset = panel.querySelector("[data-filter-reset]");
      var empty = document.querySelector(panel.getAttribute("data-empty-target"));
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));

      function run() {
        var q = normalize(input ? input.value : "");
        var y = normalize(year ? year.value : "");
        var t = normalize(type ? type.value : "");
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-category")
          ].join(" "));
          var matchText = !q || haystack.indexOf(q) !== -1;
          var matchYear = !y || normalize(card.getAttribute("data-year")) === y;
          var matchType = !t || normalize(card.getAttribute("data-type")).indexOf(t) !== -1;
          var show = matchText && matchYear && matchType;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [input, year, type].forEach(function (node) {
        if (node) {
          node.addEventListener("input", run);
          node.addEventListener("change", run);
        }
      });
      if (reset) {
        reset.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (year) {
            year.value = "";
          }
          if (type) {
            type.value = "";
          }
          run();
        });
      }
      run();
    });
  }

  function setupSearchPage() {
    var searchInput = document.querySelector("[data-search-page-input]");
    if (!searchInput) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    searchInput.value = q;
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function loadHlsScript(done) {
    if (window.Hls) {
      done();
      return;
    }
    var existing = document.querySelector("script[data-hls-loader]");
    if (existing) {
      existing.addEventListener("load", done, { once: true });
      existing.addEventListener("error", done, { once: true });
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
    script.async = true;
    script.setAttribute("data-hls-loader", "1");
    script.addEventListener("load", done, { once: true });
    script.addEventListener("error", done, { once: true });
    document.head.appendChild(script);
  }

  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    if (!video || !button || !options.source) {
      return;
    }
    var attached = false;
    var hls = null;

    function attach(done) {
      if (attached) {
        done();
        return;
      }
      attached = true;
      var src = options.source;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        done();
        return;
      }
      loadHlsScript(function () {
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ maxBufferLength: 30 });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            done();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              try {
                hls.destroy();
              } catch (error) {}
              video.src = src;
            }
          });
        } else {
          video.src = src;
          done();
        }
      });
    }

    function play() {
      button.classList.add("is-hidden");
      attach(function () {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      });
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0) {
        button.classList.remove("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    applyImageFallback();
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
