
export async function onRequestDelete({ request, env, params }) {
    try {
        const url = new URL(request.url);
        const browserId = url.searchParams.get("browserId");
        const id = params.id;

        if (!browserId) {
            return Response.json(
                { error: "browserId is required" },
                { status: 400 }
            );
        }

        const result = await env.DB.prepare(
            `DELETE FROM analysis_history
        WHERE id = ? AND browser_id = ?`
        )
            .bind(id, browserId)
            .run();

        if (result.meta.changes === 0) {
            return Response.json(
                { error: "Analysis not found" },
                { status: 404 }
            );
        }

        return Response.json({
            message: "Analysis deleted successfully",
        });
    } catch (error) {
        console.error("History deletion error:", error);

        return Response.json(
            { error: "Failed to delete analysis" },
            { status: 500 }
        );
    }
}
