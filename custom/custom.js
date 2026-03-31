(function () {
  var BACKDROP_CLIPS = [
    { id: "cR3bDauDEuM", start: 18, duration: 10 },
    { id: "yKuQ6GkstgY", start: 11, duration: 10 },
    { id: "Efv8t_pUy9Q", start: 15, duration: 10 },
    { id: "swmDV3uWfNg", start: 14, duration: 10 },
    { id: "Op5pBCUMKLM", start: 12, duration: 10 },
    { id: "XbfkDZSP5Qg", start: 10, duration: 10 },
    { id: "PxU2sMrihl4", start: 11, duration: 10 }
  ];
  var BACKDROP_ROTATE_MS = 7600;

  function removePreloadLock() {
    if (document.body) {
      document.body.classList.remove("nj-preload-lock");
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function clipUrl(clip) {
    var end = clip.start + (clip.duration || 8);
    return (
      "https://www.youtube.com/embed/" +
      clip.id +
      "?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=0&iv_load_policy=3&loop=1&playlist=" +
      clip.id +
      "&start=" +
      clip.start +
      "&end=" +
      end
    );
  }

  function setFrameClip(frame, clip) {
    var iframe = frame.querySelector("iframe");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.setAttribute("title", "Background interview clip");
      iframe.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("loading", "eager");
      iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      frame.appendChild(iframe);
    }

    iframe.src = clipUrl(clip);
  }

  function initBackgroundMontage() {
    var root = document.querySelector(".page-background-video");
    if (!root || prefersReducedMotion()) {
      return;
    }

    if (root.querySelector(".nj-bg-video-wall")) {
      return;
    }

    var wall = document.createElement("div");
    wall.className = "nj-bg-video-wall";

    var frameCount = 3;
    if (window.innerWidth < 720) {
      frameCount = 1;
    } else if (window.innerWidth < 1100) {
      frameCount = 2;
    }

    var frames = [];
    var clipIndex = 0;

    for (var i = 0; i < frameCount; i += 1) {
      var frame = document.createElement("div");
      frame.className = "nj-bg-video-frame";
      setFrameClip(frame, BACKDROP_CLIPS[clipIndex % BACKDROP_CLIPS.length]);
      clipIndex += 1;
      wall.appendChild(frame);
      frames.push(frame);
    }

    root.appendChild(wall);

    if (frames.length < 1) {
      return;
    }

    window.setInterval(function () {
      if (document.hidden) {
        return;
      }

      var frame = frames[clipIndex % frames.length];
      setFrameClip(frame, BACKDROP_CLIPS[clipIndex % BACKDROP_CLIPS.length]);
      clipIndex += 1;
    }, BACKDROP_ROTATE_MS);
  }

  function initReelCarousel() {
    var track = document.querySelector("[data-reel-track]");
    if (!track) return;

    var prev = document.querySelector('[data-reel-nav="prev"]');
    var next = document.querySelector('[data-reel-nav="next"]');

    function cardStep() {
      var card = track.querySelector(".nj-reel-card");
      if (!card) return Math.max(320, Math.round(track.clientWidth * 0.82));
      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
      return Math.round(card.getBoundingClientRect().width + gap);
    }

    function scrollTrack(direction) {
      track.scrollBy({
        left: cardStep() * direction,
        behavior: "smooth"
      });
    }

    function updateNavState() {
      if (!prev || !next) return;
      var max = Math.max(0, track.scrollWidth - track.clientWidth - 2);
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    }

    if (prev) {
      prev.addEventListener("click", function () {
        scrollTrack(-1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        scrollTrack(1);
      });
    }

    track.addEventListener("scroll", updateNavState, { passive: true });
    window.addEventListener("resize", updateNavState);
    updateNavState();

    var launches = track.querySelectorAll(".nj-reel-launch[data-embed]");
    launches.forEach(function (button) {
      button.addEventListener("click", function () {
        var embedUrl = button.getAttribute("data-embed");
        if (!embedUrl) return;

        var frame = document.createElement("iframe");
        frame.className = "nj-reel-iframe";
        frame.setAttribute("src", embedUrl);
        frame.setAttribute("title", button.getAttribute("aria-label") || "Video");
        frame.setAttribute(
          "allow",
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        );
        frame.setAttribute("allowfullscreen", "");
        frame.setAttribute("loading", "lazy");

        var media = button.closest(".nj-reel-media");
        if (!media) return;
        media.innerHTML = "";
        media.appendChild(frame);
      });
    });
  }

  function initRevealAnimations() {
    var selectors = [
      ".nj-hero",
      ".nj-marquee",
      ".nj-proof-card",
      ".nj-cover-gallery",
      ".project-cover",
      ".nj-selected-cuts",
      ".nj-reel-card",
      ".nj-contact-me",
      ".page-header",
      ".project-module",
      ".nj-about-intro",
      ".nj-about-block",
      ".nj-contact-card",
      ".module-content-social_icons"
    ];

    var targets = document.querySelectorAll(selectors.join(","));
    if (!targets.length) return;

    targets.forEach(function (el, i) {
      el.classList.add("nj-reveal");
      el.style.transitionDelay = Math.min(i * 35, 260) + "ms";
    });

    if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
      targets.forEach(function (el) {
        el.classList.add("nj-in");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("nj-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  try {
    var slug = window.location.pathname.replace(/^\/|\/$/g, "") || "home";
    document.body.classList.add("page-" + slug.replace(/\//g, "-"));

    initBackgroundMontage();
    initReelCarousel();
    initRevealAnimations();
    window.setTimeout(removePreloadLock, 80);
  } catch (err) {
    removePreloadLock();
  }
})();
