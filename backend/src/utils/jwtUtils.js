/**
 * Decode JWT token without verification (for client-side use only)
 */
export const decodeJWT = (token) => {
  if (!token || typeof token !== "string") return null;

  try {
    // JWT format: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.warn("Invalid JWT format");
      return null;
    }

    // Decode base64 URL safe
    const payload = JSON.parse(
      atob(
        parts[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/")
          .padEnd(parts[1].length + ((4 - (parts[1].length % 4)) % 4), "=")
      )
    );

    return {
      ...payload,
      // Standardize field names
      userId: payload.sub || payload.user_id || payload.id,
      permissions: payload.permissions || payload.user_permission || [],
      roles: payload.roles || payload.user_roles || [],
      exp: payload.exp, // Expiration timestamp
      iat: payload.iat, // Issued at timestamp
    };
  } catch (error) {
    console.error("JWT decode error:", error);
    return null;
  }
};
/**
 * Check if token is expired
 */
export const isTokenExpired = (token) => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
};

/**
 * Get time until token expires (in seconds)
 */
export const getTokenExpiryTime = (token) => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return 0;

  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - now);
};
