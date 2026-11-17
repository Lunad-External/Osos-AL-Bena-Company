// Server entry: renders one page per request (used by server.mjs and the
// staging pre-render). Everything Google needs is produced here.
import { renderToString } from "react-dom/server";
import { App } from "./App";
import { sitePath } from "./sitePath";
import { pageMeta, headTags } from "./seo";

export {
  canonicalPathFor,
  publicRoutes,
  robotsTxt,
  sitemapXml,
  DEFAULT_ORIGIN,
} from "./seo";

export type RenderResult = { status: number; html: string };

/** Render `path` (app path, e.g. "/products/") into the Vite HTML template. */
export function render(
  path: string,
  template: string,
  opts: { origin: string; noindex?: boolean },
): RenderResult {
  const meta = pageMeta(path);
  const appHtml = renderToString(<App path={path} />);
  const head = headTags(meta, { ...opts, assetPath: sitePath });
  const html = template
    .replace(
      /<title>.*?<\/title>/,
      () => `<title>${head.title}</title>${head.early}`,
    )
    .replace("</head>", () => head.tags + "</head>")
    .replace(
      '<script type="module"',
      '<script type="module" fetchpriority="low"',
    )
    .replace('<div id="root"></div>', () => `<div id="root">${appHtml}</div>`);
  return { status: meta.status, html };
}
