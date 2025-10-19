export function getApiBase() {
  return import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";
}

export function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizeReviewPayload(data) {
  if (!data || typeof data !== "object") return null;
  const rating =
    typeof data.rating !== "undefined" && data.rating !== null
      ? safeNumber(data.rating, 0)
      : data.review_text
      ? 0
      : null;
  return {
    ...data,
    rating,
    review_text: data.review_text ?? data.text ?? data.body ?? null,
    is_public:
      typeof data.is_public === "boolean" ? data.is_public : data.is_public ?? true,
  };
}

export function tryParseJsonIfString(v) {
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch (e) {
      return v;
    }
  }
  return v;
}

export function formatDateRaw(raw) {
  if (raw === null || typeof raw === "undefined" || raw === "") return "Data não disponível";
  const num = Number(raw);
  let d;
  if (!Number.isNaN(num)) {
    d = new Date(num < 1e12 ? num * 1000 : num);
  } else {
    d = new Date(String(raw));
  }
  if (isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString();
}

export function extractNameFromItem(item, keyCandidates = ["name", "title", "company", "publisher", "label"]) {
  if (item === null || typeof item === "undefined") return null;
  if (typeof item === "string") return item;
  if (typeof item === "number") return String(item);
  if (typeof item === "object") {
    for (const k of keyCandidates) {
      if (item[k]) {
        if (typeof item[k] === "string") return item[k];
        if (typeof item[k] === "object" && item[k].name) return item[k].name;
      }
    }
    if (item.platform && item.platform.name) return item.platform.name;
    if (item.publisher && item.publisher.name) return item.publisher.name;
    if (item.company && item.company.name) return item.company.name;
    for (const k of Object.keys(item)) {
      if (typeof item[k] === "string" && item[k].length < 80) return item[k];
    }
  }
  return null;
}

export function safeJoinAny(arr, keyCandidates = ["name", "title", "label", "company"]) {
  if (arr === null || typeof arr === "undefined") return "—";
  if (!Array.isArray(arr)) {
    const s = extractNameFromItem(arr, keyCandidates);
    return s || "—";
  }
  const names = arr.map((i) => extractNameFromItem(i, keyCandidates)).filter(Boolean);
  return names.length ? names.join(", ") : "—";
}
