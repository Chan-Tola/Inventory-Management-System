import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser, clearAuthState } from "../redux/slices/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, token, loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // note: Permission check function
  const hasPermission = (permission) => {
    if (!permission) return true; // No permission required

    // Check if user exists and has permissions array
    if (!user || !user.permission) return false;

    // Check if permission exists in user's permissions array
    return user.permission.includes(permission);
  };

  // note: Check if user has any of the given permissions
  const hasAnyPermission = (permissions = []) => {
    if (!permissions.length) return true;

    return permissions.some((permission) => hasPermission(permission));
  };

  // note: Check if user has all of the given permissions
  const hasAllPermissions = (permissions = []) => {
    if (!permissions.length) return true;

    return permissions.every((permission) => hasPermission(permission));
  };

  // note: Get user's role
  const getUserRole = () => {
    return user?.roles?.[0] || null;
  };

  // note: Check if user has specific role
  const hasRole = (role) => {
    const userRole = getUserRole();
    return userRole === role;
  };

  // note: function logout
  const handleLogout = async () => {
    try {
      console.log("Starting logout Process...");
      const result = await dispatch(logoutUser());

      if (logoutUser.fulfilled.match(result)) {
        console.log("Logout successfully!");
        // clear localstorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("session/login");
      } else {
        console.log("❌ Logout failed, clearing local state anyway");
        // Clear everything even if API call fails
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch(clearAuthState());
        navigate("session/login");
      }
    } catch (error) {
      console.error("💥 Logout error:", error);
      // Clear everything on error
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(clearAuthState());
      navigate("session/login");
    }
  };

  const clearError = () => {
    dispatch(clearAuthState()); // Fixed: was calling undefined clearError
  };

  return {
    // State
    user,
    token,
    loading,
    error,
    isAuthenticated,

    // Permission Functions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    getUserRole,

    // Actions
    handleLogout,
    clearError,
  };
};
