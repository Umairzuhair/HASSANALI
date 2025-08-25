
import { supabase } from '@/integrations/supabase/client';

export const generateSitemap = async () => {
  const baseUrl = "https://lovable.dev/projects/f49fc0f2-8536-4832-86df-e29a01e3690d";
  
  // Static pages
  const staticPages = [
    { url: '', priority: 1.0, changefreq: 'daily' },
    { url: '/duty-free', priority: 0.8, changefreq: 'weekly' },
    { url: '/allowance', priority: 0.6, changefreq: 'monthly' },
    { url: '/store-locator', priority: 0.7, changefreq: 'monthly' },
    { url: '/privacy-policy', priority: 0.3, changefreq: 'yearly' },
    { url: '/terms-of-use', priority: 0.3, changefreq: 'yearly' },
  ];

  // Category pages
  const categories = [
    'refrigerators', 'tvs', 'vacuums', 'washing-machines', 'ovens',
    'stand-mixers', 'rice-cookers', 'blenders', 'fans', 'speakers', 'accessories'
  ];

  const categoryPages = categories.map(cat => ({
    url: `/category/${cat}`,
    priority: 0.8,
    changefreq: 'weekly'
  }));

  // Product pages
  let productPages: any[] = [];
  try {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, updated_at');
    
    if (products) {
      productPages = products.map(product => ({
        url: `/product/${product.id}`,
        priority: 0.9,
        changefreq: 'weekly',
        lastmod: product.updated_at
      }));
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  const allPages = [...staticPages, ...categoryPages, ...productPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};
