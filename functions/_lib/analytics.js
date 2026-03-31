function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch (_) {
    return {};
  }
}

function isBot(userAgent) {
  return /bot|spider|crawl|preview|slurp|mediapartners/i.test(userAgent || "");
}

function cleanText(value, maxLength = 160) {
  if (!value) return "";
  return String(value).trim().slice(0, maxLength);
}

function normalizePath(pathname) {
  const cleaned = cleanText(pathname, 240);
  if (!cleaned || cleaned === "undefined" || cleaned === "null") return "/";
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    try {
      return new URL(cleaned).pathname || "/";
    } catch (_) {
      return "/";
    }
  }
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
}

function getReferrerHost(referrer, currentHost) {
  const value = cleanText(referrer, 320);
  if (!value) return "Direct";

  try {
    const url = new URL(value);
    if (url.hostname === currentHost) {
      return "Internal";
    }
    return url.hostname.replace(/^www\./i, "");
  } catch (_) {
    return "Direct";
  }
}

function detectDeviceType(userAgent, screenWidth) {
  const width = Number(screenWidth || 0);
  const agent = userAgent || "";

  if (/ipad|tablet/i.test(agent)) return "Tablet";
  if (/mobi|android|iphone/i.test(agent)) return "Mobile";
  if (width > 0 && width < 768) return "Mobile";
  if (width > 0 && width < 1100) return "Tablet";
  return "Desktop";
}

function detectBrowser(userAgent) {
  const agent = userAgent || "";

  if (/edg\//i.test(agent)) return "Edge";
  if (/chrome\//i.test(agent) && !/edg\//i.test(agent)) return "Chrome";
  if (/safari\//i.test(agent) && !/chrome\//i.test(agent)) return "Safari";
  if (/firefox\//i.test(agent)) return "Firefox";
  return "Other";
}

function getCountryCode(request) {
  const country =
    request.cf?.country || request.headers.get("cf-ipcountry") || "Unknown";
  return cleanText(country, 12).toUpperCase() || "Unknown";
}

export {
  cleanText,
  detectBrowser,
  detectDeviceType,
  getCountryCode,
  getReferrerHost,
  isBot,
  jsonResponse,
  normalizePath,
  readJson
};
