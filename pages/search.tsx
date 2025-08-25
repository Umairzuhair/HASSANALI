import { useState, useEffect, useCallback } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { createClient } from '@/integrations/supabase/server';
import { SEOHead } from '@/components/SEO/SEOHead';
import { generateCanonicalUrl } from '@/utils/seoUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Grid3X3, List, Star, Package, ShoppingCart, X } from 'lucide-react';
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

interface SearchPageProps {
  query: string;
  products: Product[];
  totalCount: number;
  categories: string[];
}

const SearchPage = ({ query, products: initialProducts, totalCount: initialTotalCount, categories }: SearchPageProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState(query);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'newest'>('name');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Update search when query changes
  useEffect(() => {
    if (query !== searchQuery) {
      setSearchQuery(query);
      setProducts(initialProducts);
      setTotalCount(initialTotalCount);
    }
  }, [query, initialProducts, initialTotalCount, searchQuery]);

  const performSearch = useCallback(async (searchTerm: string, categories: string[] = [], sortType: string = sortBy) => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_visible', true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);

      if (categories.length > 0) {
        query = query.in('category', categories);
      }

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

      const { data, error, count } = await query;

      if (error) throw error;
      setProducts(data || []);
      setTotalCount(count || 0);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Search error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [sortBy, toast]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryFilter = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    performSearch(searchQuery, newCategories, sortBy);
  };

  const handleSort = (sortType: 'name' | 'rating' | 'newest') => {
    setSortBy(sortType);
    performSearch(searchQuery, selectedCategories, sortType);
  };

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

  const clearFilters = () => {
    setSelectedCategories([]);
    performSearch(searchQuery, [], sortBy);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`Search Results for &quot;${query}&quot; - Metro International Duty Free`}
        description={`Search results for &quot;${query}&quot; at Metro International Duty Free. Find the best deals on electronics, appliances, and more.`}
        keywords={`${query}, search, duty free, electronics, appliances, metro international`}
        canonical={generateCanonicalUrl(`/search?q=${encodeURIComponent(query)}`)}
        ogType="website"
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Results</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button type="submit">Search</Button>
            </div>
          </form>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {totalCount} result{totalCount !== 1 ? 's' : ''} for &quot;{query}&quot;
            </p>
            
            <div className="flex items-center gap-4">
              {/* Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

              {/* View Mode */}
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

              {/* Sort */}
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
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filters</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
            
            {/* Category Filters */}
            <div>
              <h4 className="font-medium mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryFilter(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Searching...</div>
          </div>
        ) : products.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {products.map((product) => (
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
              No products match your search for &quot;{query}&quot;.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Try:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Using different keywords</li>
                <li>• Checking your spelling</li>
                <li>• Using more general terms</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<SearchPageProps> = async (context) => {
  try {
    const { q } = context.query;
    const searchQuery = (q as string) || '';
    
    if (!searchQuery.trim()) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    const supabase = createClient();
    
    // Fetch products matching search query
    const { data: products, error: productsError, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_visible', true)
      .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
      .order('name');

    if (productsError) {
      console.error('Error fetching search results:', productsError);
      return {
        props: {
          query: searchQuery,
          products: [],
          totalCount: 0,
          categories: [],
        },
      };
    }

    // Get unique categories for filtering
    const categories = [...new Set((products || []).map(p => p.category))];

    return {
      props: {
        query: searchQuery,
        products: products || [],
        totalCount: count || 0,
        categories,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        query: '',
        products: [],
        totalCount: 0,
        categories: [],
      },
    };
  }
};

export default SearchPage;
