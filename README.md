# 🎮 GameZoneMark

GameZoneMark is a full-stack video game search website using the GameBrain API and Vercel serverless functions.

## Features

- Search for video games
- Real GameBrain API data
- Game images
- Release year
- Genre
- Platforms
- Ratings
- Short descriptions
- GameBrain game links
- Loading and error states
- Responsive design
- Private API key stored as a Vercel environment variable

## Project Structure

```text
GameZoneMark/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── api/
│   └── games.js
├── vercel.json
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## How It Works

The browser sends a GET request:

```text
/api/games?search=Minecraft
```

The Vercel serverless function receives the search term, adds the private GameBrain API key, and sends a GET request to:

```text
https://api.gamebrain.co/v1/games?query=Minecraft
```

The GameBrain results are returned to the browser and displayed as game cards.

The API key is never placed in the frontend JavaScript.

## GameBrain API Key

Create a GameBrain API key and add it to Vercel as:

```text
GAMEBRAIN_API_KEY
```

Do not put the real API key in GitHub.

## Deploying to Vercel

1. Push this project to a GitHub repository.
2. Open Vercel and import the repository.
3. Leave the framework preset as the default/Other if Vercel asks.
4. Add this environment variable:

```text
GAMEBRAIN_API_KEY=your_gamebrain_api_key
```

5. Deploy.
6. Open the Vercel production URL.

## Local Development

Install the Vercel CLI:

```bash
npm install -g vercel
```

Log in:

```bash
vercel login
```

Create a local `.env.local` file:

```text
GAMEBRAIN_API_KEY=your_gamebrain_api_key
```

Run:

```bash
vercel dev
```

## Important

The free GameBrain API plan is intended for personal/hobby non-commercial projects and requires a backlink to GameBrain. This project includes a GameBrain link in the footer.

## Assignment Requirements

- Video game API: GameBrain
- Real API data: Yes
- GET request: Yes
- Interactive feature: Search
- Full-stack: Frontend + Vercel serverless function
- API key protection: Yes
- Deployment: Vercel
- GitHub repository: Yes
- README: Yes
