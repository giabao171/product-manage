/**
 * Call a same-origin JSON API.
 *
 * @param path Request path
 * @param fallback Message used when the response has no error text
 * @param options Fetch options
 * @return Parsed JSON body
 */
export async function requestJson(path, { fallback, ...options } = {}) {
  const response = await fetch(path, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || fallback || `Request failed (${response.status})`);
  }
  return body;
}
