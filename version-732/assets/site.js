(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initSearchForms() {
    var forms = document.querySelectorAll('[data-search-form]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        if (query) {
          window.location.href = './search.html?q=' + encodeURIComponent(query);
        }
      });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initPageFilter() {
    var input = document.querySelector('[data-filter-input]');
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('is-hidden-card', query && text.indexOf(query) === -1);
      });
    });
  }

  function initSearchPage() {
    var form = document.querySelector('[data-search-form-inline]');
    var results = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    var note = document.querySelector('[data-search-note]');
    if (!form || !results || !window.SEARCH_INDEX) {
      return;
    }
    var input = form.querySelector('input[name="q"]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function card(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card" data-movie-card>' +
        '<a class="movie-poster" href="./' + escapeHtml(movie.file) + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="poster-shade"></span>' +
        '<span class="poster-play">▶</span>' +
        '<span class="poster-year">' + escapeHtml(movie.year) + '</span>' +
        '</a>' +
        '<div class="movie-body">' +
        '<a class="movie-title" href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a>' +
        '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
        '<div class="movie-tags">' + tags + '</div>' +
        '</div>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function render(query) {
      var normalized = query.trim().toLowerCase();
      var matches = window.SEARCH_INDEX.filter(function (movie) {
        return !normalized || movie.search.indexOf(normalized) !== -1;
      }).slice(0, 80);
      if (title) {
        title.textContent = normalized ? '搜索结果' : '推荐影片';
      }
      if (note) {
        note.textContent = normalized ? '已按关键词筛选影片入口' : '可通过上方输入框筛选片库内容';
      }
      results.innerHTML = matches.map(card).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input ? input.value.trim() : '';
      var url = './search.html' + (query ? '?q=' + encodeURIComponent(query) : '');
      window.history.replaceState({}, '', url);
      render(query);
    });
    render(initial);
  }

  function initPlayer() {
    var configTag = document.getElementById('player-config');
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-play-cover]');
    if (!configTag || !video) {
      return;
    }
    var config = {};
    try {
      config = JSON.parse(configTag.textContent || '{}');
    } catch (error) {
      config = {};
    }
    var attached = false;
    var hlsInstance = null;

    function attachMedia() {
      if (attached || !config.src) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = config.src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(config.src);
        hlsInstance.attachMedia(video);
      } else {
        video.src = config.src;
      }
    }

    function play() {
      attachMedia();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!attached || video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initNavigation();
    initSearchForms();
    initHero();
    initPageFilter();
    initSearchPage();
    initPlayer();
  });
})();
