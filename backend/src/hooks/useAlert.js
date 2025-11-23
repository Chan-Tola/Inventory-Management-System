import { createContext, useCallback, useContext, useState } from "react";

// note: create Context
const AlertContext = createContext();

// note: Customer hook
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within AlertProvider");
  }

  return context;
};

// note: provider Component
export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  // Show alert function
  const showAlert = useCallback((message, severity = "success") => {
    setAlert({ open: true, message, severity });
  }, []);
  // Hide alert function
  const hideAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, open: false }));
  }, []);
  // Context value with all alert functions
  const contextValue = {
    // note: General alert
    showAlert,
    hideAlert,

    // note:Auth alerts
    showLoginSuccess: () => showAlert("Login successful!", "success"),
    showLoginError: (message = "Login failed!") => showAlert(message, "error"),
    showLogoutSuccess: () => showAlert("Logged out successfully!", "success"),

    // note: CRUD
    showCreateSuccess: (itemName = "Item") =>
      showAlert(`${itemName} create successfully`, "success"),
    showCreateError: (itemName = "Item") =>
      showAlert(`Failed to create ${itemName}`, "error"),
    showUpdateSuccess: (itemName = "Item") => (
      `${itemName} updated successfully!`, "success"
    ),
    showUpdateError: (itemName = "Item") =>
      showAlert(`Failed to update ${itemName}!`, "error"),
    showDeleteSuccess: (itemName = "Item") =>
      showAlert(`${itemName} deleted successfully!`, "success"),
    showDeleteError: (itemName = "Item") =>
      showAlert(`Failed to delete ${itemName}!`, "error"),
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      <GlobalAlert
        open={alert.open}
        message={alert.message}
        severity={alert.severity}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
};
