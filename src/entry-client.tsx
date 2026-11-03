import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";
import "@fontsource/barlow/latin-400.css";
import "@fontsource/barlow/latin-500.css";
import "@fontsource/barlow/latin-600.css";
import "@fontsource/barlow-condensed/latin-600.css";
import "./styles.css";
import { basePath } from "./sitePath";
const root = document.getElementById("root")!;
const appPath = window.location.pathname.startsWith(basePath)
  ? `/${window.location.pathname.slice(basePath.length)}`
  : window.location.pathname;
const path = appPath.endsWith("/") ? appPath : appPath + "/";
const app = <App path={path} />;
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
