
import { useIsClient } from '@/hooks/useIsClient';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentManager } from '@/components/cms/ContentManager';
import { ProductManager } from '@/components/cms/ProductManager';
import { OrderManager } from '@/components/cms/OrderManager';
import { FeaturedProductsManager } from '@/components/cms/FeaturedProductsManager';
import { FileUploadTest } from '@/components/cms/FileUploadTest';
import { BrandLogoManager } from '@/components/cms/BrandLogoManager';
import { DutyFreeProductsManager } from '@/components/cms/DutyFreeProductsManager';
import { supabase } from '@/integrations/supabase/client';
import { Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CMS = () => {
  const isClient = useIsClient();
  if (!isClient) return null;
  return <CMSClient />;
};

const CMSClient = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const checkAdminAccess = useCallback(async () => {
    setCheckingAdmin(true);
    if (!user) {
      setIsAdmin(false);
      setCheckingAdmin(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      if (error) {
        setIsAdmin(false);
        return;
      }
      const isUserAdmin = Array.isArray(data)
        ? data.some((roleItem) => roleItem.role === 'admin')
        : false;
      setIsAdmin(isUserAdmin);
    } catch (error) {
      setIsAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user, checkAdminAccess]);

  if (authLoading || checkingAdmin) {
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold mb-4 text-red-600">Access Denied</h1>
              <p className="text-xl text-muted-foreground">
                You don&apos;t have permission to access the CMS
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/'}
              className="ml-4"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="text-center py-12">
            <Shield className="w-24 h-24 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Admin Access Required</h2>
            <p className="text-muted-foreground mb-6">
              Only administrators can access the Content Management System
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Home
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Content Management System</h1>
          <p className="text-xl text-muted-foreground">
            Manage your website content, products, and orders
          </p>
        </div>
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="content">Website Content</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="featured">Featured Products</TabsTrigger>
            <TabsTrigger value="duty-free">Duty Free Products</TabsTrigger>
            <TabsTrigger value="brands">Brand Logos</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="files">File Manager</TabsTrigger>
          </TabsList>
          <TabsContent value="content" className="mt-8">
            <ContentManager />
          </TabsContent>
          <TabsContent value="products" className="mt-8">
            <ProductManager />
          </TabsContent>
          <TabsContent value="featured" className="mt-8">
            <FeaturedProductsManager />
          </TabsContent>
          <TabsContent value="duty-free" className="mt-8">
            <DutyFreeProductsManager />
          </TabsContent>
          <TabsContent value="brands" className="mt-8">
            <BrandLogoManager />
          </TabsContent>
          <TabsContent value="orders" className="mt-8">
            <OrderManager />
          </TabsContent>
          <TabsContent value="files" className="mt-8">
            <FileUploadTest />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default CMS;
