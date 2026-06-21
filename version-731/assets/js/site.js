(function () {
  var mobileButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  function restartHero() {
    if (heroTimer) {
      window.clearInterval(heroTimer);
    }

    if (slides.length > 1) {
      heroTimer = window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5200);
    }
  }

  var previousButton = document.querySelector('[data-hero-prev]');
  var nextButton = document.querySelector('[data-hero-next]');

  if (previousButton) {
    previousButton.addEventListener('click', function () {
      showSlide(currentSlide - 1);
      restartHero();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      showSlide(currentSlide + 1);
      restartHero();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      restartHero();
    });
  });

  restartHero();

  Array.prototype.slice.call(document.querySelectorAll('[data-scroll-left]')).forEach(function (button) {
    button.addEventListener('click', function () {
      var row = button.closest('.section-block').querySelector('[data-movie-row]');
      if (row) {
        row.scrollBy({ left: -340, behavior: 'smooth' });
      }
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-scroll-right]')).forEach(function (button) {
    button.addEventListener('click', function () {
      var row = button.closest('.section-block').querySelector('[data-movie-row]');
      if (row) {
        row.scrollBy({ left: 340, behavior: 'smooth' });
      }
    });
  });

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters(panel) {
    var list = document.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
    var input = panel.querySelector('[data-filter-input]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var resetButton = panel.querySelector('[data-filter-reset]');
    var yearButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-year]'));
    var empty = panel.querySelector('[data-filter-empty]');
    var activeYear = 'all';

    function apply() {
      var keyword = normalize(input && input.value);
      var typeValue = normalize(typeSelect && typeSelect.value);
      var regionValue = normalize(regionSelect && regionSelect.value);
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' '));
        var typeMatch = !typeValue || typeValue === 'all' || normalize(card.getAttribute('data-type')) === typeValue;
        var regionMatch = !regionValue || regionValue === 'all' || normalize(card.getAttribute('data-region')) === regionValue;
        var yearMatch = activeYear === 'all' || normalize(card.getAttribute('data-year')) === normalize(activeYear);
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        var visible = typeMatch && regionMatch && yearMatch && keywordMatch;

        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', apply);

      try {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
          input.value = q;
        }
      } catch (error) {}
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', apply);
    }

    if (regionSelect) {
      regionSelect.addEventListener('change', apply);
    }

    yearButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeYear = button.getAttribute('data-filter-year') || 'all';
        yearButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (typeSelect) {
          typeSelect.value = 'all';
        }
        if (regionSelect) {
          regionSelect.value = 'all';
        }
        activeYear = 'all';
        yearButtons.forEach(function (item) {
          item.classList.toggle('active', item.getAttribute('data-filter-year') === 'all');
        });
        apply();
      });
    }

    apply();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(setupFilters);

  function setVideoSource(video, src) {
    if (!src) {
      return;
    }

    if (video.getAttribute('src') !== src) {
      video.setAttribute('src', src);
    }
  }

  function initializePlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var message = player.querySelector('[data-player-message]');
    var hlsSource = player.getAttribute('data-hls');
    var mp4Source = player.getAttribute('data-mp4');
    var ready = false;
    var hlsInstance = null;

    if (!video || !button) {
      return;
    }

    function writeMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function attachSource() {
      if (ready) {
        return;
      }

      ready = true;

      if (window.location.protocol === 'file:' && mp4Source) {
        setVideoSource(video, mp4Source);
        return;
      }

      if (hlsSource && video.canPlayType('application/vnd.apple.mpegurl')) {
        setVideoSource(video, hlsSource);
        return;
      }

      if (hlsSource && window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        hlsInstance.loadSource(hlsSource);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && mp4Source) {
            try {
              hlsInstance.destroy();
            } catch (error) {}
            hlsInstance = null;
            setVideoSource(video, mp4Source);
          }
        });
        return;
      }

      setVideoSource(video, mp4Source || hlsSource);
    }

    function playVideo() {
      attachSource();
      player.classList.add('is-playing');
      writeMessage('');

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          player.classList.remove('is-playing');
          writeMessage('点击视频区域继续播放');
        });
      }
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('play', function () {
      player.classList.add('is-playing');
      writeMessage('');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        player.classList.remove('is-playing');
      }
    });
    video.addEventListener('ended', function () {
      player.classList.remove('is-playing');
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-video-player]')).forEach(initializePlayer);
})();
