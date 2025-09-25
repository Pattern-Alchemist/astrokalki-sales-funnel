import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.astrokalki.com";
  const now = new Date();
  const routes = [
    "/",
    "/pricing",
    "/book",
    "/about",
    "/contact",
    "/login",
    "/register",
    "/admin",
  ];

  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.6,
  }));
}