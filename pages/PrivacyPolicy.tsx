
import React from 'react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { useIsClient } from '@/hooks/useIsClient';

const PrivacyPolicy = () => {
  const isClient = useIsClient();
  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-background">
            <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-6">
            This Privacy Policy describes how Metro International Duty Free (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) collects, uses, and shares your personal information when you visit our website or use our services.
          </p>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
              <p className="mb-4">
                Metro International Duty Free (Pvt) Ltd. (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit 
                our website or use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              <h3 className="text-xl font-medium mb-3">Personal Information</h3>
              <p className="mb-4">We may collect personal information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Name and contact information (email, phone number)</li>
                <li>Passport information for duty-free purchases</li>
                <li>Flight details for product collection</li>
                <li>Payment information for transactions</li>
                <li>Account credentials when you create an account</li>
              </ul>
              
              <h3 className="text-xl font-medium mb-3">Usage Information</h3>
              <p className="mb-4">We automatically collect information about your use of our website:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>IP address and location data</li>
                <li>Pages visited and time spent on our site</li>
                <li>Shopping cart and purchase history</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Process your orders and arrange product collection</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Send order confirmations and collection notifications</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations and duty-free regulations</li>
                <li>Prevent fraud and ensure security</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
              <p className="mb-4">We do not sell, trade, or otherwise transfer your personal information to third parties except:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>To trusted service providers who assist in operating our website and business</li>
                <li>When required by law or to protect our rights</li>
                <li>To customs authorities as required for duty-free sales</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <p className="mb-4">
                We implement appropriate security measures to protect your personal information against unauthorized 
                access, alteration, disclosure, or destruction. However, no method of transmission over the Internet 
                is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
              <p className="mb-4">
                Our website uses cookies to enhance your browsing experience, remember your preferences, and analyze 
                website traffic. You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Data portability where applicable</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p><strong>Metro International Duty Free (Pvt) Ltd.</strong></p>
                <p>Terminal 2, Departure Lounge</p>
                <p>Bandaranaike International Airport</p>
                <p>Email: info@metrodutyfree.com</p>
                <p>Phone: +94 77 340 1876</p>
              </div>
            </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
