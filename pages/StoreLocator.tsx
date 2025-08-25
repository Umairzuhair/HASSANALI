
import React from 'react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { BackToTopButton } from '@/components/BackToTopButton';
import Image from 'next/image';
import { useIsClient } from '@/hooks/useIsClient';

const StoreLocator = () => {
  const isClient = useIsClient();
  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <WhatsAppFloat />
      <BackToTopButton />

      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Store Locator</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Store Location</h1>
            <p className="text-muted-foreground">Visit our store at Bandaranaike International Airport</p>
          </div>

          <Card className="overflow-hidden">
            <div className="relative bg-black">
              <Image
                src="/lovable-uploads/ea486eef-8da8-4470-bad0-320c13592c91.png"
                alt="Metro International Store"
                className="w-full max-h-[500px] object-contain bg-white"
                style={{ background: "#fff", objectFit: "contain" }}
                width={1000}
                height={500}
                unoptimized
              />
              <div className="absolute inset-0 bg-black/10"></div>
            </div>

            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Metro International</h2>
                  <div className="space-y-2 text-lg">
                    <p className="font-medium">No. 30, 2nd Floor</p>
                    <p className="font-medium">Arrival Terminal</p>
                    <p className="font-medium">B.I.A Katunayake Airport</p>
                    <p className="font-medium">Sri Lanka</p>
                  </div>

                  <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                    <h3 className="font-semibold mb-2">Operating Hours</h3>
                    <p className="text-muted-foreground">24 Hours</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StoreLocator;

