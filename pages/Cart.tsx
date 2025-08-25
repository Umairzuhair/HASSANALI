import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus, ShoppingBag, X, Heart, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getGuestCart, updateGuestCartQuantity, removeFromGuestCart } from "@/utils/guestCart";
import Image from 'next/image';

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    description: string | null;
    category: string;
    image_url: string | null;
  } | null;
}

interface CartItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    description: string | null;
    category: string;
    image_url: string | null;
    rating?: number;
    reviews_count?: number;
    in_stock?: boolean;
  } | null;
}

const Cart = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Wishlist state (only for signed-in users)
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  // Only fetch for signed-in user
  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          products (
            id,
            name,
            description,
            category,
            image_url,
            rating,
            reviews_count,
            in_stock
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      setCartItems((data as unknown as CartItem[]) || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error loading cart",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch wishlist (signed-in users only)
  const fetchWishlist = async () => {
    setLoadingWishlist(true);
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          product:products (
            id,
            name,
            description,
            category,
            image_url
          )
        `)
        .eq('user_id', user?.id);
      if (error) throw error;
      setWishlist((data as unknown as WishlistItem[]) || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error loading wishlist",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingWishlist(false);
    }
  };

  // For signed-in users, update the cart in Supabase
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    if (!user) {
      updateGuestCartQuantity(itemId, newQuantity);
      setCartItems(getGuestCart());
      toast({ title: "Cart updated", description: "Item quantity has been updated." });
      return;
    }
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;

      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );

      toast({
        title: "Cart updated",
        description: "Item quantity has been updated.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error updating cart",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // For signed-in users, remove from DB; guest: just remove from localStorage
  const removeItem = async (itemId: string) => {
    if (!user) {
      removeFromGuestCart(itemId);
      setCartItems(getGuestCart());
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
      return;
    }
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setCartItems(prev => prev.filter(item => item.id !== itemId));

      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error removing item",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  // --- UI RENDER ---

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold mb-4">Your Cart</h1>
            <p className="text-xl text-muted-foreground">
              Review your items and proceed to checkout
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="ml-4"
          >
            <X className="w-5 h-4" />
          </Button>
        </div>

        {/* Wishlist section: Hide for guests */}
        {user && (loadingWishlist ? (
          <div className="text-center mb-4">Loading wishlist...</div>
        ) : wishlist.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Wishlist
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {wishlist.map((item) => (
                <Card key={item.id} className="overflow-hidden group hover:shadow-md cursor-pointer">
                  <CardContent className="flex items-center gap-4 p-4"
                    onClick={() => router.push(`/product/${item.product?.id}`)}>
                    <Image
                      src={item.product?.image_url || '/placeholder.svg'}
                      alt={item.product?.name || 'Product'}
                      className="w-16 h-16 object-cover rounded"
                      width={64}
                      height={64}
                      unoptimized
                    />
                    <div>
                      <div className="font-semibold">{item.product?.name}</div>
                      <div className="text-muted-foreground text-sm">{item.product?.category}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null)}

        {/* Cart Items */}
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to add items to your cart
            </p>
            <Button onClick={() => router.push('/')}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {cartItems.map((item) => {
                // Check if product exists (not deleted)
                if (!item.products) {
                  return (
                    <Card key={item.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 text-center">
                          <Package className="w-12 h-12 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-muted-foreground">This product has been deleted</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="ml-2"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4">
                        <Image
                          src={item.products?.image_url || '/placeholder.svg'}
                          alt={item.products?.name || 'Product'}
                          className="w-20 h-20 object-cover rounded-lg self-start cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleProductClick(item.products?.id || '')}
                          width={80}
                          height={80}
                          unoptimized
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 
                              className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors"
                              onClick={() => handleProductClick(item.products?.id || '')}
                            >
                              {item.products?.name}
                            </h3>
                            <Badge variant="outline" className="mt-2">
                              {item.products?.category}
                            </Badge>
                          </div>
                        </div>
                        {/* Controls and Delete aligned in column for mobile, row for desktop */}
                        <div className="flex flex-row items-center gap-4 self-stretch">
                          <div className="flex items-center space-x-3 border border-border rounded p-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="px-2"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="font-semibold text-lg w-8 text-center select-none">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="ml-2 flex items-center justify-center"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="mt-8 text-center">
              <Button
                size="lg"
                className="px-8"
                onClick={() => router.push('/checkout')}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
