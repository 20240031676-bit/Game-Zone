const IGDB_URL = "https://api.igdb.com/v4/games";
const TOKEN_URL = "https://id.twitch.tv/oauth2/token";

async function getAccessToken() {
    const params = new URLSearchParams({
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: "client_credentials"
    });

    const response = await fetch(`${TOKEN_URL}?${params.toString()}`);

    if (!response.ok) {
        throw new Error("Unable to authenticate with Twitch.");
    }

    return response.json();
}

export default async (request) => {
    try {
        const url = new URL(request.url);
        const search = url.searchParams.get("search") || "Minecraft";

        if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
            return new Response(
                JSON.stringify({ error: "Server credentials are not configured." }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        const tokenData = await getAccessToken();

        const safeSearch = search.replace(/\/g, "\\").replace(/"/g, '\"');

        const query = `
            search "${safeSearch}";
            fields
                name,
                cover.url,
                first_release_date,
                rating,
                genres.name,
                platforms.name;
            limit 20;
        `;

        const response = await fetch(IGDB_URL, {
            method: "POST",
            headers: {
                "Client-ID": process.env.TWITCH_CLIENT_ID,
                "Authorization": `Bearer ${tokenData.access_token}`,
                "Content-Type": "text/plain"
            },
            body: query
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("IGDB error:", errorText);

            return new Response(
                JSON.stringify({ error: "IGDB request failed." }),
                {
                    status: response.status,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        const games = await response.json();

        return new Response(JSON.stringify(games), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=300"
            }
        });
    } catch (error) {
        console.error("Server error:", error);

        return new Response(
            JSON.stringify({ error: "Server error. Please try again." }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
};
