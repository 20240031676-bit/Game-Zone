# 🎮 GameFinder - GameBrain

A full-stack video game search website using the GameBrain API.

## Features
- Search for video games
- Real GameBrain data
- Game images
- Release year
- Genre
- Platforms
- Ratings
- Descriptions
- Loading and error states
- Responsive design
- Netlify serverless function

## API
GameBrain endpoint:
`GET https://api.gamebrain.co/v1/games?query=GAME_NAME`

Authentication is sent server-side using the `x-api-key` header.

## API Key
Create a `.env` file for local development:

`GAMEBRAIN_API_KEY=your_gamebrain_api_key`

On Netlify, add `GAMEBRAIN_API_KEY` as an environment variable.

Never commit the real API key to GitHub.

## Run Locally
Install Netlify CLI:

`npm install -g netlify-cli`

Then:

`netlify dev`

## Deploy
1. Push this folder to a public GitHub repository.
2. Import the repository into Netlify.
3. Publish directory: `public`
4. Functions directory: `netlify/functions`
5. Add the `GAMEBRAIN_API_KEY` environment variable.
6. Deploy.

## How It Works
The browser sends:

`GET /.netlify/functions/games?search=Minecraft`

The Netlify Function adds the private GameBrain API key and makes a GET request to GameBrain. The results are returned to the browser and displayed as game cards.

## Attribution
Game data is powered by GameBrain.
