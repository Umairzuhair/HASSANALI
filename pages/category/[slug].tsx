
import { useState, useEffect, useCallback } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { createClient } from '@/integrations/supabase/server';
import { SEOHead } from '@/components/SEO/SEOHead';
import { generateCanonicalUrl, generateImageUrl, truncateDescription } from '@/utils/seoUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Grid3X3, List, Star, Package, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { addToGuestCart } from "@/utils/guestCart";
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  image_url: string;
  category: string;
  rating: number;
  reviews_count: number;
  description: string;
  insight?: string | null;
  specifications: Record<string, unknown>;
  in_stock: boolean;
}

interface CategoryPageProps {
  category: {
    name: string;
    description?: string;
    image_url?: string;
  };
  products: Product[];
  totalCount: number;
}

const CategoryPage = ({ category, products, totalCount }: CategoryPageProps) => {
  const router = useRouter();
  const { slug } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'newest'>('name');
  const [currentProducts, setCurrentProducts] = useState<Product[]>(products);
  const [loading, setLoading] = useState(false);

  // If we have server-side data, use it immediately
  useEffect(() => {
    if (products.length > 0) {
      setCurrentProducts(products);
    }
  }, [products]);

  const handleSort = useCallback(async (sortType: 'name' | 'rating' | 'newest') => {
    setSortBy(sortType);
    setLoading(true);

    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('category', category.name)
        .eq('is_visible', true);

      switch (sortType) {
        case 'name':
          query = query.order('name');
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      setCurrentProducts(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error sorting products",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [category.name, toast]);

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      if (user) {
        // Add to user cart
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: 1,
          });

        if (error) throw error;

        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart.`,
        });
      } else {
        // Add to guest cart
        addToGuestCart({
          id: product.id,
          name: product.name,
          description: product.description || '',
          image_url: product.image_url,
          category: product.category,
        }, 1);

        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart.`,
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error adding to cart",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Category not found</h1>
            <Button onClick={() => router.push('/')}>Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${category.name} - Metro International Duty Free`}
        description={truncateDescription(category.description || `Browse our selection of ${category.name} products at Metro International Duty Free.`)}
        keywords={`${category.name}, duty free, electronics, appliances, metro international`}
        canonical={generateCanonicalUrl(`/category/${slug}`)}
        ogType="website"
        ogImage={category.image_url ? generateImageUrl(category.image_url) : undefined}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {category.image_url && (
              <Image
                src={category.image_url}
                alt={category.name}
                className="w-16 h-16 object-cover rounded-lg"
                width={64}
                height={64}
                unoptimized
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{category.name}</h1>
              <p className="text-muted-foreground">
                {totalCount} product{totalCount !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
          
          {category.description && (
            <p className="text-muted-foreground max-w-3xl">
              {category.description}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as 'name' | 'rating' | 'newest')}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="name">Name</option>
              <option value="rating">Rating</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Loading products...</div>
          </div>
        ) : currentProducts.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {currentProducts.map((product) => (
              <Card
                key={product.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
                onClick={() => handleProductClick(product.id)}
              >
                <CardContent className={`p-4 ${viewMode === 'list' ? 'flex items-center gap-4 w-full' : ''}`}>
                  <Image
                    src={product.image_url || '/placeholder.svg'}
                    alt={product.name}
                    className={`object-cover rounded ${
                      viewMode === 'list' ? 'w-24 h-24' : 'h-48 w-full'
                    }`}
                    width={viewMode === 'list' ? 96 : 400}
                    height={viewMode === 'list' ? 96 : 192}
                    unoptimized
                  />
                  <div className={`mt-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <h3 className="font-semibold line-clamp-2 mb-2">{product.name}</h3>
                    <Badge variant="outline" className="mb-2">
                      {product.category}
                    </Badge>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(product.rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {product.rating || 0} ({product.reviews_count || 0})
                      </span>
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${
                        product.in_stock ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-xs text-muted-foreground">
                        {product.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={!product.in_stock}
                      className="w-full"
                    >
                      <ShoppingCart className="w-3 h-3 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              No products are currently available in this category.
            </p>
            <Button onClick={() => router.push('/')}>Browse All Products</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<CategoryPageProps> = async (context) => {
  try {
    const { slug } = context.params!;
    const supabase = createClient();
    
    // Convert slug back to category name (e.g., "electronics-appliances" -> "Electronics & Appliances")
    const categoryName = (slug as string)
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Fetch products for this category
    const { data: products, error: productsError, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('category', categoryName)
      .eq('is_visible', true)
      .order('name');

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return {
        notFound: true,
      };
    }

    // Get category info (you might want to create a categories table)
    const category = {
      name: categoryName,
      description: `Browse our selection of ${categoryName} products at Metro International Duty Free.`,
      image_url: undefined,
    };

    return {
      props: {
        category,
        products: products || [],
        totalCount: count || 0,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      notFound: true,
    };
  }
};

export default CategoryPage;
