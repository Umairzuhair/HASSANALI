import { useState, useEffect, useCallback } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { createClient } from '@/integrations/supabase/server';
import { SEOHead } from '@/components/SEO/SEOHead';
import { generateCanonicalUrl, generateImageUrl, truncateDescription } from '@/utils/seoUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star, Package, Truck, Shield, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { addToGuestCart } from "@/utils/guestCart";
import { ProductImageGallery } from '@/components/ProductImageGallery';
import { ProductTabs } from '@/components/ProductTabs';
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

interface ProductPageProps {
  product: Product;
  relatedProducts: Product[];
}

const ProductDetail = ({ product, relatedProducts }: ProductPageProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // If we have server-side data, use it immediately
  const [currentProduct, setCurrentProduct] = useState<Product>(product);

  // Only fetch if we don't have server-side data
  const fetchProduct = useCallback(async () => {
    if (product) return; // Skip if we have server data
    
    const { id } = router.query;
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCurrentProduct(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error loading product",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [router.query, product, toast]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = async () => {
    if (!currentProduct) return;

    try {
      if (user) {
        // Add to user cart
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: currentProduct.id,
            quantity: quantity,
          });

        if (error) throw error;

        toast({
          title: "Added to cart",
          description: `${currentProduct.name} has been added to your cart.`,
        });
      } else {
        // Add to guest cart
        addToGuestCart({
          id: currentProduct.id,
          name: currentProduct.name,
          description: currentProduct.description || '',
          image_url: currentProduct.image_url,
          category: currentProduct.category,
        }, quantity);

        toast({
          title: "Added to cart",
          description: `${currentProduct.name} has been added to your cart.`,
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

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  const images = [currentProduct.image_url];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={currentProduct.name}
        description={truncateDescription(currentProduct.description || currentProduct.insight || 'Shop this product at Metro International Duty Free')}
        keywords={`${currentProduct.name}, ${currentProduct.category}, duty free, electronics, appliances, metro international`}
        canonical={generateCanonicalUrl(`/product/${currentProduct.id}`)}
        ogType="product"
        ogImage={generateImageUrl(currentProduct.image_url)}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <ProductImageGallery images={images} productName={currentProduct.name} />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-2">
                {currentProduct.category}
              </Badge>
              <h1 className="text-3xl font-bold mb-2">{currentProduct.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(currentProduct.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {currentProduct.rating} ({currentProduct.reviews_count} reviews)
                </span>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2 h-2 rounded-full ${
                  currentProduct.in_stock ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-sm">
                  {currentProduct.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Description */}
            {currentProduct.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{currentProduct.description}</p>
              </div>
            )}

            {/* Insight */}
            {currentProduct.insight && (
              <div>
                <h3 className="font-semibold mb-2">Key Features</h3>
                <p className="text-muted-foreground">{currentProduct.insight}</p>
              </div>
            )}

            {/* Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="px-4 py-2">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!currentProduct.in_stock}
                  className="flex-1"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">Free Pickup</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">Airport Location</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">Authentic Products</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-12">
          <ProductTabs
            description={currentProduct.description || ''}
            specifications={currentProduct.specifications}
          />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <Card
                  key={p.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleProductClick(p.id)}
                >
                  <CardContent className="p-4">
                    <Image
                      src={p.image_url || '/placeholder.svg'}
                      alt={p.name}
                      className="h-36 w-full object-cover rounded"
                      width={400}
                      height={144}
                      unoptimized
                    />
                    <div className="mt-3">
                      <h3 className="font-semibold text-sm line-clamp-2">{p.name}</h3>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {p.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<ProductPageProps> = async (context) => {
  try {
    const { id } = context.params!;
    const supabase = createClient();
    
    // Fetch product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_visible', true)
      .single();

    if (productError || !product) {
      return {
        notFound: true,
      };
    }

    // Fetch related products from same category
    const { data: relatedProducts, error: relatedError } = await supabase
      .from('products')
      .select('*')
      .eq('category', product.category)
      .eq('is_visible', true)
      .neq('id', product.id)
      .limit(4);

    if (relatedError) {
      console.error('Error fetching related products:', relatedError);
    }

    return {
      props: {
        product,
        relatedProducts: relatedProducts || [],
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      notFound: true,
    };
  }
};

export default ProductDetail;
