export const MAX_JSON_BODY_BYTES = 256 * 1024;

export function exceedsBodyLimit(
  request: Request,
  limit = MAX_JSON_BODY_BYTES,
): boolean {
  const contentLength = Number(request.headers.get("content-length"));
  return Number.isFinite(contentLength) && contentLength > limit;
}

export function hasValidOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  let candidate = origin;
  if (!candidate && referer) {
    try {
      candidate = new URL(referer).origin;
    } catch {
      return false;
    }
  }

  if (!candidate) {
    return process.env.NODE_ENV !== "production";
  }

  const allowedOrigins = new Set([new URL(request.url).origin]);
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configuredOrigin) {
    allowedOrigins.add(configuredOrigin);
  }

  return allowedOrigins.has(candidate);
}
