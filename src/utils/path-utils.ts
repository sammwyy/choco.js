/**
 * Parses a query string into an object where keys are strings and values are either strings or arrays of strings.
 * If a key has no value, it's considered as `true`.
 *
 * @param query - The query string to parse, starting with "?" or not.
 * @returns An object representing the parsed query parameters.
 */
export function queryParser(query: string): Record<string, string | string[]> {
  if (!query) return {};
  if (query.startsWith("?")) query = query.slice(1);

  const queryObj: Record<string, string | string[]> = {};
  const queryParts = query.split("&");

  for (const part of queryParts) {
    const [key, value] = part.split("=");
    if (key) {
      // If there's no value, treat it as `true`
      const actualValue = value !== undefined ? value : "true";

      if (queryObj[key]) {
        if (Array.isArray(queryObj[key])) {
          (queryObj[key] as string[]).push(actualValue);
        } else {
          queryObj[key] = [queryObj[key] as string, actualValue];
        }
      } else {
        queryObj[key] = actualValue;
      }
    }
  }

  return queryObj;
}
/**
 * Matches a path against a route pattern with an optional prefix.
 * @param prefix - An optional prefix to be prepended to the route pattern.
 * @param routePath - The route pattern to match against, which can be a string with parameters (e.g., ":param"), wildcards (e.g., "*"), or a regular expression.
 * @param requestPath - The request path to match.
 * @returns True if the path matches, false otherwise.
 */
export const matchPath = (
  prefix: string,
  routePath: string | RegExp,
  requestPath: string
): boolean => {
  // Helper function to convert route path to a regular expression
  const convertToRegExp = (path: string): RegExp => {
    const params: string[] = [];
    // Escape special characters except ':', '*', and '/'
    const escapedPath = path
      .replace(/([.+^${}()|[\]\\])/g, "\\$1") // Escape special characters
      .replace(/:(\w+)/g, (match, p1) => {
        params.push(p1); // Collect parameter names
        return "([^/]+)"; // Convert params to regex
      })
      .replace(/\*/g, ".*"); // Convert '*' to regex for matching

    const regex = new RegExp(`^${escapedPath}$`);
    return regex;
  };

  // Normalize paths by removing multiple slashes
  const normalizePath = (path: string): string => {
    const normalized = path.replace(/\/{2,}/g, "/").replace(/\/$/, "");
    return normalized === "" ? "/" : normalized;
  };

  // Convert routePath to a string if it's a regular expression
  const getRoutePattern = (routePath: string | RegExp): string => {
    if (routePath instanceof RegExp) {
      // Use the pattern from the regular expression, ignoring the start and end anchors
      const pattern = routePath.source;
      return pattern;
    } else {
      return normalizePath(routePath);
    }
  };

  // Apply prefix and normalize
  const normalizedPrefix = normalizePath(prefix);
  const normalizedRoutePath = getRoutePattern(routePath);
  const fullPathPattern = normalizePath(
    `${normalizedPrefix}/${normalizedRoutePath}`
  );

  if (routePath instanceof RegExp) {
    // If routePath is already a regular expression, use it to match
    return routePath.test(normalizePath(requestPath));
  } else {
    // Convert routePath to a regex and check for a match
    const pathRegExp = convertToRegExp(fullPathPattern);
    return pathRegExp.test(normalizePath(requestPath));
  }
};

/**
 * Extracts parameters from a request path based on a route path or regular expression.
 * @param prefix - An optional prefix to be prepended to the route pattern.
 * @param routePath - The route path pattern or regular expression to match against.
 * @param requestPath - The actual request path to extract parameters from.
 * @returns An object where the keys are parameter names and the values are the extracted parameter values.
 */
export const extractParams = (
  prefix: string,
  routePath: string | RegExp,
  requestPath: string
): Record<string, string> => {
  // Helper function to convert route path to a regular expression and extract parameter names
  const convertToRegExp = (
    path: string
  ): { regExp: RegExp; params: string[] } => {
    const params: string[] = [];
    // Escape special characters except ':', '*', and '/'
    const escapedPath = path
      .replace(/([.+^${}()|[\]\\])/g, "\\$1") // Escape special characters
      .replace(/:(\w+)/g, (match, p1) => {
        params.push(p1); // Collect parameter names
        return "([^/]+)"; // Convert params to regex
      })
      .replace(/\*/g, ".*"); // Convert '*' to regex for matching

    return {
      regExp: new RegExp(`^${escapedPath}$`),
      params,
    };
  };

  // Normalize paths by removing multiple slashes
  const normalizePath = (path: string): string => path.replace(/\/{2,}/g, "/");

  // Apply prefix and normalize
  const normalizedPrefix = normalizePath(prefix);
  const normalizedRoutePath =
    typeof routePath === "string" ? normalizePath(routePath) : routePath;
  const fullPathPattern = normalizePath(
    `${normalizedPrefix}${
      typeof normalizedRoutePath === "string" ? normalizedRoutePath : ""
    }`
  );

  if (routePath instanceof RegExp) {
    // If routePath is already a regular expression, use it to extract parameters
    const match = (routePath as RegExp).exec(requestPath);
    if (match) {
      // Extract parameters from match groups
      const params: Record<string, string> = {};
      for (let i = 1; i < match.length; i++) {
        params[`param${i}`] = match[i];
      }
      return params;
    }
    return {};
  } else {
    // Convert routePath to a regex and extract parameters
    const { regExp, params } = convertToRegExp(fullPathPattern);
    const match = regExp.exec(requestPath);

    if (match) {
      const extractedParams: Record<string, string> = {};
      for (let i = 1; i < match.length; i++) {
        extractedParams[params[i - 1]] = match[i];
      }
      return extractedParams;
    }
    return {};
  }
};
