import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import AppRoute from "./routes/AppRoute";
// import { AlertProvider } from "./hooks/useAlert";
const App = () => {
  const [theme, colorMode] = useMode(); // theme default mode = dark
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppRoute />
          </ThemeProvider>
        </ColorModeContext.Provider>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
