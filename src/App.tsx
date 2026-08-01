import { useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { lightTheme, darkTheme } from "./theme";
import { Layout } from "./components/layout/Layout";
import { PeriodProvider } from "./context/PeriodContext";
import "./index.css";
import Home from "./pages/Home";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false); // Varsayılan light theme

  const handleThemeChange = () => {
    setIsDarkMode((prevMode) => !prevMode); // Tema değişimini tersine çevir
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <PeriodProvider>
        <Layout isDarkMode={isDarkMode} handleThemeChange={handleThemeChange}>
          <Home />
        </Layout>
      </PeriodProvider>
    </ThemeProvider>
  );
}

export default App;
