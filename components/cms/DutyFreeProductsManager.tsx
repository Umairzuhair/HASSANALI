
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  image_url: string;
  category: string;
  in_stock: boolean;
  is_visible: boolean;
}

interface DutyFreeProduct {
  id: string;
  product_id: string;
  display_order: number;
  is_active: boolean;
  product: Product;
}

export const DutyFreeProductsManager = () => {
  const [dutyFreeProducts, setDutyFreeProducts] = useState<DutyFreeProduct[]>([]);
  // Fix the any types
  const [availableProducts, setAvailableProducts] = useState<Array<{
    id: string;
    name: string;
    category: string;
    image_url: string | null;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchDutyFreeProducts();
    fetchAvailableProducts();
  }, []);

  const fetchDutyFreeProducts = async () => {
    try {
      // First get duty free products
      const { data: dutyFreeData, error: dutyFreeError } = await supabase
        .from('duty_free_products')
        .select('*')
        .order('display_order');

      if (dutyFreeError) throw dutyFreeError;

      if (dutyFreeData && dutyFreeData.length > 0) {
        // Get product IDs
        const productIds = dutyFreeData.map(dfp => dfp.product_id);
        
        // Fetch corresponding products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, name, image_url, category, in_stock, is_visible')
          .in('id', productIds);

        if (productsError) throw productsError;

        // Combine the data
        const combinedData = dutyFreeData.map(dfp => ({
          ...dfp,
          product: productsData?.find(p => p.id === dfp.product_id) || {
            id: dfp.product_id,
            name: 'Product not found',
            image_url: '',
            category: '',
            in_stock: false,
            is_visible: false
          }
        }));

        setDutyFreeProducts(combinedData);
      } else {
        setDutyFreeProducts([]);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error loading duty free products",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, image_url, category, in_stock, is_visible')
        .eq('is_visible', true)
        .order('name');

      if (error) throw error;
      setAvailableProducts(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error loading products",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const addDutyFreeProduct = async () => {
    if (!selectedProductId) return;

    try {
      // Check if product is already added
      const existing = dutyFreeProducts.find(dfp => dfp.product_id === selectedProductId);
      if (existing) {
        toast({
          title: "Product already added",
          description: "This product is already in the duty free collection",
          variant: "destructive",
        });
        return;
      }

      const maxOrder = Math.max(...dutyFreeProducts.map(dfp => dfp.display_order), -1);
      
      const { error } = await supabase
        .from('duty_free_products')
        .insert({
          product_id: selectedProductId,
          display_order: maxOrder + 1,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Product added",
        description: "Product has been added to duty free collection",
      });

      setSelectedProductId('');
      fetchDutyFreeProducts();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error adding product",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const removeDutyFreeProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('duty_free_products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Product removed",
        description: "Product has been removed from duty free collection",
      });

      fetchDutyFreeProducts();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error removing product",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const moveProduct = async (productId: string, direction: 'up' | 'down') => {
    const currentIndex = dutyFreeProducts.findIndex(dfp => dfp.id === productId);
    
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === dutyFreeProducts.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentProduct = dutyFreeProducts[currentIndex];
    const targetProduct = dutyFreeProducts[targetIndex];

    try {
      // Swap display_order values
      await supabase
        .from('duty_free_products')
        .update({ display_order: targetProduct.display_order })
        .eq('id', currentProduct.id);

      await supabase
        .from('duty_free_products')
        .update({ display_order: currentProduct.display_order })
        .eq('id', targetProduct.id);

      fetchDutyFreeProducts();
      toast({
        title: "Product order updated",
        description: "Product display order has been updated successfully",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error updating order",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (productId: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('duty_free_products')
        .update({ is_active: !currentActive })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Product status updated",
        description: `Product is now ${!currentActive ? 'active' : 'inactive'}`,
      });

      fetchDutyFreeProducts();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error updating status",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Filter available products to exclude already added ones
  const filteredAvailableProducts = availableProducts.filter(product => 
    !dutyFreeProducts.some(dfp => dfp.product_id === product.id)
  );

  if (loading) {
    return <div className="text-center">Loading duty free products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Duty Free Products Management</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Product to Duty Free Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product to add" />
                </SelectTrigger>
                <SelectContent>
                  {filteredAvailableProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addDutyFreeProduct} disabled={!selectedProductId}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">
          Current Duty Free Products ({dutyFreeProducts.length})
        </h3>
        
        {dutyFreeProducts.map((dutyFreeProduct, index) => (
          <Card key={dutyFreeProduct.id} className={!dutyFreeProduct.is_active ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  {dutyFreeProduct.product.image_url && (
                    <Image
                      src={dutyFreeProduct.product.image_url}
                      alt={dutyFreeProduct.product.name}
                      className="h-16 w-16 object-cover rounded"
                      width={64}
                      height={64}
                      unoptimized
                    />
                  )}
                  <div>
                    <CardTitle className="text-lg">
                      {dutyFreeProduct.product.name}
                    </CardTitle>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{dutyFreeProduct.product.category}</Badge>
                      {dutyFreeProduct.product.in_stock ? (
                        <Badge variant="secondary" className="text-green-700 bg-green-100">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          Out of Stock
                        </Badge>
                      )}
                      {!dutyFreeProduct.is_active && (
                        <Badge variant="secondary" className="text-red-700 bg-red-100">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Display Order: {dutyFreeProduct.display_order}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveProduct(dutyFreeProduct.id, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveProduct(dutyFreeProduct.id, 'down')}
                    disabled={index === dutyFreeProducts.length - 1}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(dutyFreeProduct.id, dutyFreeProduct.is_active)}
                  >
                    {dutyFreeProduct.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeDutyFreeProduct(dutyFreeProduct.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
        
        {dutyFreeProducts.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No products added to duty free collection yet.
          </div>
        )}
      </div>
    </div>
  );
};
