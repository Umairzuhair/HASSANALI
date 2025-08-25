import { useIsClient } from '@/hooks/useIsClient';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Info, Calendar, Users, AlertTriangle } from 'lucide-react';
import { Header } from '@/components/Header';
import { ProductGrid } from '@/components/ProductGrid';
import Footer from '@/components/Footer';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { ProductCategories } from '@/components/ProductCategories';
import { BackToTopButton } from '@/components/BackToTopButton';

const Allowance = () => {
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
      <BackToTopButton />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Duty Free Allowance Information</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Everything you need to know about duty-free reservations and regulations
          </p>
        </div>

        {/* Reservation Information Section */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-6 h-6 text-primary" />
              Reservation Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              Metro International Duty Free allows you to select and reserve products that will be ready to be collected upon arrival at the airport.
            </p>
          </CardContent>
        </Card>

        {/* Stay Duration & Limits Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-6">Maximum Reservation Limits by Stay Duration</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Less than 90 days */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-green-800">
                  <Clock className="w-5 h-5" />
                  Less than 90 days
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">$187</div>
                <p className="text-green-700 font-medium">Maximum reservation limit</p>
              </CardContent>
            </Card>

            {/* 90 Days to 365 Days */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-blue-800">
                  <Calendar className="w-5 h-5" />
                  90 Days to 365 Days
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">$625</div>
                <p className="text-blue-700 font-medium">Maximum reservation limit</p>
              </CardContent>
            </Card>

            {/* More Than 365 Days */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-purple-800">
                  <Users className="w-5 h-5" />
                  More Than 365 Days
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">$1,750</div>
                <p className="text-purple-700 font-medium">Maximum reservation limit</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Important Notice Section */}
        <Card className="mb-12 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-6 h-6" />
              Important Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-orange-800">Limits are based on your duration of stay</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-orange-800">Products will be ready for collection at the airport</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-orange-800">Please have your travel documents ready when collecting</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Extra Notice */}
        <Card className="mb-10 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Info className="w-5 h-5" />
              Additional Allowance Note
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base text-blue-900 font-medium mb-2">
              If you are planning to bring any electrical items through UPB (Cargo), please make sure that leaves sufficient allowance to clear them.
            </div>
            <div className="text-blue-800 text-sm">
              For further clarifications, please contact B.I.A Duty Free team. <br />
              Or refer to the{' '}
              <a
                href="https://www.customs.gov.lk/personal/travellers/"
                className="underline text-blue-600 hover:text-blue-900"
                target="_blank" rel="noopener noreferrer"
              >
                SL Customs Website &rarr;
              </a>
            </div>
          </CardContent>
        </Card>
        
        <ProductGrid mode="duty-free" />
      </div>
      
      <Footer />
    </div>
  );
};

export default Allowance;
