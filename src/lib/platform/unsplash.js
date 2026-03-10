const UNSPLASH_API_BASE = "https://api.unsplash.com";
const UNSPLASH_REFERRAL_SOURCE =
  process.env.UNSPLASH_REFERRAL_SOURCE || "austin-leads-platform";

function getUnsplashHeaders() {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    throw new Error("Unsplash is not configured.");
  }

  return {
    Authorization: `Client-ID ${accessKey}`,
    "Accept-Version": "v1",
  };
}

function withReferral(url) {
  if (!url) {
    return null;
  }

  try {
    const nextUrl = new URL(url);
    nextUrl.searchParams.set("utm_source", UNSPLASH_REFERRAL_SOURCE);
    nextUrl.searchParams.set("utm_medium", "referral");
    return nextUrl.toString();
  } catch {
    return url;
  }
}

function normalizePhoto(photo) {
  return {
    id: photo.id,
    description: photo.description || "",
    alt: photo.alt_description || photo.description || "Unsplash photo",
    color: photo.color,
    blurHash: photo.blur_hash,
    width: photo.width,
    height: photo.height,
    urls: {
      raw: photo.urls?.raw,
      full: photo.urls?.full,
      regular: photo.urls?.regular,
      small: photo.urls?.small,
      thumb: photo.urls?.thumb,
    },
    user: {
      name: photo.user?.name,
      username: photo.user?.username,
      html: withReferral(photo.user?.links?.html),
    },
    links: {
      html: withReferral(photo.links?.html),
      downloadLocation: photo.links?.download_location,
    },
  };
}

async function request(pathname, searchParams) {
  const url = new URL(`${UNSPLASH_API_BASE}${pathname}`);

  Object.entries(searchParams || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    headers: getUnsplashHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Unsplash request failed.");
  }

  return response.json();
}

export function isUnsplashConfigured() {
  return Boolean(process.env.UNSPLASH_ACCESS_KEY);
}

export async function searchUnsplashPhotos(query, page = 1, perPage = 12) {
  const data = await request("/search/photos", {
    query,
    page,
    per_page: perPage,
    orientation: "landscape",
    content_filter: "high",
  });

  return {
    total: data.total,
    totalPages: data.total_pages,
    results: (data.results || []).map(normalizePhoto),
  };
}

export async function registerUnsplashDownload(downloadLocation) {
  if (!downloadLocation) {
    return null;
  }

  const response = await fetch(downloadLocation, {
    headers: getUnsplashHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Unsplash download registration failed.");
  }

  return response.json();
}
