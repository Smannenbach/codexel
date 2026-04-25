import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  structuredData?: string | string[];
  robots?: string;
}

function setMeta(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export default function SEOHead({
  title,
  description,
  keywords,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  structuredData,
  robots = 'index, follow',
}: SEOHeadProps) {
  useEffect(() => {
    document.title = title;
    setMeta('description', description);
    setMeta('robots', robots);
    if (keywords) setMeta('keywords', keywords);
    if (canonicalUrl) setLink('canonical', canonicalUrl);

    // Open Graph
    setMeta('og:title', ogTitle ?? title, true);
    setMeta('og:description', ogDescription ?? description, true);
    setMeta('og:type', 'website', true);
    if (ogImage) setMeta('og:image', ogImage, true);

    // Structured data
    const schemas = Array.isArray(structuredData) ? structuredData : structuredData ? [structuredData] : [];
    schemas.forEach((sd, i) => {
      const id = `codexel-schema-${i}`;
      let el = document.getElementById(id) as HTMLScriptElement | null;
      if (!el) {
        el = document.createElement('script');
        el.id = id;
        el.type = 'application/ld+json';
        document.head.appendChild(el);
      }
      el.textContent = sd;
    });

    return () => {
      // Cleanup schema scripts on unmount
      schemas.forEach((_, i) => {
        document.getElementById(`codexel-schema-${i}`)?.remove();
      });
    };
  }, [title, description, keywords, canonicalUrl, ogTitle, ogDescription, ogImage, robots, structuredData]);

  return null;
}
