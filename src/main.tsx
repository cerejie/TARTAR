import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/plus-jakarta-sans";
import App from "./App";
import UnsupportedBrowserView from "./components/common/status/UnsupportedBrowserView";
import "./styles/common/theme.css";
import { isBrowserSupported } from "./utils/browser.utils";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found");

createRoot(rootElement).render(
  <StrictMode>
    {isBrowserSupported() ? <App /> : <UnsupportedBrowserView />}
  </StrictMode>
);
