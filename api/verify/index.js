// ==============================================
// 🔐 LICENSE VERIFY ENDPOINT
// ✅ URL: https://dan-zk.vercel.app/api/verify
// ==============================================

// ✅ LAHAT NG LICENSE KEYS — ILAGAY MO DITO!
let LICENSES = {
    "CODM-TESTKEY12": { active: true, game: "CODM", createdAt: Date.now() }
};

export default async function handler(req, res) {
    const { action, game, user_key, serial, status, delete_key, days } = req.query;

    // ==============================================
    // ✅ 1. GENERATE NEW KEY
    // ==============================================
    if (action === "generate") {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let random = "";
        for (let i = 0; i < 10; i++) {
            random += chars[Math.floor(Math.random() * chars.length)];
        }
        const newKey = `${game || "CODM"}-${random}`;
        LICENSES[newKey] = {
            active: true,
            game: game || "CODM",
            createdAt: Date.now()
        };
        return res.status(200).json({
            status: "GENERATED",
            key: newKey,
            game: game || "CODM",
            message: "✅ Bagong License Key NABUO NA!"
        });
    }

    // ==============================================
    // ✅ 2. I-LIST ANG LAHAT NG KEYS
    // ==============================================
    if (action === "list") {
        return res.status(200).json({
            status: "SUCCESS",
            totalKeys: Object.keys(LICENSES).length,
            keys: LICENSES
        });
    }

    // ==============================================
    // ✅ 3. I-ON / I-OFF ANG KEY
    // ==============================================
    if (action === "set-status" && user_key) {
        if (!LICENSES[user_key]) {
            return res.status(200).json({
                status: "NOTFOUND",
                message: "❌ Hindi mahanap ang License Key"
            });
        }
        LICENSES[user_key].active = (status === "true" || status === "1");
        return res.status(200).json({
            status: "UPDATED",
            key: user_key,
            active: LICENSES[user_key].active,
            message: LICENSES[user_key].active 
                ? "✅ KEY NA-ACTIVATE NA!" 
                : "⚠️ KEY NA-DEACTIVATE NA!"
        });
    }

    // ==============================================
    // ✅ 4. I-DELETE ANG KEY
    // ==============================================
    if (action === "delete" && delete_key) {
        if (!LICENSES[delete_key]) {
            return res.status(200).json({
                status: "NOTFOUND",
                message: "❌ Hindi mahanap ang License Key"
            });
        }
        delete LICENSES[delete_key];
        return res.status(200).json({
            status: "DELETED",
            message: "✅ KEY NA-DELETE NA PERMANENTE!"
        });
    }

    // ==============================================
    // ✅ 5. I-CHECK ANG KEY — PARA SA INJECTOR
    // ==============================================
    if (!user_key) {
        return res.status(400).json({
            status: "ERROR",
            message: "❌ Kailangan ng License Key!"
        });
    }

    const keyData = LICENSES[user_key];
    if (!keyData) {
        return res.status(200).json({
            status: "INVALID",
            message: "❌ Hindi nakarehistro ang License Key na ito."
        });
    }
    if (!keyData.active) {
        return res.status(200).json({
            status: "EXPIRED",
            message: "⚠️ Hindi na aktibo ang License Key na ito."
        });
    }

    // ✅ VALID KEY — PUMASOK NA!
    return res.status(200).json({
        status: "VALID",
        message: "✅ LICENSE VERIFIED! WELCOME!",
        key: user_key,
        game: game || keyData.game,
        serial: serial
    });
}
