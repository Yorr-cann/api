const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/videos", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const all = req.query.all;
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
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                            }
                        });
                        const data = await response.json();
                        if (data && data.items && Array.isArray(data.items)) return data.items;
                        if (data && data.result && Array.isArray(data.result)) return data.result;
                        return [];
                    } catch (e) {
                        console.error("Gagal fetch page " + p + ":", e.message);
                        return [];
                    }
                }));
                allVideos.push(...results.flat());
            }
            return res.json({
                success: true,
                total: allVideos.length,
                pages: totalPages,
                data: allVideos
            });
        }

        const response = await fetch("https://xvip.rgan.biz.id/api/total?page=" + page + "&q=", {
            headers: {
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        });
        const data = await response.json();
        const items = data.items || data.result || [];

        res.json({
            success: true,
            page: page,
            total: data.total || items.length,
            pages: data.pages || totalPages,
            perPage: data.perPage || items.length,
            data: items
        });

    } catch (e) {
        res.status(500).json({
            success: false,
            error: e.message
        });
    }
});

app.get("/api/videos/random", async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
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

        res.json({
            success: true,
            total: result.length,
            fromPage: randomPage,
            data: result
        });

    } catch (e) {
        res.status(500).json({
            success: false,
            error: e.message
        });
    }
});
