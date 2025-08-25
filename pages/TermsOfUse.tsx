
import React from 'react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { useIsClient } from '@/hooks/useIsClient';

const TermsOfUse = () => {
  const isClient = useIsClient();
  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-background">
            <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Terms of Use</h1>
          <p className="text-muted-foreground mb-6">
            These Terms of Use (&quot;Terms&quot;) govern your use of the Metro International Duty Free website and services.
          </p>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using the Metro International Duty Free (Pvt) Ltd. website and services, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Use License</h2>
              <p className="mb-4">
                Permission is granted to temporarily download one copy of the materials on Metro International Duty Free&apos;s 
                website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
                <li>attempt to decompile or reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Duty Free Services</h2>
              <h3 className="text-xl font-medium mb-3">Eligibility</h3>
              <p className="mb-4">Our duty-free services are available to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>International passengers departing from Bandaranaike International Airport</li>
                <li>Passengers with valid boarding passes and travel documents</li>
                <li>Customers meeting customs and immigration requirements</li>
              </ul>
              
              <h3 className="text-xl font-medium mb-3">Pre-Orders and Collection</h3>
              <p className="mb-4">
                Pre-orders must be collected at our airport showroom before departure. Orders not collected within 
                the specified timeframe may be subject to cancellation. Collection requires valid travel documents 
                and order confirmation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Guest Checkout</h2>
              <p className="mb-4">
                Customers may place orders without creating an account using our guest checkout feature. 
                Guest customers are responsible for maintaining their order information and collection details.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Product Information</h2>
              <p className="mb-4">
                We strive to provide accurate product information, including specifications, availability, and pricing. 
                However, we reserve the right to correct any errors, inaccuracies, or omissions and to change or update 
                information at any time without prior notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Pricing and Payment</h2>
              <p className="mb-4">
                All prices are displayed excluding duties and taxes as applicable to duty-free purchases. 
                Payment is required at the time of collection unless other arrangements have been made. 
                We reserve the right to refuse any order placed.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Cancellation and Refunds</h2>
              <p className="mb-4">
                Orders may be cancelled or modified subject to our cancellation policy. Refunds will be processed 
                according to the original payment method and may be subject to processing fees and time limitations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">User Conduct</h2>
              <p className="mb-4">You agree not to use our website to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Upload or transmit viruses or malicious code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper working of the website</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Impersonate other persons or entities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
              <p className="mb-4">
                The content, organization, graphics, design, compilation, magnetic translation, digital conversion, 
                and other matters related to the website are protected under applicable copyrights, trademarks, 
                and other proprietary rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
              <p className="mb-4">
                Metro International Duty Free (Pvt) Ltd. shall not be liable for any special, indirect, incidental, 
                or consequential damages that result from the use of, or the inability to use, the materials on this 
                website or the performance of the products, even if we have been advised of the possibility of such damages.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
              <p className="mb-4">
                These terms and conditions are governed by and construed in accordance with the laws of Sri Lanka, 
                and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to revise these terms of use at any time without notice. By using this website, 
                you are agreeing to be bound by the then-current version of these terms of use.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <p className="mb-4">
                If you have any questions about these Terms of Use, please contact us at:
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

export default TermsOfUse;
