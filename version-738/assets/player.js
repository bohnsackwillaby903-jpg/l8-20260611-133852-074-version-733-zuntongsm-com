function initMoviePlayer(source) {
    var player = document.querySelector('[data-player]');
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-start]');
    var message = document.querySelector('[data-player-message]');
    var initialized = false;
    var hls = null;

    if (!player || !video || !cover || !source) {
        return;
    }

    function setMessage(text) {
        if (message) {
            message.textContent = text || '';
        }
    }

    function attachSource() {
        if (initialized) {
            return;
        }

        initialized = true;

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);

            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                    setMessage('正在重新连接播放');
                    return;
                }

                if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                    setMessage('正在恢复播放');
                    return;
                }

                setMessage('暂时无法播放，请稍后再试');
                hls.destroy();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            video.src = source;
        }
    }

    function startPlayback() {
        attachSource();
        cover.classList.add('is-hidden');
        video.controls = true;
        setMessage('');

        var playback = video.play();

        if (playback && playback.catch) {
            playback.catch(function () {
                setMessage('点击视频继续播放');
            });
        }
    }

    cover.addEventListener('click', startPlayback);

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener('play', function () {
        cover.classList.add('is-hidden');
        setMessage('');
    });
}
