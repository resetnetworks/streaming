import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { HelmetProvider } from "react-helmet-async";

import App from "./App.jsx";
import { store, persistor } from "./app/store.js";
import "./index.css";
import "leaflet/dist/leaflet.css";

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
    "Load failed"
  ],
  beforeSend(event, hint) {
    const error = hint.originalException;
    if (error && error.message && error.message.includes("Failed to fetch dynamically imported module")) {
      return null; // Don't send this to Sentry
    }
    return event;
  },
  tracesSampleRate: 0.2,
});



/* -------------------- REACT QUERY -------------------- */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // Cache data for 5 minutes
      refetchOnWindowFocus: false,     // Prevent refetch on tab switch
      retry: 1,                        // Retry failed request once
    },
  },
});

/* -------------------- APP RENDER -------------------- */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p>Something went wrong | refresh the page</p>}>
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
