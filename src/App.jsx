import { BrowserRouter, Route, Routes } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import { PortfolioContext, usePortfolioData } from "./hooks/usePortfolioData";
import { ThemeProvider } from "./hooks/useTheme";
import AboutPage from "./pages/AboutPage";
import AdminPage from "./pages/AdminPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProjectsPage from "./pages/ProjectsPage";

export default function App() {
  const portfolioState = usePortfolioData();

  return (
    <ThemeProvider>
      <PortfolioContext.Provider value={portfolioState}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PortfolioContext.Provider>
    </ThemeProvider>
  );
}
