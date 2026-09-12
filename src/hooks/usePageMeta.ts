import { useEffect } from "react";

interface PageMetaOptions {
  /** Page title. Omit to leave the document title untouched. */
  title?: string;
  /** Page description (meta[name=description]). */
  description?: string;
  /**
   * When true, the page is marked noindex (auth pages and the app shell).
   * Must be called on the outermost component that renders the page.
   */
  noindex?: boolean;
}

/**
 * Lightweight per-page document metadata (title/description/robots).
 * App pages are client-rendered and noindexed; only the landing page is
 * indexable, so we keep this simple and dependency-free.
 */
export function usePageMeta({ title, description, noindex }: PageMetaOptions) {
  useEffect(() => {
    if (title) document.title = title;

    if (description) {
      let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = description;
    }

    if (noindex !== undefined) {
      let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
      if (!robots) {
        robots = document.createElement("meta");
        robots.name = "robots";
        document.head.appendChild(robots);
      }
      robots.content = noindex ? "noindex, nofollow" : "index, follow";
    }
  }, [title, description, noindex]);
}
