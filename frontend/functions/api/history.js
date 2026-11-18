
function jsonResponse(data, status = 200) {
    return Response.json(data, { status });
}

export async function onRequestGet({ request, env }) {
    try {
        const url = new URL(request.url);
        const browserId = url.searchParams.get("browserId");

        if (!browserId) {
            return jsonResponse({ error: "browserId is required" }, 400);
        }

        const { results } = await env.DB.prepare(
            `SELECT id, filename, title, total_pages, analysis_json, created_at
       FROM analysis_history
       WHERE browser_id = ?
       ORDER BY created_at DESC
       LIMIT 50`
        )
            .bind(browserId)
            .all();

        const history = results.map((item) => ({
            id: item.id,
            filename: item.filename,
            title: item.title,
            totalPages: item.total_pages,
            analysis: JSON.parse(item.analysis_json),
            createdAt: item.created_at,
        }));

        return jsonResponse({ history });
    } catch (error) {
        console.error("History retrieval error:", error);
        return jsonResponse({ error: "Failed to retrieve history" }, 500);
    }
}

export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();

        const {
            browserId,
            filename,
            title,
            totalPages,
            analysis,
        } = body;

        if (
            typeof browserId !== "string" ||
            !browserId.trim() ||
            typeof filename !== "string" ||
            !filename.trim() ||
            !analysis ||
            typeof analysis !== "object" ||
            Array.isArray(analysis)
        ) {
            return jsonResponse({ error: "Invalid analysis data" }, 400);
        }

        if (
            totalPages !== undefined &&
            (!Number.isInteger(totalPages) || totalPages < 1)
        ) {
            return jsonResponse({ error: "Invalid totalPages" }, 400);
        }

        const id = crypto.randomUUID();

        await env.DB.prepare(
            `INSERT INTO analysis_history
       (id, browser_id, filename, title, total_pages, analysis_json)
       VALUES (?, ?, ?, ?, ?, ?)`
        )
            .bind(
                id,
                browserId,
                filename.trim(),
                title || null,
                totalPages ?? null,
                JSON.stringify(analysis)
            )
            .run();

        return jsonResponse(
            {
                message: "Analysis saved successfully",
                id,
            },
            201
        );
    } catch (error) {
        console.error("History save error:", error);
        return jsonResponse({ error: "Failed to save analysis" }, 500);
    }
}
