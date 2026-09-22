export default async function handler(req, res) {
  const { search } = req.query;
  const API_KEY = process.env.GAMEBRAIN_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "API key is missing" });
  }

  try {
    const response = await fetch(
      `https://api.gamebrain.co/v1/games?query=${encodeURIComponent(search || "")}`,
      {
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch data from GameBrain" });
  }
}
