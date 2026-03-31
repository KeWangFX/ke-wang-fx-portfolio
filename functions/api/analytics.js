import { jsonResponse } from "../_lib/analytics.js";

async function firstValue(statement, fallback = {}) {
  const result = await statement.first();
  return result || fallback;
}

async function listValues(statement) {
  const result = await statement.all();
  return result.results || [];
}

export async function onRequestGet(context) {
  const database = context.env.ke_wang_portfolio_analytics;
  if (!database) {
    return jsonResponse({ ok: false, error: "Analytics database unavailable." }, 500);
  }

  const now = Date.now();
  const since24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const since7d = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const since30d = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  const trackedSince = await firstValue(
    database.prepare("SELECT MIN(created_at) AS trackedSince FROM analytics_events")
  );

  const summary24h = await firstValue(
    database
      .prepare(
        `
          SELECT
            COUNT(*) AS pageViews24h,
            COUNT(DISTINCT visitor_id) AS uniqueVisitors24h
          FROM analytics_events
          WHERE created_at >= ?1
        `
      )
      .bind(since24h),
    { pageViews24h: 0, uniqueVisitors24h: 0 }
  );

  const summary7d = await firstValue(
    database
      .prepare(
        `
          SELECT
            COUNT(*) AS pageViews7d,
            COUNT(DISTINCT visitor_id) AS uniqueVisitors7d
          FROM analytics_events
          WHERE created_at >= ?1
        `
      )
      .bind(since7d),
    { pageViews7d: 0, uniqueVisitors7d: 0 }
  );

  const daily = await listValues(
    database
      .prepare(
        `
          SELECT
            substr(created_at, 1, 10) AS day,
            COUNT(*) AS views,
            COUNT(DISTINCT visitor_id) AS visitors
          FROM analytics_events
          WHERE created_at >= ?1
          GROUP BY day
          ORDER BY day ASC
        `
      )
      .bind(since7d)
  );

  const sources = await listValues(
    database
      .prepare(
        `
          SELECT
            COALESCE(NULLIF(referrer_host, ''), 'Direct') AS label,
            COUNT(DISTINCT visitor_id) AS value
          FROM analytics_events
          WHERE created_at >= ?1
          GROUP BY label
          ORDER BY value DESC
          LIMIT 5
        `
      )
      .bind(since30d)
  );

  const countries = await listValues(
    database
      .prepare(
        `
          SELECT
            COALESCE(NULLIF(country, ''), 'Unknown') AS label,
            COUNT(DISTINCT visitor_id) AS value
          FROM analytics_events
          WHERE created_at >= ?1
          GROUP BY label
          ORDER BY value DESC
          LIMIT 5
        `
      )
      .bind(since30d)
  );

  const pages = await listValues(
    database
      .prepare(
        `
          SELECT
            path AS label,
            COUNT(*) AS value
          FROM analytics_events
          WHERE created_at >= ?1
          GROUP BY label
          ORDER BY value DESC
          LIMIT 5
        `
      )
      .bind(since30d)
  );

  const devices = await listValues(
    database
      .prepare(
        `
          SELECT
            COALESCE(NULLIF(device_type, ''), 'Unknown') AS label,
            COUNT(DISTINCT visitor_id) AS value
          FROM analytics_events
          WHERE created_at >= ?1
          GROUP BY label
          ORDER BY value DESC
          LIMIT 5
        `
      )
      .bind(since30d)
  );

  return jsonResponse({
    ok: true,
    trackedSince: trackedSince.trackedSince ? trackedSince.trackedSince.slice(0, 10) : null,
    summary: {
      pageViews24h: Number(summary24h.pageViews24h || 0),
      uniqueVisitors24h: Number(summary24h.uniqueVisitors24h || 0),
      pageViews7d: Number(summary7d.pageViews7d || 0),
      uniqueVisitors7d: Number(summary7d.uniqueVisitors7d || 0)
    },
    daily: daily.map((item) => ({
      day: item.day,
      views: Number(item.views || 0),
      visitors: Number(item.visitors || 0)
    })),
    sources: sources.map((item) => ({
      label: item.label,
      value: Number(item.value || 0)
    })),
    countries: countries.map((item) => ({
      label: item.label,
      value: Number(item.value || 0)
    })),
    pages: pages.map((item) => ({
      label: item.label,
      value: Number(item.value || 0)
    })),
    devices: devices.map((item) => ({
      label: item.label,
      value: Number(item.value || 0)
    }))
  });
}
