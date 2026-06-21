var SitePlayer = (function () {
    function init(options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var button = document.getElementById(options.buttonId);
        var url = options.url;
        var hls = null;

        if (!video || !url) {
            return;
        }

        function attach() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }

            video.setAttribute("data-ready", "1");
        }

        function start() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                start();
            });
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });

        attach();
    }

    return {
        init: init
    };
})();
