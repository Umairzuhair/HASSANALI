
import { GetServerSideProps } from 'next';
import { SEOHead } from '@/components/SEO/SEOHead';
import { generateCanonicalUrl } from '@/utils/seoUtils';
import { ProductCategories } from '@/components/ProductCategories';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { BackToTopButton } from '@/components/BackToTopButton';
import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { BrandLogoScroller } from '@/components/BrandLogoScroller';
import { createClient } from '@/integrations/supabase/server';

interface Product {
  id: string;
  name: string;
  image_url: string;
  category: string;
  rating: number;
  reviews_count: number;
  description: string;
  in_stock: boolean;
  display_order: number;
  is_visible: boolean;
}

interface HomePageProps {
  featuredProducts: Array<{
    id: string;
    name: string;
    image_url: string;
    category: string;
    rating: number;
    reviews_count: number;
    description: string;
    in_stock: boolean;
    display_order: number;
    is_visible: boolean;
  }>;
  brandLogos: Array<{
    id: string;
    name: string;
    image_url: string;
    display_order: number | null;
    is_active: boolean | null;
    created_at: string;
    updated_at: string;
  }>;
}

const Index = ({ featuredProducts, brandLogos }: HomePageProps) => {
  const handleCategorySelect = (category: string) => {
    console.log(`Selected category: ${category}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Metro Duty Free - Electronics & Appliances at Airport Prices"
        description="Shop the biggest brands at Metro International Duty Free. Browse electronics, appliances & more. Pickup at Bandaranaike Airport, Sri Lanka."
        keywords="duty free, electronics, appliances, airport shopping, sri lanka, bandaranaike airport, metro international"
        canonical={generateCanonicalUrl('/')} 
        ogType="website"
      />
      <ProductCategories onCategorySelect={handleCategorySelect} />
      <WhatsAppFloat />
      <BackToTopButton />
      <Hero setActiveMode={() => {}} />
      <ProductGrid 
        mode="featured" 
        productsPerRow={4} 
        initialProducts={featuredProducts}
      />
      <BrandLogoScroller initialLogos={brandLogos} />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
  try {
    const supabase = createClient();
    
    // Fetch featured products
    const { data: featuredProductsData, error: featuredError } = await supabase
      .from('featured_products')
      .select(`
        id,
        products (
          id,
          name,
          image_url,
          category,
          rating,
          reviews_count,
          description,
          in_stock,
          display_order,
          is_visible
        )
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (featuredError) {
      console.error('Error fetching featured products:', featuredError);
    }

    // Fetch brand logos
    const { data: brandLogosData, error: brandError } = await supabase
      .from('brand_logos')
      .select('id, name, image_url, display_order, is_active')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (brandError) {
      console.error('Error fetching brand logos:', brandError);
    }

    // Process featured products data
    const featuredProducts = (featuredProductsData as unknown as Array<{ products: Product }>)
      ?.map((item) => item.products)
      .filter(Boolean)
      .filter((product: Product) => product.is_visible) || [];

    return {
      props: {
        featuredProducts: featuredProducts as Array<{
          id: string;
          name: string;
          image_url: string;
          category: string;
          rating: number;
          reviews_count: number;
          description: string;
          in_stock: boolean;
          display_order: number;
          is_visible: boolean;
        }>,
        brandLogos: (brandLogosData as Array<{
          id: string;
          name: string;
          image_url: string;
          display_order: number | null;
          is_active: boolean | null;
          created_at: string;
          updated_at: string;
        }>) || [],
      },

    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        featuredProducts: [],
        brandLogos: [],
      },
      revalidate: 60,
    };
  }
};

export default Index;
