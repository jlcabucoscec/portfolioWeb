import { createContext, useContext, useEffect, useState } from "react";
import { fetchJSON } from "../api/client";

export const PortfolioContext = createContext(null);

export function usePortfolioData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const response = await fetchJSON("/api/portfolio");
      setData(response);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  return {
    data,
    loading,
    error,
    refresh: loadPortfolio,
    setData,
  };
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio must be used within PortfolioContext.Provider.");
  }

  return context;
}
