import { useIsClient } from '@/hooks/useIsClient';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Calendar, LogOut, X, Package, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  product_name: string;
  product_category: string;
  product_image_url: string | null;
}

interface Order {
  id: string;
  arrival_date: string;
  arrival_time: string;
  arrival_flight_number: string;
  status: string;
  created_at: string;
  subtotal: number;
  total: number;
  guest_email: string | null;
  user_id: string | null;
  order_items?: OrderItem[];
}

const Account = () => {
  const router = useRouter();
  const isClient = useIsClient();
  if (!isClient) return null;
  return <AccountClient />;
};

const AccountClient = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState({ full_name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const fetchProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile(data);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching profile:', errorMessage);
      setProfile({
        full_name: user?.user_metadata?.full_name || '',
        email: user?.email || ''
      });
    }
  }, [user]);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      // Fetch orders for the current user - only use user_id and guest_email
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .or(`user_id.eq.${user?.id},guest_email.eq.${user?.email}`)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch order items with stored product details for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: orderItemsData, error: orderItemsError } = await supabase
            .from('order_items')
            .select(`
              id,
              order_id,
              product_id,
              quantity,
              product_name,
              product_category,
              product_image_url
            `)
            .eq('order_id', order.id);

          if (orderItemsError) {
            console.error('Error fetching order items:', orderItemsError);
            return { ...order, order_items: [] };
          }

          return {
            ...order,
            order_items: orderItemsData || []
          };
        })
      );

      setOrders(ordersWithItems);
      console.log("[Account - My Orders] Orders with items fetched (including linked guest orders):", ordersWithItems);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error loading orders",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingOrders(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchOrders();
    }
  }, [user, fetchProfile, fetchOrders]);

  const updateProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          email: profile.email,
        });
      if (error) throw error;
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error updating profile",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('Account: Initiating sign out...');
      await signOut();
      
      // Force navigation after a brief delay to ensure state is cleared
      setTimeout(() => {
        router.replace('/');
      }, 100);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Account: Sign out error:', errorMessage);
      toast({
        title: "Error signing out",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Force navigation even on error
      setTimeout(() => {
        router.replace('/');
      }, 100);
    }
  };

  // Cancel order
  const cancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);
      if (error) throw error;
      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled.",
      });
      fetchOrders();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error cancelling order",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show login prompt for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold mb-4">Account</h1>
              <p className="text-xl text-muted-foreground">
                Please sign in to access your account
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="ml-4"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="text-center py-12">
            <User className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Sign in to access your account</h2>
            <p className="text-muted-foreground mb-6">
              Create an account or sign in to manage your profile
            </p>
            <Button onClick={() => router.push('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold mb-4">My Account</h1>
            <p className="text-xl text-muted-foreground">
              Manage your profile and account settings
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="ml-4"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Orders section FIRST */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                My Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <div className="text-center py-6">Loading your orders...</div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center py-8">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                  <div className="font-semibold mb-2">You have not placed any orders yet.</div>
                  <Button size="sm" onClick={() => router.push('/')}>
                    Shop now
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <div className="font-semibold">
                            Order #{order.id.slice(-8)} - Placed on{' '}
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            Flight: {order.arrival_flight_number} <br />
                            Date of Arrival: {order.arrival_date} <br />
                            Status:{' '}
                            <span
                              className={
                                order.status === 'pending'
                                  ? 'font-semibold text-orange-700'
                                  : order.status === 'collected'
                                  ? 'font-semibold text-green-700'
                                  : order.status === 'cancelled'
                                  ? 'font-semibold text-red-700'
                                  : ''
                              }
                            >
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        {order.status === 'pending' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="mt-2 md:mt-0"
                            onClick={() => cancelOrder(order.id)}
                          >
                            Cancel Order
                          </Button>
                        )}
                      </div>

                      {/* Order Items */}
                      {order.order_items && order.order_items.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3">Items Ordered:</h4>
                          <div className="grid gap-3">
                            {order.order_items.map((item) => (
                              <div 
                                key={item.id} 
                                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => router.push(`/product/${item.product_id}`)}
                              >
                                {item.product_image_url && (
                                  <Image
                                    src={item.product_image_url}
                                    alt={item.product_name}
                                    className="w-16 h-16 object-cover rounded"
                                    width={64}
                                    height={64}
                                    unoptimized
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="font-medium text-blue-600 hover:text-blue-800">
                                    {item.product_name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Category: {item.product_category}
                                  </div>
                                  <div className="text-sm font-medium">
                                    Quantity: {item.quantity}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Order Total */}
                      <div className="pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Total:</span>
                          <span className="font-semibold text-lg">
                            ${order.total?.toFixed?.(2) ?? order.total}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Profile Information SECOND */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  placeholder="Email cannot be changed"
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
              <Button onClick={updateProfile} disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Account Details THIRD */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Address</p>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Member Since</p>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Separator />
              <Button variant="destructive" onClick={handleSignOut} className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Account;
