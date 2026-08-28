/**
 * Turn common domain and URL input into one stable public HTTP(S) URL.
 * Network-level public-address checks remain the gateway's responsibility.
 *
 * @param {string} raw
 * @returns {string}
 */
export function normalizeUrlInput(raw) {
  const value = raw.trim();
  if (value === "") throw new TypeError("INVALID_PUBLIC_URL");
  if (
    /^[a-z][a-z\d+.-]*:\/\//iu.test(value) &&
    !/^https?:\/\//iu.test(value)
  ) {
    throw new TypeError("INVALID_PUBLIC_URL");
  }

  const withProtocol = /^https?:\/\//iu.test(value)
    ? value
    : value.startsWith("//")
      ? `https:${value}`
      : `https://${value}`;
  const url = new URL(withProtocol);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new TypeError("INVALID_PUBLIC_URL");
  }
  if (url.username !== "" || url.password !== "") {
    throw new TypeError("INVALID_PUBLIC_URL");
  }

  url.hash = "";
  url.hostname = url.hostname.toLowerCase();
  if (
    (url.protocol === "http:" && url.port === "80") ||
    (url.protocol === "https:" && url.port === "443")
  ) {
    url.port = "";
  }
  return url.toString();
}
