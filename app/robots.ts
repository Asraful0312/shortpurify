import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/invite/", "/dashboard"],
      },
    ],
    sitemap: "https://shortpurify.com/sitemap.xml",
  };
}
