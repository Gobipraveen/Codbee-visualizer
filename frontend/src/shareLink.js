/**
 * Encode code to a URL-safe base64 string for sharing.
 * Uses TextEncoder + btoa with URL-safe chars.
 */
export function encodeCodeToUrl(code) {
  try {
    const encoded = btoa(unescape(encodeURIComponent(code)));
    // make URL-safe
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return null;
  }
}

/**
 * Decode the URL parameter back to source code.
 */
export function decodeCodeFromUrl(encoded) {
  try {
    // restore standard base64
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return decodeURIComponent(escape(atob(b64)));
  } catch {
    return null;
  }
}

/**
 * Build a shareable URL for the given code string.
 */
export function buildShareableUrl(code) {
  const encoded = encodeCodeToUrl(code);
  if (!encoded) return null;
  const url = new URL(window.location.href);
  url.searchParams.set('code', encoded);
  return url.toString();
}

/**
 * Read the 'code' URL param if present and return decoded source.
 */
export function readCodeFromUrlParam() {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('code');
    if (!encoded) return null;
    return decodeCodeFromUrl(encoded);
  } catch {
    return null;
  }
}
