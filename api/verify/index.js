// ✅ API /api/verify — GUMAGANA SA REDIS! PERMANENTE NA ANG KEYS!
import { createClient } from '@vercel/kv';

// ✅ KUNIN ANG KONEKSYON MULA SA AWTOMATIKONG ENV VARS
const kv = createClient({
  url: process.env.STORAGE_REDIS_URL,
  token: process.env.STORAGE_REDIS_TOKEN
});

// ✅ DEFAULT NA KEYS (KUNG WALA PA SA DATABASE)
const DEFAULT_KEYS = {
  "CODM-TEST1234": { active: true, game: "CODM", createdAt: Date.now() }
};

// ✅ KUNIN ANG LAHAT NG KEYS MULA SA DATABASE
async function getAllKeys() {
  const keys = await kv.get('license_keys');
  if (!keys || typeof keys !== 'object') {
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
function generateNewKey(game = "CODM") {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let random = "";
  for (let i = 0; i < 10; i++) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${game}-${random}`;
}

export default async function handler(req, res) {
  const { action, game, user_key, serial, status, delete_key } = req.query;

  // ✅ KUNIN ANG LAHAT NG KEYS
  let LICENSES = await getAllKeys();

  // ✅ GENERATE NEW KEY — I-SAVE SA DATABASE!
  if (action === "generate") {
    const newKey = generateNewKey(game || "CODM");
    LICENSES[newKey] = {
      active: true,
      game: game || "CODM",
      createdAt: Date.now()
    };
    await saveAllKeys(LICENSES);
    return res.status(200).json({
      status: "GENERATED",
      key: newKey,
      game: game || "CODM",
      message: "✅ Bagong Key NABUO AT NA-SAVE NA PERMANENTE!"
    });
  }

  // ✅ I-LIST ANG LAHAT NG KEYS
  if (action === "list") {
    return res.status(200).json({
      status: "SUCCESS",
      totalKeys: Object.keys(LICENSES).length,
      keys: LICENSES
    });
  }

  // ✅ I-ON / I-OFF ANG KEY
  if (action === "set-status" && user_key) {
    if (!LICENSES[user_key]) {
      return res.status(200).json({ status: "NOTFOUND", message: "❌ Hindi mahanap ang Key" });
    }
    LICENSES[user_key].active = (status === "true" || status === "1");
    await saveAllKeys(LICENSES);
    return res.status(200).json({
      status: "UPDATED",
      key: user_key,
      active: LICENSES[user_key].active,
      message: LICENSES[user_key].active ? "✅ KEY NA-ACTIVATE!" : "⚠️ KEY NA-DEACTIVATE!"
    });
  }

  // ✅ I-DELETE ANG KEY
  if (action === "delete" && delete_key) {
    if (!LICENSES[delete_key]) {
      return res.status(200).json({ status: "NOTFOUND", message: "❌ Hindi mahanap ang Key" });
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
    return res.status(400).json({ status: "ERROR", message: "Kailangan ng License Key!" });
  }

  const keyData = LICENSES[user_key];
  if (!keyData) {
    return res.status(200).json({ status: "INVALID", message: "❌ Hindi nakarehistro ang Key." });
  }
  if (!keyData.active) {
    return res.status(200).json({ status: "EXPIRED", message: "⚠️ Hindi na aktibo ang Key." });
  }

  return res.status(200).json({
    status: "VALID",
    message: "✅ LICENSE VERIFIED! WELCOME!",
    key: user_key,
    game: game || keyData.game,
    serial: serial
  });
}
