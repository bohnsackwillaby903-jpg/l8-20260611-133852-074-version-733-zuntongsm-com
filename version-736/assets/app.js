function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

ready(function () {
  var toggle = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  initHeroCarousel();
  initFilters();
  applySearchQuery();
});

function initHeroCarousel() {
  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));

  if (!slides.length) {
    return;
  }

  var index = slides.findIndex(function (slide) {
    return slide.classList.contains("active");
  });

  if (index < 0) {
    index = 0;
  }

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === index);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === index);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      show(dotIndex);
    });
  });

  setInterval(function () {
    show(index + 1);
  }, 6200);
}

function initFilters() {
  var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));

  panels.forEach(function (panel) {
    var input = panel.querySelector("[data-filter-input]");
    var section = panel.closest(".content-section") || document;
    var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
    var chips = Array.prototype.slice.call(panel.querySelectorAll(".filter-chip"));
    var activeValue = "all";

    function update() {
      var query = input ? input.value.trim().toLowerCase() : "";

      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        var matchText = !query || haystack.indexOf(query) !== -1;
        var matchChip = activeValue === "all" || haystack.indexOf(activeValue.toLowerCase()) !== -1;
        card.classList.toggle("hidden-card", !(matchText && matchChip));
      });
    }

    if (input) {
      input.addEventListener("input", update);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeValue = chip.getAttribute("data-filter-value") || "all";
        chips.forEach(function (item) {
          item.classList.toggle("active", item === chip);
        });
        update();
      });
    });
  });
}

function applySearchQuery() {
  var input = document.querySelector(".filter-input");

  if (!input) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get("q");

  if (query) {
    input.value = query;
    input.dispatchEvent(new Event("input"));
  }
}

function initMoviePlayer(videoId, sourceUrl, overlayId) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var hlsInstance = null;
  var loaded = false;
  var pendingPlay = false;

  if (!video || !sourceUrl) {
    return;
  }

  function attemptPlay() {
    var attempt = video.play();

    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {});
    }
  }

  function loadSource() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      video.load();
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (pendingPlay) {
          attemptPlay();
        }
      });
    } else {
      video.src = sourceUrl;
      video.load();
    }
  }

  function playVideo() {
    pendingPlay = true;
    loadSource();

    if (overlay) {
      overlay.classList.add("hidden");
    }

    attemptPlay();
  }

  if (overlay) {
    overlay.addEventListener("click", playVideo);
  }

  video.addEventListener("loadedmetadata", function () {
    if (pendingPlay) {
      attemptPlay();
    }
  });

  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
