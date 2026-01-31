import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { HelmetProvider } from "react-helmet-async";

import App from "./App.jsx";
import { store, persistor } from "./app/store.js";
import "./index.css";
import "leaflet/dist/leaflet.css";

/* -------------------- CHUNK LOAD FAIL SAFETY (VERY IMPORTANT) -------------------- */
window.addEventListener("error", (event) => {
  if (
    event?.message?.includes("Failed to fetch dynamically imported module") ||
    event?.message?.includes("Loading chunk")
  ) {
    // avoid infinite reload loop
    if (!sessionStorage.getItem("chunk_reload")) {
      sessionStorage.setItem("chunk_reload", "true");
      window.location.reload();
    }
  }
});

/* -------------------- SENTRY INIT -------------------- */
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.MODE === "production",
  ignoreErrors: [
    "Authentication token missing",
    "Unauthorized",
    "401",
    "Failed to fetch dynamically imported module",
    "Loading chunk"
  ],
  tracesSampleRate: 0.2,
});

/* -------------------- REACT QUERY -------------------- */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/* -------------------- APP RENDER -------------------- */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p>Something went wrong | refreshing…</p>}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <App />
            </PersistGate>
          </Provider>
        </QueryClientProvider>
      </HelmetProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>
);
