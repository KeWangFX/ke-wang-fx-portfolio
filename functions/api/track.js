import {
  cleanText,
  detectBrowser,
  detectDeviceType,
  getCountryCode,
  getReferrerHost,
  isBot,
  jsonResponse,
  normalizePath,
  readJson
} from "../_lib/analytics.js";

export async function onRequestPost(context) {
  const database = context.env.ke_wang_portfolio_analytics;
  if (!database) {
    return jsonResponse({ ok: false, error: "Analytics database unavailable." }, 500);
  }

  const userAgent = context.request.headers.get("user-agent") || "";
  if (isBot(userAgent)) {
    return jsonResponse({ ok: true, skipped: "bot" });
  }

  const payload = await readJson(context.request);
  const visitorId = cleanText(payload.visitorId, 128);
  if (!visitorId) {
    return jsonResponse({ ok: false, error: "Missing visitor id." }, 400);
  }

  const currentHost = new URL(context.request.url).hostname;
  const path = normalizePath(payload.path);
  const referrerHost = getReferrerHost(payload.referrer, currentHost);
  const referrerUrl = cleanText(payload.referrer, 320);
  const country = getCountryCode(context.request);
  const deviceType = detectDeviceType(userAgent, payload.screenWidth);
  const browser = detectBrowser(userAgent);
  const language = cleanText(payload.language, 40);
  const createdAt = new Date().toISOString();

  await database
    .prepare(
      `
        INSERT INTO analytics_events (
          visitor_id,
          path,
          referrer_host,
          referrer_url,
          country,
          device_type,
          browser,
          language,
          created_at
        )
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
      `
    )
    .bind(
      visitorId,
      path,
      referrerHost,
      referrerUrl,
      country,
      deviceType,
      browser,
      language,
      createdAt
    )
    .run();

  return jsonResponse({ ok: true });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      allow: "POST, OPTIONS"
    }
  });
}
