# 🎮 GameFinder

GameFinder is a full-stack video game search website that uses the IGDB API to search for real video game information.

## Features

- Search for video games
- Real IGDB data
- Game cover images
- Release dates
- Genres
- Platforms
- Ratings
- Loading indicator
- Error handling
- Responsive design
- Netlify serverless backend

## Technologies

- HTML5
- CSS3
- JavaScript
- Netlify Functions
- Twitch OAuth
- IGDB API

## Project Structure

GameFinder/
- public/index.html
- public/style.css
- public/script.js
- netlify/functions/games.js
- netlify.toml
- package.json
- .gitignore
- .env.example
- README.md

## API Authentication

IGDB uses Twitch authentication.

The Twitch Client ID and Client Secret must not be placed in frontend JavaScript or committed to GitHub.

For local development, create a `.env` file:

TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret

For Netlify, add these two values as environment variables in the site's settings.

## Run Locally

Install Netlify CLI:

npm install -g netlify-cli

Log in:

netlify login

Start the project:

netlify dev

Then open the local URL provided by Netlify.

## Deploy to Netlify

1. Push this project to a public GitHub repository.
2. Create a new site on Netlify.
3. Connect the GitHub repository.
4. Set the publish directory to `public`.
5. Set the functions directory to `netlify/functions`.
6. Add:
   - TWITCH_CLIENT_ID
   - TWITCH_CLIENT_SECRET
7. Deploy the site.

## How the App Works

The browser sends a GET request to:

/.netlify/functions/games?search=GAME_NAME

The Netlify Function obtains a Twitch access token, sends an authenticated request to IGDB, and returns the results to the browser.

The Twitch Client Secret remains on the server.

## Assignment Requirements

- Team API: IGDB
- Real API data: Yes
- GET request: Yes
- Interactive feature: Search
- Full-stack: Frontend + Netlify Function
- API credentials protected: Yes
- Deployment: Netlify
- Repository: GitHub
