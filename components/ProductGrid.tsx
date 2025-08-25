import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart } from 'lucide-react';
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
  in_stock: boolean;
  display_order: number;
  is_visible: boolean;
}

interface ProductGridProps {
  mode: 'featured' | 'duty-free' | 'category';
  productsPerRow?: number;
  tvSizeFilter?: string;
  initialProducts?: Product[];
}

export const ProductGrid = ({ 
  mode, 
  productsPerRow = 3, 
  tvSizeFilter, 
  initialProducts = [] 
}: ProductGridProps) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const router = useRouter();
  const { slug } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();

  // If we have initial products, use them and don't fetch
  useEffect(() => {
    if (initialProducts.length > 0) {
      setProducts(initialProducts);
      setLoading(false);
    }
  }, [initialProducts]);

  // Fix the dependency issue by using useCallback
  const fetchProducts = useCallback(async () => {
    // Skip fetching if we have initial products
    if (initialProducts.length > 0) return;
    
    try {
      let query;
      
      if (mode === 'featured') {
        query = supabase
          .from('featured_products')
          .select(`
            product_id,
            display_order,
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
          .order('display_order');
      } else if (mode === 'duty-free') {
        // First get duty free products
        const { data: dutyFreeData, error: dutyFreeError } = await supabase
          .from('duty_free_products')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (dutyFreeError) throw dutyFreeError;

        if (dutyFreeData && dutyFreeData.length > 0) {
          // Get product IDs
          const productIds = dutyFreeData.map(dfp => dfp.product_id);
          
          // Fetch corresponding products
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds)
            .eq('is_visible', true);

          if (productsError) throw productsError;

          // Combine and sort by duty free display order
          const combinedData = dutyFreeData.map(dfp => {
            const product = productsData?.find(p => p.id === dfp.product_id);
            return product;
          }).filter(Boolean);

          setProducts(combinedData);
          setLoading(false);
          return;
        } else {
          setProducts([]);
          setLoading(false);
          return;
        }
      } else if (mode === 'category' && slug) {
        query = supabase
          .from('products')
          .select('*')
          .eq('category', slug)
          .eq('is_visible', true)
          .order('display_order');
      }

      if (query) {
        const { data, error } = await query;
        
        if (error) throw error;
        
        let processedProducts: Product[] = [];
        
        if (mode === 'featured') {
          processedProducts = (data as Array<{ products: Product }>)?.map((item) => item.products).filter(Boolean).filter((product: Product) => product.is_visible) || [];
        } else {
          processedProducts = (data as Product[]) || [];
        }

        // Apply TV size filter if applicable
        if (tvSizeFilter && tvSizeFilter !== 'all' && slug === 'tvs') {
          processedProducts = processedProducts.filter(product => {
            const name = product.name.toLowerCase();
            return name.includes(tvSizeFilter.toLowerCase());
          });
        }

        setProducts(processedProducts);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error loading products",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [mode, slug, tvSizeFilter, toast, initialProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const addToCart = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      addToGuestCart(
        {
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          image_url: product.image_url,
          rating: product.rating,
          reviews_count: product.reviews_count,
          in_stock: product.in_stock,
        },
        1 // always add 1 from grid
      );
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: 1,
          });

        if (error) throw error;
      }

      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
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

  const getGridCols = () => {
    if (mode === 'featured' && productsPerRow === 2) {
      return 'grid-cols-2 md:grid-cols-2';
    }
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="text-center">Loading products...</div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-8 md:py-6">
      {mode === 'featured' && (
        <div className="text-center mb-8 md:mb-6">
          <h2 className="text-3xl font-bold mb-4">Popular Products</h2>
          <p className="text-xl text-muted-foreground">
            Discover our most popular duty-free items
          </p>
        </div>
      )}

      <div className={`grid ${getGridCols()} gap-4 lg:gap-8`}>
        {products.map((product: {
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
        }) => (
          <Card 
            key={product.id} 
            className="group hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full"
            onClick={() => handleProductClick(product.id)}
          >
            <div className="relative">
              <Image
                src={product.image_url || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-40 md:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                width={400}
                height={256}
                unoptimized
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-white/90 hover:bg-white h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(product.id);
                }}
              >
                <Heart 
                  className={`w-3 h-3 ${
                    favorites.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                  }`} 
                />
              </Button>
            </div>
            
            <div className="flex flex-col flex-1">
              <CardHeader className="p-3 lg:p-6 flex-1">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-sm lg:text-lg text-blue-600 hover:text-blue-800 transition-colors">
                      {product.name}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs ml-2">{product.category}</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-3 lg:p-6 pt-0 mt-auto">
                <div className="flex items-center justify-between mb-2 lg:mb-4">
                  <div className="flex-1">
                    {product.in_stock ? (
                      <Badge variant="secondary" className="text-green-700 bg-green-100 text-xs">
                        In Stock
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Button 
                  className="w-full text-xs lg:text-sm h-8 lg:h-10" 
                  disabled={!product.in_stock}
                  onClick={(e) => addToCart(product, e)}
                >
                  <ShoppingCart className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {mode === 'featured' && products.length > 0 && (
        <div className="text-center mt-8 md:mt-6">
          <p className="text-muted-foreground mb-4">
            Ready to explore our full duty-free collection?
          </p>
          <Button size="lg">
            Browse All Products
          </Button>
        </div>
      )}
    </section>
  );
};
