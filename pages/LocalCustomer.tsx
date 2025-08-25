
import { useIsClient } from '@/hooks/useIsClient';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Star, ShoppingCart } from 'lucide-react';
import { Header } from '@/components/Header';
import { ProductGrid } from '@/components/ProductGrid';
import Footer from '@/components/Footer';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { ProductCategories } from '@/components/ProductCategories';

const LocalCustomer = () => {
  const isClient = useIsClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    console.log(`Selected category: ${category}`);
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ProductCategories onCategorySelect={handleCategorySelect} />
      <WhatsAppFloat />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Local Customer</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Premium products for our local customers with home delivery
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <Badge variant="secondary" className="px-4 py-2">
              <Package className="w-4 h-4 mr-2" />
              Fast Delivery
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              Premium Quality
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Easy Returns
            </Badge>
          </div>
        </div>
        
        <ProductGrid mode="featured" />
        
        <Card className="mt-12 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Delivery Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Delivery Areas</h4>
                <p className="text-muted-foreground">Metro Area & Suburbs</p>
                <p className="text-muted-foreground">Express delivery available</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Delivery Times</h4>
                <p className="text-muted-foreground">Same-day: Order before 2 PM</p>
                <p className="text-muted-foreground">Standard: 1-3 business days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default LocalCustomer;
