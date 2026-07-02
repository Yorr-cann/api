const router = async (req, res) => {
    const url = new URL(req.url, "http://" + req.headers.host);
    const path = url.pathname;
    const params = Object.fromEntries(url.searchParams);

    if (path === "/api/xvid" && req.method === "GET") {
        const page = parseInt(params.page) || 1;
        const all = params.all;
        const totalPages = 125;
        const allVideos = [];

        try {
            if (all === "true") {
                const batchSize = 10;
                for (let i = 1; i <= totalPages; i += batchSize) {
                    const batch = [];
                    for (let j = i; j < i + batchSize && j <= totalPages; j++) {
                        batch.push(j);
                    }
                    const results = await Promise.all(batch.map(async (p) => {
                        try {
                            const response = await fetch("https://xvip.rgan.biz.id/api/total?page=" + p + "&q=", {
                                headers: {
                                    "Accept": "application/json",
                                    "User-Agent": "Mozilla/5.0"
                                }
                            });
                            const data = await response.json();
                            if (data && data.items && Array.isArray(data.items)) return data.items;
                            if (data && data.result && Array.isArray(data.result)) return data.result;
                            return [];
                        } catch (e) {
                            return [];
                        }
                    }));
                    allVideos.push(...results.flat());
                }
                res.writeHead(200, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({
                    success: true,
                    total: allVideos.length,
                    pages: totalPages,
                    data: allVideos
                }));
            }

            const response = await fetch("https://xvip.rgan.biz.id/api/total?page=" + page + "&q=", {
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "Mozilla/5.0"
                }
            });
            const data = await response.json();
            const items = data.items || data.result || [];

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
                success: true,
                page: page,
                total: data.total || items.length,
                pages: data.pages || totalPages,
                perPage: data.perPage || items.length,
                data: items
            }));

        } catch (e) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: e.message }));
        }

        return;
    }

    if (path === "/api/xvid/random" && req.method === "GET") {
        const limit = parseInt(params.limit) || 10;
        const maxPage = 125;
        const randomPage = Math.floor(Math.random() * maxPage) + 1;

        try {
            const response = await fetch("https://xvip.rgan.biz.id/api/total?page=" + randomPage + "&q=", {
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "Mozilla/5.0"
                }
            });
            const data = await response.json();
            const items = data.items || data.result || [];
            const shuffled = items.sort(() => Math.random() - 0.5);
            const result = shuffled.slice(0, limit);

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
                success: true,
                total: result.length,
                fromPage: randomPage,
                data: result
            }));

        } catch (e) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: e.message }));
        }

        return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: "Not found" }));
};

module.exports = router;
