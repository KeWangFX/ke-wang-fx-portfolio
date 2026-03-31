const portfolioData = window.portfolioData;
const siteConfig = window.siteConfig || {};

const state = {
  activeFilter: "All",
  videos: [],
  draggedPhotoIndex: null,
  ownerMode: false
};

const q = (selector) => document.querySelector(selector);
const qa = (selector) => [...document.querySelectorAll(selector)];
const assetOverrides = siteConfig.assetOverrides || {};

function assetOverride(path) {
  return assetOverrides[path];
}

function assetUrl(path) {
  const override = assetOverride(path);
  if (override && typeof override === "object") {
    return override.url || path;
  }
  return override || path;
}

function assetMimeType(path, fallbackMimeType) {
  const override = assetOverride(path);
  if (override && typeof override === "object" && override.mimeType) {
    return override.mimeType;
  }
  return fallbackMimeType;
}

function setText(selector, value) {
  const node = q(selector);
  if (node) node.textContent = value;
}

function createElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return map[character];
  });
}

function formatRelativeCount(value, singular, plural) {
  const count = Number(value || 0);
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatDateLabel(dateText) {
  if (!dateText) return "Unknown";

  const date = new Date(`${dateText}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return dateText;

  return date.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric"
  });
}

function formatRegion(code) {
  if (!code || code === "Unknown") return "Unknown";

  try {
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(code) || code;
  } catch (_) {
    return code;
  }
}

function getOwnerMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get("owner") === "1";
}

function getVisitorId() {
  const storageKey = "kw_visitor_id";
  try {
    const existing = window.localStorage.getItem(storageKey);
    if (existing) return existing;

    const created =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `kw-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    window.localStorage.setItem(storageKey, created);
    return created;
  } catch (_) {
    return `kw-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function renderProfile() {
  setText("[data-profile-tagline]", portfolioData.profile.tagline);
  setText("[data-current-role]", portfolioData.profile.currentRole);
  setText("[data-location]", portfolioData.profile.location);
  setText("[data-profile-intro]", portfolioData.profile.intro);
  setText("[data-profile-detail]", portfolioData.profile.detail);

  qa("[data-resume-link]").forEach((link) => {
    link.href = assetUrl(portfolioData.profile.resume);
  });

  qa("[data-youtube-link]").forEach((link) => {
    link.href = portfolioData.profile.youtube;
  });

  const emailLink = q("[data-email-link]");
  if (emailLink) {
    emailLink.href = `mailto:${portfolioData.profile.email}`;
    emailLink.textContent = portfolioData.profile.email;
  }

  qa("[data-linkedin-link]").forEach((link) => {
    link.href = portfolioData.profile.linkedin;
    if (!link.textContent.trim()) {
      link.textContent = "LinkedIn profile";
    }
  });
}

function applyTheme() {
  const root = document.documentElement;
  const backgroundImage =
    (siteConfig.theme && siteConfig.theme.backgroundImage) ||
    portfolioData.hero.backgroundImage;

  root.style.setProperty("--site-background-image", `url("${assetUrl(backgroundImage)}")`);
}

function renderHeroMedia() {
  const grid = q("[data-hero-media-grid]");
  if (!grid) return;

  const selectedWork = portfolioData.work.find((item) =>
    item.filters.includes("Water FX")
  ) || portfolioData.work[0];
  const tutorial = portfolioData.tutorialVideos[0];
  const stageImage = q("[data-hero-stage-image]");

  if (stageImage) {
    stageImage.src = assetUrl(portfolioData.hero.stageImage);
    stageImage.alt = portfolioData.hero.stageAlt;
  }

  grid.innerHTML = `
    <a class="hero-mini-card hero-mini-card-media" href="#work">
      <img src="${assetUrl(selectedWork.poster)}" alt="${selectedWork.title}" loading="lazy" />
      <div class="hero-mini-copy">
        <p class="eyebrow">Selected work</p>
        <h3>${selectedWork.title}</h3>
        <p>${selectedWork.specs}</p>
      </div>
    </a>
    <a class="hero-mini-card hero-mini-card-media" href="#tutorials">
      <img src="${assetUrl(tutorial.poster)}" alt="${tutorial.title}" loading="lazy" />
      <div class="hero-mini-copy">
        <p class="eyebrow">Tutorials</p>
        <h3>${tutorial.title}</h3>
        <p>${tutorial.specs}</p>
      </div>
    </a>
    <article class="hero-mini-card hero-mini-card-copy">
      <p class="eyebrow">Current focus</p>
      <h3>${portfolioData.profile.currentRole}</h3>
      <p>
        Recruiter-ready showreel, direct MP4 playback, tutorial library and
        project clips built for quick review.
      </p>
    </article>
  `;
}

function renderShowreelPlayer() {
  const video = q("[data-showreel-video]");
  const source = q("[data-showreel-source]");

  if (!video || !source) return;

  video.poster = assetUrl(portfolioData.featuredVideo.poster);
  source.src = assetUrl(portfolioData.featuredVideo.video);
  source.type = assetMimeType(
    portfolioData.featuredVideo.video,
    portfolioData.featuredVideo.mimeType || "video/mp4"
  );
  video.load();
}

function renderStats() {
  const list = q("[data-stat-grid]");
  list.innerHTML = "";

  portfolioData.stats.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="stat-label">${item.label}</span>
      <strong class="stat-value">${item.value}</strong>
    `;
    list.appendChild(li);
  });
}

function renderSpecialties() {
  const list = q("[data-specialties]");
  list.innerHTML = "";

  portfolioData.specialties.forEach((item) => {
    list.appendChild(createElement("li", "", item));
  });
}

function renderHighlights() {
  const grid = q("[data-highlight-grid]");
  if (!grid) return;
  grid.innerHTML = "";

  portfolioData.highlights.forEach((item) => {
    const card = createElement("article", "focus-card");
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.body}</p>
    `;
    grid.appendChild(card);
  });
}

function renderProfilePanels() {
  const grid = q("[data-profile-panel-grid]");
  if (!grid) return;
  grid.innerHTML = "";

  portfolioData.profilePanels.forEach((item) => {
    const card = createElement("article", "glass-card profile-panel");
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.body}</p>
    `;
    grid.appendChild(card);
  });
}

function renderFeatured() {
  const item = portfolioData.featuredVideo;
  setText("[data-featured-label]", item.label);
  setText("[data-featured-title]", item.title);
  setText("[data-featured-description]", item.description);
  setText("[data-featured-specs]", item.specs);

  const filters = q("[data-featured-filters]");
  filters.innerHTML = "";
  item.filters.forEach((filter) => {
    filters.appendChild(createElement("li", "", filter));
  });
}

function renderFocusAreas() {
  const grid = q("[data-focus-grid]");
  grid.innerHTML = "";

  portfolioData.focusAreas.forEach((item) => {
    const card = createElement("article", "focus-card");
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.body}</p>
    `;
    grid.appendChild(card);
  });
}

function getFilters() {
  const filterSet = new Set(["All"]);
  portfolioData.work.forEach((item) => {
    item.filters.forEach((filter) => filterSet.add(filter));
  });
  return [...filterSet];
}

function renderFilterBar() {
  const bar = q("[data-filter-bar]");
  bar.innerHTML = "";

  getFilters().forEach((filter) => {
    const chip = createElement("button", "filter-chip", filter);
    chip.type = "button";
    chip.classList.toggle("is-active", filter === state.activeFilter);
    chip.addEventListener("click", () => {
      state.activeFilter = filter;
      renderFilterBar();
      renderWork();
    });
    bar.appendChild(chip);
  });
}

function shouldShowItem(item) {
  return state.activeFilter === "All" || item.filters.includes(state.activeFilter);
}

function mediaCardTemplate(item, actionLabel = "Play clip") {
  return `
    <article class="work-card">
      <button class="work-card-media" type="button" data-open-video="${item.id}">
        <img src="${assetUrl(item.poster)}" alt="${item.title}" loading="lazy" />
        <span class="play-badge">${actionLabel}</span>
      </button>
      <div class="work-card-body">
        <p class="eyebrow">${item.subtitle}</p>
        <h3>${item.title}</h3>
        <p class="meta-line">${item.specs}</p>
        <p>${item.description}</p>
        <ul class="work-tags">
          ${item.tags.map((tag) => `<li>${tag}</li>`).join("")}
        </ul>
      </div>
    </article>
  `;
}

function renderWork() {
  const grid = q("[data-work-grid]");
  const visibleItems = portfolioData.work.filter(shouldShowItem);
  grid.innerHTML = visibleItems.map((item) => mediaCardTemplate(item, "Play clip")).join("");
  bindVideoTriggers();
}

function renderTutorialNotes() {
  const list = q("[data-tutorial-notes]");
  list.innerHTML = "";

  portfolioData.tutorialNotes.forEach((item) => {
    const li = createElement("li", "", item);
    list.appendChild(li);
  });
}

function renderTutorials() {
  const grid = q("[data-tutorial-grid]");
  grid.innerHTML = portfolioData.tutorialVideos
    .map((item) => mediaCardTemplate(item, "Watch tutorial"))
    .join("");
  bindVideoTriggers();
}

function clearFamilyPhotoDragState() {
  const photoGrid = q("[data-family-photo-grid]");
  if (photoGrid) {
    photoGrid.classList.remove("is-drag-active");
  }

  qa("[data-family-photo-grid] .photo-card").forEach((card) => {
    card.classList.remove("is-dragging", "is-drop-target");
    card.setAttribute("aria-grabbed", "false");
  });

  state.draggedPhotoIndex = null;
}

function moveFamilyPhoto(fromIndex, toIndex) {
  const photos = portfolioData.family.photos;

  if (
    !Number.isInteger(fromIndex) ||
    !Number.isInteger(toIndex) ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= photos.length ||
    toIndex > photos.length
  ) {
    return false;
  }

  const insertIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
  if (fromIndex === insertIndex) {
    return false;
  }

  const [movedPhoto] = photos.splice(fromIndex, 1);
  photos.splice(insertIndex, 0, movedPhoto);
  return true;
}

function renderFamilyPhotos() {
  const photoGrid = q("[data-family-photo-grid]");
  if (!photoGrid) return;

  photoGrid.innerHTML = "";

  portfolioData.family.photos.forEach((item, index) => {
    const card = createElement("figure", "photo-card");
    card.dataset.photoIndex = String(index);
    card.draggable = true;
    card.setAttribute("aria-grabbed", "false");
    card.innerHTML = `
      <img src="${assetUrl(item.src)}" alt="${item.alt}" loading="lazy" draggable="false" />
      <figcaption>${item.caption}</figcaption>
    `;
    photoGrid.appendChild(card);
  });
}

function bindFamilyPhotoDragAndDrop() {
  const photoGrid = q("[data-family-photo-grid]");
  if (!photoGrid || photoGrid.dataset.dragBound === "true") return;
  photoGrid.dataset.dragBound = "true";

  const getCard = (target) =>
    target instanceof Element
      ? target.closest("[data-family-photo-grid] .photo-card")
      : null;

  photoGrid.addEventListener("dragstart", (event) => {
    const card = getCard(event.target);
    if (!card) return;

    state.draggedPhotoIndex = Number(card.dataset.photoIndex);
    photoGrid.classList.add("is-drag-active");
    card.classList.add("is-dragging");
    card.setAttribute("aria-grabbed", "true");

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", card.dataset.photoIndex || "");
    }
  });

  photoGrid.addEventListener("dragover", (event) => {
    if (state.draggedPhotoIndex === null) return;

    event.preventDefault();
    const targetCard = getCard(event.target);

    qa("[data-family-photo-grid] .photo-card").forEach((card) => {
      const isDropTarget =
        card === targetCard &&
        Number(card.dataset.photoIndex) !== state.draggedPhotoIndex;
      card.classList.toggle("is-drop-target", isDropTarget);
    });

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  });

  photoGrid.addEventListener("drop", (event) => {
    if (state.draggedPhotoIndex === null) return;

    event.preventDefault();
    const targetCard = getCard(event.target);
    const targetIndex = targetCard
      ? Number(targetCard.dataset.photoIndex)
      : portfolioData.family.photos.length;
    const moved = moveFamilyPhoto(state.draggedPhotoIndex, targetIndex);

    clearFamilyPhotoDragState();

    if (moved) {
      renderFamilyPhotos();
    }
  });

  photoGrid.addEventListener("dragend", clearFamilyPhotoDragState);
  photoGrid.addEventListener("dragleave", (event) => {
    const targetCard = getCard(event.target);
    if (!targetCard || targetCard.contains(event.relatedTarget)) return;
    targetCard.classList.remove("is-drop-target");
  });
}

function renderFamily() {
  setText("[data-family-title]", portfolioData.family.title);
  setText("[data-family-intro]", portfolioData.family.intro);

  const videoGrid = q("[data-family-video-grid]");
  videoGrid.innerHTML = portfolioData.family.videos
    .map((item) => mediaCardTemplate(item, "Play moment"))
    .join("");

  renderFamilyPhotos();
  bindVideoTriggers();
  bindFamilyPhotoDragAndDrop();
}

function renderExperience() {
  const timeline = q("[data-experience-timeline]");
  timeline.innerHTML = "";

  portfolioData.experience.forEach((item) => {
    const row = createElement("article", "timeline-item");
    const tags = (item.tags || [])
      .map((tag) => `<li>${escapeHtml(tag)}</li>`)
      .join("");
    const companyLine = [item.company, item.type].filter(Boolean).join(" - ");
    const metaLine = [item.period, item.location].filter(Boolean).join(" - ");
    row.innerHTML = `
      <div class="timeline-period">${item.period}</div>
      <div class="timeline-copy">
        <h3>${item.role}</h3>
        <p class="timeline-company">${companyLine}</p>
        <p class="timeline-meta">${metaLine}</p>
        <p>${item.summary}</p>
        ${tags ? `<ul class="work-tags timeline-tags">${tags}</ul>` : ""}
      </div>
    `;
    timeline.appendChild(row);
  });
}

function renderCredits() {
  const strip = q("[data-credits-strip]");
  strip.innerHTML = "";

  portfolioData.credits.forEach((item) => {
    strip.appendChild(createElement("span", "", item));
  });
}

function buildVideoState() {
  state.videos = [
    portfolioData.featuredVideo,
    ...portfolioData.work,
    ...portfolioData.tutorialVideos,
    ...portfolioData.family.videos
  ];
}

function findVideoById(id) {
  return state.videos.find((item) => item.id === id);
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainder = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      remainder
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function toggleVideoPlayback(video) {
  if (!video) return;

  if (video.paused) {
    video.play().catch(() => {});
  } else {
    video.pause();
  }
}

function syncPlayer(root) {
  if (!root) return;

  const video = root.querySelector("[data-player-video]");
  const scrubber = root.querySelector("[data-player-scrub]");
  const current = root.querySelector("[data-player-current]");
  const duration = root.querySelector("[data-player-duration]");
  const muteButton = root.querySelector("[data-player-mute]");
  const toggles = [...root.querySelectorAll("[data-player-toggle]")];

  if (!video) return;

  const hasDuration = Number.isFinite(video.duration) && video.duration > 0;
  const progress = hasDuration ? (video.currentTime / video.duration) * 1000 : 0;

  if (scrubber) {
    scrubber.disabled = !hasDuration;
    scrubber.value = String(Math.round(progress));
  }

  if (current) {
    current.textContent = formatTime(video.currentTime);
  }

  if (duration) {
    duration.textContent = formatTime(video.duration);
  }

  toggles.forEach((button) => {
    button.textContent = video.paused ? "Play" : "Pause";
  });

  if (muteButton) {
    muteButton.textContent = video.muted || video.volume === 0 ? "Unmute" : "Mute";
  }

  root.classList.toggle("is-playing", !video.paused);
}

function bindPlayers() {
  qa("[data-player]").forEach((root) => {
    if (root.dataset.bound === "true") return;
    root.dataset.bound = "true";

    const video = root.querySelector("[data-player-video]");
    const scrubber = root.querySelector("[data-player-scrub]");
    const frame = root.querySelector(".player-frame") || root;

    if (!video) return;

    root.querySelectorAll("[data-player-toggle]").forEach((button) => {
      button.addEventListener("click", () => toggleVideoPlayback(video));
    });

    root.querySelectorAll("[data-player-skip]").forEach((button) => {
      button.addEventListener("click", () => {
        const skip = Number(button.dataset.playerSkip || 0);
        const nextTime = Math.min(
          Math.max(video.currentTime + skip, 0),
          Number.isFinite(video.duration) ? video.duration : video.currentTime + skip
        );
        video.currentTime = nextTime;
        syncPlayer(root);
      });
    });

    const muteButton = root.querySelector("[data-player-mute]");
    if (muteButton) {
      muteButton.addEventListener("click", () => {
        video.muted = !video.muted;
        syncPlayer(root);
      });
    }

    const fullscreenButton = root.querySelector("[data-player-fullscreen]");
    if (fullscreenButton) {
      fullscreenButton.addEventListener("click", async () => {
        try {
          if (document.fullscreenElement) {
            await document.exitFullscreen();
            return;
          }

          if (frame.requestFullscreen) {
            await frame.requestFullscreen();
            return;
          }

          if (video.webkitEnterFullscreen) {
            video.webkitEnterFullscreen();
          }
        } catch (_) {}
      });
    }

    if (scrubber) {
      scrubber.addEventListener("input", () => {
        if (!Number.isFinite(video.duration) || video.duration <= 0) return;
        video.currentTime = (Number(scrubber.value) / 1000) * video.duration;
        syncPlayer(root);
      });
    }

    [
      "loadedmetadata",
      "durationchange",
      "timeupdate",
      "play",
      "pause",
      "volumechange",
      "ended"
    ].forEach((eventName) => {
      video.addEventListener(eventName, () => syncPlayer(root));
    });

    syncPlayer(root);
  });
}

function openVideo(id) {
  const item = findVideoById(id);
  if (!item) return;

  const modal = q("[data-video-modal]");
  const source = q("#video-modal-source");
  const video = q(".modal-video");

  q("#video-modal-type").textContent = item.subtitle || item.label || item.project || "Project clip";
  q("#video-modal-title").textContent = item.title;
  q("#video-modal-description").textContent = item.description;
  q("#video-modal-specs").textContent = item.specs;

  video.poster = assetUrl(item.poster);
  source.src = assetUrl(item.video);
  source.type = assetMimeType(item.video, item.mimeType || "video/mp4");
  video.currentTime = 0;
  video.load();

  modal.hidden = false;
  document.body.style.overflow = "hidden";
  syncPlayer(video.closest("[data-player]"));
  video.play().catch(() => {});
}

function closeVideo() {
  const modal = q("[data-video-modal]");
  const video = q(".modal-video");
  const source = q("#video-modal-source");

  video.pause();
  source.src = "";
  source.type = "video/mp4";
  video.load();
  modal.hidden = true;
  document.body.style.overflow = "";
  syncPlayer(video.closest("[data-player]"));
}

function bindVideoTriggers() {
  qa("[data-open-video]").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => openVideo(button.dataset.openVideo));
  });
}

function bindModalClose() {
  qa("[data-close-video]").forEach((node) => {
    node.addEventListener("click", closeVideo);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !q("[data-video-modal]").hidden) {
      closeVideo();
    }
  });
}

function bindReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  qa(".reveal").forEach((section) => observer.observe(section));
}

function setInsightsStatus(message, isError = false) {
  const status = q("[data-insights-status]");
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("is-error", isError);
}

function renderInsightsOwnerMode() {
  const insightsSection = q("[data-insights-section]");
  const ownerNav = q("[data-owner-nav]");
  state.ownerMode = getOwnerMode();

  if (!insightsSection || !ownerNav) return;

  insightsSection.hidden = !state.ownerMode;
  ownerNav.hidden = !state.ownerMode;

  if (state.ownerMode) {
    setInsightsStatus(portfolioData.analytics.note);
  }
}

function renderInsightsList(selector, items, formatter) {
  const container = q(selector);
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="insights-empty">No data yet. Visit the site from another device or share the public link.</div>
    `;
    return;
  }

  container.innerHTML = items
    .map((item) => {
      const label = formatter ? formatter(item) : item.label;
      const value = item.value ?? item.views ?? item.visitors ?? 0;
      return `
        <div class="insights-list-item">
          <span>${escapeHtml(label)}</span>
          <strong>${value}</strong>
        </div>
      `;
    })
    .join("");
}

function renderInsightsSummary(data) {
  const summary = q("[data-insights-summary]");
  if (!summary) return;

  summary.innerHTML = `
    <article class="glass-card insights-summary-card">
      <span class="stat-label">Unique visitors, 24h</span>
      <strong class="stat-value">${data.summary.uniqueVisitors24h}</strong>
      <p>${formatRelativeCount(data.summary.uniqueVisitors24h, "visitor", "visitors")}</p>
    </article>
    <article class="glass-card insights-summary-card">
      <span class="stat-label">Page views, 24h</span>
      <strong class="stat-value">${data.summary.pageViews24h}</strong>
      <p>${formatRelativeCount(data.summary.pageViews24h, "page view", "page views")}</p>
    </article>
    <article class="glass-card insights-summary-card">
      <span class="stat-label">Unique visitors, 7d</span>
      <strong class="stat-value">${data.summary.uniqueVisitors7d}</strong>
      <p>${formatRelativeCount(data.summary.uniqueVisitors7d, "visitor", "visitors")}</p>
    </article>
    <article class="glass-card insights-summary-card">
      <span class="stat-label">Page views, 7d</span>
      <strong class="stat-value">${data.summary.pageViews7d}</strong>
      <p>${formatRelativeCount(data.summary.pageViews7d, "page view", "page views")}</p>
    </article>
  `;
}

function renderInsightsDaily(items) {
  const container = q("[data-insights-daily]");
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="insights-empty">Daily analytics will appear here after visits are tracked.</div>
    `;
    return;
  }

  const maxViews = Math.max(...items.map((item) => Number(item.views || 0)), 1);
  container.innerHTML = items
    .map((item) => {
      const width = Math.max(8, Math.round((Number(item.views || 0) / maxViews) * 100));
      return `
        <div class="insights-day-row">
          <div class="insights-day-copy">
            <span>${formatDateLabel(item.day)}</span>
            <small>${item.visitors} visitors</small>
          </div>
          <div class="insights-day-bar">
            <span style="width: ${width}%"></span>
          </div>
          <strong>${item.views}</strong>
        </div>
      `;
    })
    .join("");
}

async function loadInsights() {
  if (!state.ownerMode) return;

  try {
    setInsightsStatus("Refreshing analytics...");
    const response = await fetch("/api/analytics", {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Analytics request failed with ${response.status}`);
    }

    const payload = await response.json();
    renderInsightsSummary(payload);
    renderInsightsDaily(payload.daily);
    renderInsightsList("[data-insights-sources]", payload.sources, (item) => item.label);
    renderInsightsList("[data-insights-countries]", payload.countries, (item) =>
      formatRegion(item.label)
    );
    renderInsightsList("[data-insights-pages]", payload.pages, (item) => item.label);
    renderInsightsList("[data-insights-devices]", payload.devices, (item) => item.label);

    const trackedSince = payload.trackedSince
      ? `Tracking since ${payload.trackedSince}. ${portfolioData.analytics.note}`
      : portfolioData.analytics.note;
    setInsightsStatus(trackedSince);
  } catch (error) {
    setInsightsStatus(
      "Analytics is not available in local preview yet. Use the published Pages site with ?owner=1 to view live data.",
      true
    );
  }
}

async function trackVisit() {
  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") return;
  if (window.location.search.includes("owner=1")) return;
  if (navigator.doNotTrack === "1") return;

  const payload = {
    visitorId: getVisitorId(),
    path: window.location.pathname,
    referrer: document.referrer || "",
    language: navigator.language || "",
    screenWidth: window.screen ? window.screen.width : null
  };

  try {
    await fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      keepalive: true
    });
  } catch (_) {}
}

function bindInsightsRefresh() {
  qa("[data-refresh-insights]").forEach((button) => {
    button.addEventListener("click", () => {
      loadInsights();
    });
  });
}

function init() {
  buildVideoState();
  applyTheme();
  renderProfile();
  renderHeroMedia();
  renderShowreelPlayer();
  renderStats();
  renderSpecialties();
  renderHighlights();
  renderProfilePanels();
  renderFeatured();
  renderFocusAreas();
  renderFilterBar();
  renderWork();
  renderTutorialNotes();
  renderTutorials();
  renderFamily();
  renderExperience();
  renderInsightsOwnerMode();
  renderCredits();
  bindPlayers();
  bindModalClose();
  bindInsightsRefresh();
  bindReveal();
  trackVisit();
  loadInsights();
}

init();
