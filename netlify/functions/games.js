const GAMEBRAIN_URL = "https://api.gamebrain.co/v1/games";

export default async (request) => {
    try {
        // Get the API key securely from Netlify environment variables
        const apiKey = process.env.GAMEBRAIN_API_KEY;

        if (!apiKey) {
            return new Response(
                JSON.stringify({
                    error: "GameBrain API key is not configured."
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        // Get the search term from the URL
        const url = new URL(request.url);
        const search = url.searchParams.get("search") || "Minecraft";

        // Build the GameBrain GET request
        const apiUrl = new URL(GAMEBRAIN_URL);
        apiUrl.searchParams.set("query", search);

        // Request game data from GameBrain
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "x-api-key": apiKey,
                "Accept": "application/json"
            }
        });

        const text = await response.text();

        let data;

        try {
            data = JSON.parse(text);
        } catch {
            data = {
                error: "GameBrain returned an invalid response."
            };
        }

        // Handle GameBrain errors
        if (!response.ok) {
            console.error("GameBrain error:", data);

            return new Response(
                JSON.stringify({
                    error:
                        data.error ||
                        data.message ||
                        "GameBrain request failed."
                }),
                {
                    status: response.status,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        // Send the game data back to the frontend
        return new Response(
            JSON.stringify(data),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "public, max-age=300"
                }
            }
        );

    } catch (error) {
        console.error("Server error:", error);

        return new Response(
            JSON.stringify({
                error: "Server error. Please try again."
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
};
