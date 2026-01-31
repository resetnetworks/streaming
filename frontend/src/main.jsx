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

/* -------------------- CHUNK LOAD FAIL SAFETY (FINAL) -------------------- */
const reloadOnChunkFail = () => {
  if (!sessionStorage.getItem("chunk_reload")) {
    sessionStorage.setItem("chunk_reload", "true");
    window.location.reload();
  }
};

window.addEventListener("error", (event) => {
  if (
    event?.message?.includes("Loading chunk") ||
    event?.message?.includes("Failed to fetch dynamically imported module")
  ) {
    reloadOnChunkFail();
  }
});

window.addEventListener("unhandledrejection", (event) => {
  if (
    typeof event?.reason?.message === "string" &&
    event.reason.message.includes("Failed to fetch dynamically imported module")
  ) {
    reloadOnChunkFail();
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
    "Loading chunk",
  ],
  beforeSend(event) {
    const message = event?.exception?.values?.[0]?.value;
    if (
      message?.includes("Failed to fetch dynamically imported module") ||
      message?.includes("Loading chunk")
    ) {
      return null; // drop event
    }
    return event;
  },
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
