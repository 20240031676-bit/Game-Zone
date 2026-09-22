const searchForm=document.getElementById("searchForm");
const searchInput=document.getElementById("searchInput");
const gamesContainer=document.getElementById("gamesContainer");
const loading=document.getElementById("loading");
const error=document.getElementById("error");
const resultsTitle=document.getElementById("resultsTitle");
const resultCount=document.getElementById("resultCount");

searchForm.addEventListener("submit",async(e)=>{
  e.preventDefault();
  const term=searchInput.value.trim();
  if(!term){showError("Please enter a game name.");return;}
  await searchGames(term);
});

async function searchGames(term){
  showLoading(true); hideError();
  gamesContainer.innerHTML=""; resultCount.textContent="";
  resultsTitle.textContent=`Results for "${term}"`;
  try{
    const response=await fetch(`/.netlify/functions/games?search=${encodeURIComponent(term)}`);
    const data=await response.json();
    if(!response.ok) throw new Error(data.error||"Unable to retrieve games.");
    const games=Array.isArray(data)?data:(data.results||[]);
    if(!games.length){
      gamesContainer.innerHTML="<p>No games found. Try another search.</p>";
      resultCount.textContent="0 results"; return;
    }
    resultCount.textContent=`${games.length} results`;
    displayGames(games);
  }catch(err){
    console.error(err); showError(err.message||"Something went wrong while searching.");
  }finally{showLoading(false);}
}

function displayGames(games){
  gamesContainer.innerHTML="";
  games.forEach(game=>{
    const card=document.createElement("article");
    card.className="game-card";
    const image=game.image||game.cover?.url||"https://placehold.co/600x800?text=No+Image";
    const platforms=Array.isArray(game.platforms)?game.platforms.map(p=>typeof p==="string"?p:(p.name||"")).join(", "):"Unknown";
    const rating=game.rating?.mean!=null?`${Number(game.rating.mean).toFixed(1)} / 10`:game.rating!=null?`${Number(game.rating).toFixed(1)} / 100`:"Not rated";
    const year=game.year??(game.first_release_date?new Date(game.first_release_date*1000).getFullYear():"Unknown");
    const genre=Array.isArray(game.genres)?game.genres.map(g=>typeof g==="string"?g:(g.name||"")).join(", "):(game.genre||"Unknown");
    const description=game.short_description||game.description||"";
    const link=game.link||game.url||"";
    card.innerHTML=`
      <img src="${escapeHTML(image)}" alt="${escapeHTML(game.name||"Game")}">
      <div class="game-info">
        <h3>${escapeHTML(game.name||"Unknown Game")}</h3>
        <p><strong>Year:</strong> ${escapeHTML(year)}</p>
        <p><strong>Genre:</strong> ${escapeHTML(genre)}</p>
        <p><strong>Platforms:</strong> ${escapeHTML(platforms)}</p>
        <p class="rating">⭐ ${escapeHTML(rating)}</p>
        ${description?`<p>${escapeHTML(description)}</p>`:""}
        ${link?`<a class="game-link" href="${escapeHTML(link)}" target="_blank" rel="noopener">View Game</a>`:""}
      </div>`;
    gamesContainer.appendChild(card);
  });
}

function showLoading(show){loading.classList.toggle("hidden",!show)}
function showError(message){error.textContent=message;error.classList.remove("hidden")}
function hideError(){error.classList.add("hidden")}
function escapeHTML(value){return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}

searchGames("Minecraft");
