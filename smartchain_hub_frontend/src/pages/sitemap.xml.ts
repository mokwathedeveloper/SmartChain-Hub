import type { GetServerSideProps } from "next";

const BASE = "https://smartchainhubfrontend.vercel.app";

const publicRoutes = [
  { path: "/",              priority: "1.0", changefreq: "weekly"  },
  { path: "/features",      priority: "0.9", changefreq: "monthly" },
  { path: "/about",         priority: "0.8", changefreq: "monthly" },
  { path: "/documentation", priority: "0.8", changefreq: "weekly"  },
  { path: "/blog",          priority: "0.7", changefreq: "weekly"  },
  { path: "/contact",       priority: "0.6", changefreq: "yearly"  },
  { path: "/login",         priority: "0.5", changefreq: "yearly"  },
  { path: "/signup",        priority: "0.5", changefreq: "yearly"  },
];

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const today = new Date().toISOString().split("T")[0];
  const urls = publicRoutes.map(r => `
  <url>
    <loc>${BASE}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
  res.write(xml);
  res.end();
  return { props: {} };
};

export default function Sitemap() { return null; }
