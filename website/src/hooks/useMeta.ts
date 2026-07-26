import { useEffect } from 'react';

function setMeta(selector: string, attr: string, value: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    const [key, val] = selector.replace('meta[', '').replace(']', '').split('=');
    el.setAttribute(key, (val ?? '').replace(/["']/g, ''));
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/** Sets the document title + description + Open Graph tags for a page. */
export function useMeta(title: string, description: string): void {
  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
  }, [title, description]);
}
