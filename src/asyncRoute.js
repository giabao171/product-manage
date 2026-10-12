/**
 * Run an async Express handler and forward a rejection to the error middleware.
 *
 * @param handler Route handler
 * @return Express handler
 */
export function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
