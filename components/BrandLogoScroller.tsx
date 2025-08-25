
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Image from 'next/image';

interface BrandLogo {
  id: string;
  name: string;
  image_url: string;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

interface BrandLogoScrollerProps {
  initialLogos?: BrandLogo[];
}

export const BrandLogoScroller = ({ initialLogos = [] }: BrandLogoScrollerProps) => {
  const [logos, setLogos] = useState<BrandLogo[]>(initialLogos);

  useEffect(() => {
    // If we have initial logos, use them
    if (initialLogos.length > 0) {
      setLogos(initialLogos);
      return;
    }

    // Otherwise fetch from client
    const fetchLogos = async () => {
      try {
        const { data, error } = await supabase
          .from('brand_logos')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setLogos(data || []);
      } catch (error) {
        console.error('Error fetching brand logos:', error);
      }
    };

    fetchLogos();
  }, [initialLogos]);

  if (logos.length === 0) {
    return null;
  }

  return (
    <div className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Trusted Brands</h2>
        <div className="flex items-center justify-center space-x-8 overflow-hidden">
          {logos.map((logo) => (
            <div key={logo.id} className="flex-shrink-0">
              <Image
                src={logo.image_url}
                alt={logo.name}
                className="h-12 w-auto object-contain"
                width={120}
                height={48}
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
