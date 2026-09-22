const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const gamesContainer = document.getElementById("gamesContainer");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const resultsTitle = document.getElementById("resultsTitle");
const resultCount = document.getElementById("resultCount");
const searchSection = document.getElementById("searchSection");
const genrePanel = document.getElementById("genrePanel");
const navIcons = document.querySelectorAll(".nav-icon");

// NEW: Optional Controls Elements (ensure these exist in index.html if used)
const sortSelect = document.getElementById("sortSelect");
const platformFilter = document.getElementById("platformFilter");
const paginationContainer = document.getElementById("paginationContainer");

const GENRES = ["Action", "Adventure", "RPG", "Strategy", "Shooter", "Simulation", "Sports", "Racing", "Puzzle", "Platformer", "Horror", "Indie"];
const HOME_SEEDS = ["Minecraft", "Zelda", "Mario", "Fortnite", "Call of Duty", "Grand Theft Auto", "Overwatch", "Pokemon", "Valorant", "Cyberpunk", "Halo", "FIFA", "Roblox", "Among Us", "League of Legends", "Apex Legends", "Skyrim", "Stardew Valley", "Hollow Knight", "Elden Ring", "Tetris", "Portal", "Terraria", "Fall Guys"];

const STORAGE = {
  FAVORITES: "gz_favorites",
  RECENT_SEARCHES: "gz_recent_searches",
  RECENT_CLICKED: "gz_recent_clicked"
};

const LIMITS = {
  RECENT_SEARCHES: 10,
  RECENT_CLICKED: 20
};

let currentView = "home";

// NEW: Global state for current retrieved games list and pagination
let currentGamesList = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 8;

function pickRandomSeed() {
  return HOME_SEEDS[Math.floor(Math.random() * HOME_SEEDS.length)];
}

function shuffleArray(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function loadHomeGames() {
  searchGames(pickRandomSeed(), "Popular Games", true);
}

/* ---------- storage helpers ---------- */
function readList(key) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

function gameId(game) {
  return game.id != null ? String(game.id) : (game.name || "unknown").toLowerCase().trim();
}

function getFavorites() {
  return readList(STORAGE.FAVORITES);
}

function isFavorite(id) {
  return getFavorites().some(g => gameId(g) === id);
}

function toggleFavorite(game) {
  const id = gameId(game);
  let list = getFavorites();
  if (list.some(g => gameId(g) === id)) {
    list = list.filter(g => gameId(g) !== id);
  } else {
    list = [game, ...list];
  }
  writeList(STORAGE.FAVORITES, list);
  return isFavorite(id);
}

function addRecentSearch(term) {
  if (!term) return;
  let list = readList(STORAGE.RECENT_SEARCHES).filter(t => t.toLowerCase() !== term.toLowerCase());
  list.unshift(term);
  list = list.slice(0, LIMITS.RECENT_SEARCHES);
  writeList(STORAGE.RECENT_SEARCHES, list);
}

function addRecentlyClicked(game) {
  const id = gameId(game);
  let list = readList(STORAGE.RECENT_CLICKED).filter(g => gameId(g) !== id);
  list.unshift(game);
  list = list.slice(0, LIMITS.RECENT_CLICKED);
  writeList(STORAGE.RECENT_CLICKED, list);
}

/* ---------- sidebar navigation ---------- */
navIcons.forEach(btn => {
  btn.addEventListener("click", () => {
    navIcons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    setView(btn.dataset.view);
  });
});

function setView(view) {
  currentView = view;
  hideError();
  searchSection.classList.toggle("hidden", view !== "home");
  genrePanel.classList.toggle("hidden", view !== "genres");
  const extraPanel = document.getElementById("recentSearchPanel");
  if (extraPanel) extraPanel.remove();

  if (view === "home") {
    resultsTitle.textContent = "Popular Games";
    resultCount.textContent = "";
    loadHomeGames();
  } else if (view === "genres") {
    renderGenrePanel();
    resultsTitle.textContent = "Browse by genre";
    resultCount.textContent = "";
    gamesContainer.innerHTML = `<p class="empty-state">Pick a genre above to see matching games.</p>`;
    renderPagination(0);
  } else if (view === "recent") {
    renderRecentSearches();
  } else if (view === "favorites") {
    renderStoredList(getFavorites(), "Favorites", "No favorites yet — tap the heart on a game to save it here.");
  } else if (view === "history") {
    renderStoredList(readList(STORAGE.RECENT_CLICKED), "Recently clicked", "No games clicked yet — open a game and it'll show up here.");
  }
}

function renderGenrePanel() {
  genrePanel.innerHTML = "";
  GENRES.forEach(genre => {
    const chip = document.createElement("button");
    chip.className = "genre-chip";
    chip.type = "button";
    chip.textContent = genre;
    chip.addEventListener("click", () => {
      genrePanel.querySelectorAll(".genre-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      searchGames(genre, `Genre: ${genre}`);
    });
    genrePanel.appendChild(chip);
  });
}

function renderRecentSearches() {
  const terms = readList(STORAGE.RECENT_SEARCHES);
  resultsTitle.textContent = "Recent searches";
  resultCount.textContent = "";
  gamesContainer.innerHTML = "";
  renderPagination(0);
  if (!terms.length) {
    gamesContainer.innerHTML = `<p class="empty-state">No recent searches yet — try finding a game first.</p>`;
    return;
  }
  const wrap = document.createElement("div");
  wrap.className = "genre-panel";
  wrap.id = "recentSearchPanel";
  terms.forEach(term => {
    const chip = document.createElement("button");
    chip.className = "genre-chip";
    chip.type = "button";
    chip.textContent = term;
    chip.addEventListener("click", () => searchGames(term));
    wrap.appendChild(chip);
  });
  gamesContainer.parentElement.insertBefore(wrap, gamesContainer);
}

function renderStoredList(list, title, emptyMessage) {
  resultsTitle.textContent = title;
  resultCount.textContent = list.length ? `${list.length} game${list.length === 1 ? "" : "s"}` : "";
  if (!list.length) {
    gamesContainer.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
    renderPagination(0);
    return;
  }
  processAndDisplayGames(list);
}

/* ---------- search ---------- */
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const term = searchInput.value.trim();
  if (!term) {
    showError("Please enter a game name.");
    return;
  }
  await searchGames(term);
});

async function searchGames(term, titleOverride, shuffleResults) {
  showLoading(true);
  hideError();
  gamesContainer.innerHTML = "";
  resultCount.textContent = "";
  resultsTitle.textContent = titleOverride || `Results for "${term}"`;
  try {
    const response = await fetch(`/api/games?search=${encodeURIComponent(term)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to retrieve games.");
    let games = Array.isArray(data) ? data : (data.results || []);
    if (!games.length) {
      gamesContainer.innerHTML = `<p class="empty-state">No games found. Try another search.</p>`;
      resultCount.textContent = "0 results";
      renderPagination(0);
      return;
    }
    if (shuffleResults) games = shuffleArray(games);
    resultCount.textContent = `${games.length} results`;
    
    // Pass raw results through sorting & pagination pipeline
    processAndDisplayGames(games);
    
    if (currentView === "home" && !titleOverride) addRecentSearch(term);
  } catch (err) {
    console.error(err);
    showError(err.message || "Something went wrong while searching.");
  } finally {
    showLoading(false);
  }
}

/* ---------- processing & display logic ---------- */

// NEW: Processes sorting, platform filtering, and pagination before rendering
function processAndDisplayGames(games, resetPage = true) {
  currentGamesList = games || [];
  if (resetPage) currentPage = 1;

  let processed = [...currentGamesList];

  // Optional Platform Filter
  if (platformFilter && platformFilter.value && platformFilter.value !== "all") {
    const val = platformFilter.value.toLowerCase();
    processed = processed.filter(game => {
      const pStr = Array.isArray(game.platforms) 
        ? game.platforms.map(p => (typeof p === "string" ? p : p.name || "")).join(" ") 
        : String(game.platforms || "");
      return pStr.toLowerCase().includes(val);
    });
  }

  // Optional Sorting
  if (sortSelect && sortSelect.value) {
    const mode = sortSelect.value;
    processed.sort((a, b) => {
      const ratingA = a.rating?.mean ?? a.rating ?? 0;
      const ratingB = b.rating?.mean ?? b.rating ?? 0;
      const yearA = a.year ?? (a.first_release_date ? new Date(a.first_release_date * 1000).getFullYear() : 0);
      const yearB = b.year ?? (b.first_release_date ? new Date(b.first_release_date * 1000).getFullYear() : 0);
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();

      if (mode === "rating-desc") return ratingB - ratingA;
      if (mode === "rating-asc") return ratingA - ratingB;
      if (mode === "year-desc") return yearB - yearA;
      if (mode === "title-asc") return nameA.localeCompare(nameB);
      return 0;
    });
  }

  resultCount.textContent = `${processed.length} results`;

  // Paginate results
  const totalPages = Math.ceil(processed.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = processed.slice(start, start + ITEMS_PER_PAGE);

  displayGames(pageItems);
  renderPagination(totalPages);
}

function displayGames(games) {
  gamesContainer.innerHTML = "";
  games.forEach(game => {
    const card = document.createElement("article");
    card.className = "game-card";
    const id = gameId(game);
    const image = game.image || game.cover?.url || "https://placehold.co/600x800?text=No+Image";
    const platforms = Array.isArray(game.platforms) ? game.platforms.map(p => typeof p === "string" ? p : (p.name || "")).join(", ") : "Unknown";
    const rating = game.rating?.mean != null ? `${Number(game.rating.mean).toFixed(1)} / 10` : game.rating != null ? `${Number(game.rating).toFixed(1)} / 100` : "Not rated";
    const year = game.year ?? (game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : "Unknown");
    const genre = Array.isArray(game.genres) ? game.genres.map(g => typeof g === "string" ? g : (g.name || "")).join(", ") : (game.genre || "Unknown");
    const description = game.short_description || game.description || "";
    const link = safeLink(game.link || game.url || "");

    card.innerHTML = `
      <button class="fav-btn${isFavorite(id) ? " active" : ""}" type="button" aria-label="Toggle favorite">
        <svg viewBox="0 0 24 24" fill="${isFavorite(id) ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7.5-4.6-9.7-9A5.4 5.4 0 0 1 12 6a5.4 5.4 0 0 1 9.7 5c-2.2 4.4-9.7 9-9.7 9Z"/></svg>
      </button>
      <img src="${escapeHTML(image)}" alt="${escapeHTML(game.name || "Game")}">
      <div class="game-info">
        <h3>${escapeHTML(game.name || "Unknown Game")}</h3>
        <p><strong>Year:</strong> ${escapeHTML(year)}</p>
        <p><strong>Genre:</strong> ${escapeHTML(genre)}</p>
        <p><strong>Platforms:</strong> ${escapeHTML(platforms)}</p>
        <p class="rating">⭐ ${escapeHTML(rating)}</p>
        ${description ? `<p>${escapeHTML(description)}</p>` : ""}
        ${link ? `<a class="game-link" href="${escapeHTML(link)}" target="_blank" rel="noopener">View Game</a>` : ""}
      </div>`;

    card.querySelector(".fav-btn").addEventListener("click", () => {
      const nowFav = toggleFavorite(game);
      const btn = card.querySelector(".fav-btn");
      btn.classList.toggle("active", nowFav);
      btn.querySelector("svg").setAttribute("fill", nowFav ? "currentColor" : "none");
      if (currentView === "favorites" && !nowFav) setView("favorites");
    });

    const trackClick = () => addRecentlyClicked(game);
    const linkEl = card.querySelector(".game-link");

    card.addEventListener("click", (e) => {
      if (e.target.closest(".fav-btn")) return; // don't trigger on favorite toggle
      trackClick();
      if (linkEl) window.open(linkEl.href, "_blank", "noopener");
    });

    card.style.cursor = "pointer";
    gamesContainer.appendChild(card);
  });
}

/* ---------- NEW: Pagination Renderer ---------- */
function renderPagination(totalPages) {
  if (!paginationContainer) return;
  paginationContainer.innerHTML = "";
  if (totalPages <= 1) return;

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "◀ Prev";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      processAndDisplayGames(currentGamesList, false);
    }
  });

  const pageInfo = document.createElement("span");
  pageInfo.className = "page-info";
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next ▶";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      processAndDisplayGames(currentGamesList, false);
    }
  });

  paginationContainer.appendChild(prevBtn);
  paginationContainer.appendChild(pageInfo);
  paginationContainer.appendChild(nextBtn);
}

/* ---------- Event listeners for optional sort/filter elements ---------- */
if (sortSelect) {
  sortSelect.addEventListener("change", () => processAndDisplayGames(currentGamesList, true));
}
if (platformFilter) {
  platformFilter.addEventListener("change", () => processAndDisplayGames(currentGamesList, true));
}

function safeLink(raw) {
  if (!raw) return "";
  let str = String(raw).trim();
  if (str.length > 200) return ""; // corrupted API values come back abnormally long
  if (/(.{8,})\1/.test(str)) return ""; // repeated-substring corruption pattern
  if (!/^https?:\/\//i.test(str)) str = "https://" + str;
  try {
    const u = new URL(str);
    if (!/^https?:$/.test(u.protocol)) return "";
    return u.href;
  } catch {
    return "";
  }
}

function showLoading(show) {
  loading.classList.toggle("hidden", !show);
}

function showError(message) {
  error.textContent = message;
  error.classList.remove("hidden");
}

function hideError() {
  error.classList.add("hidden");
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadHomeGames();
