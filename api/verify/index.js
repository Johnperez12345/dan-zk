// ✅ API /api/verify — PERMANENTENG DATABASE! HINDI NA NAWAWALA ANG KEYS!
import { kv } from '@vercel/kv';

// ✅ DEFAULT NA KEYS (KUNG WALA PA SA DATABASE)
const DEFAULT_KEYS = {
    "YUKI-POGI": { active: true, game: "CODM", maxDevices: 3, createdAt: Date.now() },
    "YUKI-TEST": { active: true, game: "CODM", maxDevices: 5, createdAt: Date.now() }
};

// ✅ KUNIN ANG LAHAT NG KEYS MULA SA DATABASE
async function getAllKeys() {
    const keys = await kv.get('license_keys');
    if (!keys || typeof keys !== 'object') {
        // ✅ KUNG WALA PA → I-SAVE ANG DEFAULT
        await kv.set('license_keys', DEFAULT_KEYS);
        return DEFAULT_KEYS;
    }
    return keys;
}

// ✅ I-SAVE ANG LAHAT NG KEYS SA DATABASE
async function saveAllKeys(keys) {
    await kv.set('license_keys', keys);
}

// ✅ BUMUO NG BAGONG KEY
function generateNewKey(game = "CODM", days = 30) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let random = "";
    for (let i = 0; i < 10; i++) {
        random += chars[Math.floor(Math.random() * chars.length)];
    }
    return `${game}-${random}`;
}

export default async function handler(req, res) {
    const { action, game, user_key, serial, status, delete_key, days } = req.query;

    // ✅ KUNIN ANG LAHAT NG KEYS MULA SA DATABASE
    let LICENSES = await getAllKeys();

    // ✅ GENERATE NEW KEY — I-SAVE SA DATABASE!
    if (action === "generate") {
        const newKey = generateNewKey(game || "CODM", parseInt(days) || 30);
        LICENSES[newKey] = {
            active: true,
            game: game || "CODM",
            maxDevices: 3,
            createdAt: Date.now(),
            expiresInDays: parseInt(days) || 30
        };
        await saveAllKeys(LICENSES);
        return res.status(200).json({
            status: "GENERATED",
            key: newKey,
            game: game || "CODM",
            message: "✅ Bagong License Key NABUO AT NA-SAVE NA!"
        });
    }

    // ✅ I-LIST ANG LAHAT NG KEYS — MULA SA DATABASE!
    if (action === "list") {
        return res.status(200).json({
            status: "SUCCESS",
            totalKeys: Object.keys(LICENSES).length,
            keys: LICENSES
        });
    }

    // ✅ I-ON / I-OFF ANG KEY — I-UPDATE SA DATABASE!
    if (action === "set-status" && user_key) {
        if (!LICENSES[user_key]) {
            return res.status(200).json({ 
                status: "NOTFOUND", 
                message: "❌ Hindi mahanap ang Key" 
            });
        }
        LICENSES[user_key].active = (status === "true" || status === "1");
        await saveAllKeys(LICENSES);
        return res.status(200).json({
            status: "UPDATED",
            key: user_key,
            active: LICENSES[user_key].active,
            message: LICENSES[user_key].active 
                ? "✅ KEY NA-ACTIVATE NA!" 
                : "⚠️ KEY NA-DEACTIVATE NA!"
        });
    }

    // ✅ I-DELETE ANG KEY — TINATANGGAL SA DATABASE!
    if (action === "delete" && delete_key) {
        if (!LICENSES[delete_key]) {
            return res.status(200).json({ 
                status: "NOTFOUND", 
                message: "❌ Hindi mahanap ang Key" 
            });
        }
        delete LICENSES[delete_key];
        await saveAllKeys(LICENSES);
        return res.status(200).json({
            status: "DELETED",
            message: "✅ KEY NA-DELETE NA PERMANENTE!"
        });
    }

    // ✅ VERIFY KEY — PARA SA INJECTOR
    if (!user_key) {
        return res.status(400).json({
            status: "ERROR",
            message: "Kailangan ng License Key!"
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

    return res.status(200).json({
        status: "VALID",
        message: "✅ LICENSE VERIFIED! WELCOME!",
        key: user_key,
        game: game || keyData.game,
        serial: serial
    });
}
