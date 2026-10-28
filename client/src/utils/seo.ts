/**
 * TypeScript SEO Manager
 * Dynamically updates document metadata, meta tags, and structured JSON-LD schemas
 * without needing static HTML.
 */

export interface SeoProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  jsonLd?: Record<string, any>;
}

const DEFAULT_SEO: SeoProps = {
  title: 'eBazaar — Local Market Shopping & Shopkeeper Platform',
  description: 'Discover nearby neighborhood shops, compare product prices, check real-time stock, and choose fast home delivery or instant reserve & collect with eBazaar.',
  keywords: 'local market, neighborhood shopping, quick commerce, reserve and collect, store pickup, shopkeeper platform, fresh produce, grocery',
  image: '/logoWithBG.png',
  url: 'https://ebazaar-local.com/',
  type: 'website'
};

function setMetaTag(nameOrProperty: 'name' | 'property', attrValue: string, content: string) {
  let element = document.querySelector(`meta[${nameOrProperty}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(nameOrProperty, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function updateDocumentSeo(props: SeoProps = {}) {
  const title = props.title ? `${props.title} | eBazaar` : DEFAULT_SEO.title!;
  const description = props.description || DEFAULT_SEO.description!;
  const keywords = props.keywords || DEFAULT_SEO.keywords!;
  const image = props.image || DEFAULT_SEO.image!;
  const url = props.url || window.location.href;
  const type = props.type || DEFAULT_SEO.type!;

  // 1. Update Title
  document.title = title;

  // 2. Standard Meta Tags
  setMetaTag('name', 'description', description);
  setMetaTag('name', 'keywords', keywords);
  setMetaTag('name', 'theme-color', '#16a34a');

  // 3. OpenGraph Tags
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:image', image);
  setMetaTag('property', 'og:url', url);
  setMetaTag('property', 'og:type', type);

  // 4. Twitter Card Tags
  setMetaTag('property', 'twitter:card', 'summary_large_image');
  setMetaTag('property', 'twitter:title', title);
  setMetaTag('property', 'twitter:description', description);
  setMetaTag('property', 'twitter:image', image);

  // 5. Schema.org JSON-LD structured data
  const jsonLdData = props.jsonLd || {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'eBazaar',
    'url': 'https://ebazaar-local.com/',
    'description': description,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://ebazaar-local.com/products?search={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  let script = document.querySelector('script#ebazaar-seo-schema') as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = 'ebazaar-seo-schema';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(jsonLdData);
}
