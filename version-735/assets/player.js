(function () {
    window.startMoviePlayer = function (options) {
        var video = document.querySelector(options.videoSelector);
        var button = document.querySelector(options.buttonSelector);
        var url = options.url;
        var loaded = false;
        var hlsInstance = null;

        if (!video || !button || !url) {
            return;
        }

        function attachStream() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function begin() {
            attachStream();
            button.classList.add("is-hidden");
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        button.addEventListener("click", begin);
        video.addEventListener("click", function () {
            if (video.paused) {
                begin();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
