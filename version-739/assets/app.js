function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

ready(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var backTop = document.querySelector("[data-back-top]");

  if (backTop) {
    backTop.addEventListener("click", function (event) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  initHeroSlider();
  initCardFilters();
  initQuickSearchParam();
});

function initHeroSlider() {
  var hero = document.querySelector("[data-hero]");

  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));

  if (slides.length < 2) {
    return;
  }

  var index = 0;
  var timer = null;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === index);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      show(Number(dot.getAttribute("data-hero-dot")) || 0);
      start();
    });
  });

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  start();
}

function initQuickSearchParam() {
  var input = document.querySelector("[data-card-search]");

  if (!input) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get("q");

  if (query) {
    input.value = query;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

function initCardFilters() {
  var panel = document.querySelector("[data-filter-panel]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

  if (!panel || cards.length === 0) {
    return;
  }

  var input = panel.querySelector("[data-card-search]");
  var emptyState = document.querySelector("[data-empty-state]");
  var state = {
    type: "",
    year: "",
    region: ""
  };

  function matchesYear(cardYear, selected) {
    var year = Number(cardYear);

    if (!selected) {
      return true;
    }

    if (selected === "2020-2023") {
      return year >= 2020 && year <= 2023;
    }

    if (selected === "2010-2019") {
      return year >= 2010 && year <= 2019;
    }

    if (selected === "before-2010") {
      return year < 2010;
    }

    return String(year) === selected;
  }

  function apply() {
    var query = input ? input.value.trim().toLowerCase() : "";
    var visible = 0;

    cards.forEach(function (card) {
      var cardText = (card.getAttribute("data-search") || "").toLowerCase();
      var cardType = card.getAttribute("data-type") || "";
      var cardRegion = card.getAttribute("data-region") || "";
      var cardYear = card.getAttribute("data-year") || "";
      var typeOk = !state.type || cardType.indexOf(state.type) !== -1;
      var regionOk = !state.region || cardRegion.indexOf(state.region) !== -1;
      var yearOk = matchesYear(cardYear, state.year);
      var searchOk = !query || cardText.indexOf(query) !== -1;
      var show = typeOk && regionOk && yearOk && searchOk;

      card.hidden = !show;

      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("show", visible === 0);
    }
  }

  if (input) {
    input.addEventListener("input", apply);
  }

  panel.addEventListener("click", function (event) {
    var button = event.target.closest(".filter-chip");

    if (!button) {
      return;
    }

    if (button.hasAttribute("data-filter-type")) {
      state.type = button.getAttribute("data-filter-type") || "";
    }

    if (button.hasAttribute("data-filter-year")) {
      state.year = button.getAttribute("data-filter-year") || "";
    }

    if (button.hasAttribute("data-filter-region")) {
      state.region = button.getAttribute("data-filter-region") || "";
    }

    var group = button.parentElement;

    if (group) {
      Array.prototype.slice.call(group.querySelectorAll(".filter-chip")).forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
    }

    apply();
  });

  apply();
}

function initializePlayer(streamUrl) {
  var video = document.querySelector("[data-movie-video]");
  var layer = document.querySelector("[data-play-layer]");

  if (!video || !streamUrl) {
    return;
  }

  var loaded = false;
  var loading = false;
  var hlsInstance = null;

  function attachSource() {
    if (loaded || loading) {
      return Promise.resolve();
    }

    loading = true;

    return new Promise(function (resolve) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        loaded = true;
        loading = false;
        resolve();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          loaded = true;
          loading = false;
          resolve();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            try {
              hlsInstance.destroy();
            } catch (error) {}
            video.src = streamUrl;
            loaded = true;
            loading = false;
            resolve();
          }
        });
        return;
      }

      video.src = streamUrl;
      loaded = true;
      loading = false;
      resolve();
    });
  }

  function play() {
    attachSource().then(function () {
      if (layer) {
        layer.classList.add("hide");
      }

      var result = video.play();

      if (result && typeof result.catch === "function") {
        result.catch(function () {
          if (layer) {
            layer.classList.remove("hide");
          }
        });
      }
    });
  }

  if (layer) {
    layer.addEventListener("click", play);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener("play", function () {
    if (layer) {
      layer.classList.add("hide");
    }
  });

  video.addEventListener("pause", function () {
    if (layer && video.currentTime === 0) {
      layer.classList.remove("hide");
    }
  });
}
