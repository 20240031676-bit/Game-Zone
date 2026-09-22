const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const gamesContainer = document.getElementById("gamesContainer");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const resultsTitle = document.getElementById("resultsTitle");
const resultCount = document.getElementById("resultCount");

searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const searchTerm = searchInput.value.trim();

    if (!searchTerm) {
        showError("Please enter a game name.");
        return;
    }

    await searchGames(searchTerm);
});

async function searchGames(searchTerm) {
    showLoading(true);
    hideError();
    gamesContainer.innerHTML = "";
    resultCount.textContent = "";
    resultsTitle.textContent = `Results for "${searchTerm}"`;

    try {
        const response = await fetch(
            `/.netlify/functions/games?search=${encodeURIComponent(searchTerm)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to retrieve games.");
        }

        if (!data.length) {
            gamesContainer.innerHTML = "<p>No games found. Try another search.</p>";
            resultCount.textContent = "0 results";
            return;
        }

        resultCount.textContent = `${data.length} results`;
        displayGames(data);
    } catch (err) {
        console.error(err);
        showError("Something went wrong while searching. Please try again.");
    } finally {
        showLoading(false);
    }
}

function displayGames(games) {
    gamesContainer.innerHTML = "";

    games.forEach((game) => {
        const card = document.createElement("article");
        card.className = "game-card";

        const image = game.cover?.url
            ? `https:${game.cover.url.replace("t_thumb", "t_cover_big")}`
            : "https://placehold.co/264x352?text=No+Image";

        const genres = game.genres?.length
            ? game.genres.map((genre) => genre.name).join(", ")
            : "Unknown";

        const platforms = game.platforms?.length
            ? game.platforms.map((platform) => platform.name).join(", ")
            : "Unknown";

        const releaseDate = game.first_release_date
            ? new Date(game.first_release_date * 1000).toLocaleDateString()
            : "Unknown";

        const rating = Number.isFinite(game.rating)
            ? `${game.rating.toFixed(1)} / 100`
            : "Not rated";

        card.innerHTML = `
            <img src="${image}" alt="${escapeHTML(game.name || "Game")}">
            <div class="game-info">
                <h3>${escapeHTML(game.name || "Unknown Game")}</h3>
                <p><strong>Release:</strong> ${releaseDate}</p>
                <p><strong>Genre:</strong> ${escapeHTML(genres)}</p>
                <p><strong>Platform:</strong> ${escapeHTML(platforms)}</p>
                <p class="rating">⭐ ${rating}</p>
            </div>
        `;

        gamesContainer.appendChild(card);
    });
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

// Initial search
searchGames("Minecraft");
