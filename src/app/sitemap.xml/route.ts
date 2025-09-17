
import { posts } from "@/lib/data";
import { getSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getSettings();
  const siteUrl = 'https://your-site-url.example.com'; // Replace with actual site URL from settings if available

  const publishedPosts = posts.filter(p => p.status.toLowerCase() === 'published');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  ${publishedPosts.map(post => `
  <url>
    <loc>${siteUrl}/${post.id}</loc>
    <lastmod>${new Date(post.createdAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  `).join('')}
</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
