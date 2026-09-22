// Example Server Endpoint Fix
export default async function handler(req, res) {
  const { search } = req.query;

  try {
    const apiRes = await fetch(`https://api.gamebrain.co/v1/games?query=${encodeURIComponent(search)}`, {
      headers: {
        'x-api-key': process.env.GAMEBRAIN_API_KEY // Ensure key is set
      }
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      console.error("GameBrain Error Status:", apiRes.status, errorText);
      return res.status(apiRes.status).json({ 
        error: `GameBrain API responded with status ${apiRes.status}` 
      });
    }

    const data = await apiRes.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("Server fetch error:", err);
    return res.status(500).json({ error: "Failed to connect to GameBrain API" });
  }
}// Example Server Endpoint Fix
export default async function handler(req, res) {
  const { search } = req.query;

  try {
    const apiRes = await fetch(`https://api.gamebrain.co/v1/games?query=${encodeURIComponent(search)}`, {
      headers: {
        'x-api-key': process.env.GAMEBRAIN_API_KEY // Ensure key is set
      }
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      console.error("GameBrain Error Status:", apiRes.status, errorText);
      return res.status(apiRes.status).json({ 
        error: `GameBrain API responded with status ${apiRes.status}` 
      });
    }

    const data = await apiRes.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("Server fetch error:", err);
    return res.status(500).json({ error: "Failed to connect to GameBrain API" });
  }
}
