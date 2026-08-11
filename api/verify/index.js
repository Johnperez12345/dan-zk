// ✅ API /api/verify — MAS MABILIS! AGAD ANG RESPONSE!
let LICENSES = {
    "CODM-TESTKEY12": { active: true, game: "CODM", createdAt: Date.now() }
};

export default async function handler(req, res) {
    const { action, game, user_key, serial, status, delete_key } = req.query;

    // ✅ GENERATE — AGAD ANG RESPONSE!
    if (action === "generate") {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let r = "";
        for (let i = 0; i < 10; i++) r += chars[Math.floor(Math.random() * chars.length)];
        const newKey = `${game || "CODM"}-${r}`;
        LICENSES[newKey] = { active: true, game: game || "CODM", createdAt: Date.now() };
        return res.status(200).json({ status: "GENERATED", key: newKey, message: "✅ BAGONG KEY NABUO!" });
    }

    // ✅ LIST — AGAD!
    if (action === "list") {
        return res.status(200).json({ status: "SUCCESS", totalKeys: Object.keys(LICENSES).length, keys: LICENSES });
    }

    // ✅ ON/OFF — AGAD!
    if (action === "set-status" && user_key) {
        if (!LICENSES[user_key]) return res.status(200).json({ status: "NOTFOUND", message: "❌ Hindi mahanap" });
        LICENSES[user_key].active = (status === "true" || status === "1");
        return res.status(200).json({ status: "UPDATED", active: LICENSES[user_key].active, message: "✅ NA-UPDATE!" });
    }

    // ✅ DELETE — AGAD NAWAWALA!
    if (action === "delete" && delete_key) {
        if (!LICENSES[delete_key]) return res.status(200).json({ status: "NOTFOUND", message: "❌ Hindi mahanap" });
        delete LICENSES[delete_key]; // ✅ TINATANGGAL TALAGA!
        return res.status(200).json({ status: "DELETED", message: "✅ KEY NA-DELETE NA PERMANENTE!" });
    }

    // ✅ VERIFY — AGAD!
    if (!user_key) return res.status(400).json({ status: "ERROR", message: "Kailangan ng Key!" });
    const k = LICENSES[user_key];
    if (!k) return res.status(200).json({ status: "INVALID", message: "❌ Hindi nakarehistro" });
    if (!k.active) return res.status(200).json({ status: "EXPIRED", message: "⚠️ Hindi na aktibo" });
    return res.status(200).json({ status: "VALID", message: "✅ LICENSE VALID!" });
}
