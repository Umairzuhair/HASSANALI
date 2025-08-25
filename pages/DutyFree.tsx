
import { useIsClient } from '@/hooks/useIsClient';
import { useState } from 'react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { ProductGrid } from '@/components/ProductGrid';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { BackToTopButton } from '@/components/BackToTopButton';
import { SEOHead } from '@/components/SEO/SEOHead';
import { generateCanonicalUrl } from '@/utils/seoUtils';

const DutyFree = () => {
  const isClient = useIsClient();
  const [activeMode, setActiveMode] = useState<'duty-free' | 'allowance' | null>('duty-free');

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Duty Free Products - Metro International Duty Free"
        description="Browse our complete duty-free collection. Shop electronics, appliances and more at airport prices. Available for pickup at Bandaranaike Airport, Sri Lanka."
        keywords="duty free products, electronics, airport shopping, sri lanka duty free, bandaranaike airport"
        canonical={generateCanonicalUrl('/duty-free')}
      />
      
      <Header />
      <WhatsAppFloat />
      <BackToTopButton />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Duty Free Products</h1>
          <p className="text-xl text-muted-foreground">
            Discover our curated selection of duty-free products
          </p>
        </div>
        
        <ProductGrid mode="duty-free" />
      </div>
      
      <Footer />
    </div>
  );
};

export default DutyFree;
