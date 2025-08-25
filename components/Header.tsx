
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProductSearch } from '@/hooks/useProductSearch';
import { SearchBar } from '@/components/SearchBar';
import { MobileMenu } from '@/components/MobileMenu';
import { HeaderNavigation } from '@/components/HeaderNavigation';
import { CenterNavigation } from '@/components/CenterNavigation';
import Image from 'next/image';
import { useIsClient } from '@/hooks/useIsClient';

export const Header = () => {
  const isClient = useIsClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchProducts,
    clearSearch,
  } = useProductSearch();

  if (!isClient) return null;

  // Convert user to match the expected type for MobileMenu
  const convertedUser = user ? {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name
  } : null;

  const handleAllowanceClick = () => {
    router.push('/allowance');
    setMobileMenuOpen(false);
  };

  const handleStoreLocatorClick = () => {
    router.push('/store-locator');
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    router.push('/');
    setMobileMenuOpen(false);
  };

  const handleAccountClick = () => {
    if (user) {
      router.push('/account');
    } else {
      router.push('/auth');
    }
    setMobileMenuOpen(false);
  };

  const handleCartClick = () => {
    router.push('/cart');
    setMobileMenuOpen(false);
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = "94777316948";
    const message = "Hello! I'm interested in your products.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCategoryClick = (slug: string) => {
    router.push(`/category/${slug}`);
    setMobileMenuOpen(false);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchProducts(query);
  };

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`);
    setSearchOpen(false);
    clearSearch();
  };

  const closeSearch = () => {
    setSearchOpen(false);
    clearSearch();
  };

  return (
    <header className="bg-primary/5 border-b border-primary/20 sticky top-0 z-50 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Hamburger Menu & Logo */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <button 
              onClick={handleLogoClick}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Image 
                src="/lovable-uploads/53c25831-e597-4c4b-9bb6-368b3f1bff4f.png" 
                alt="Metro International Duty Free" 
                className="h-12 w-auto"
                width={120}
                height={48}
                unoptimized
              />
            </button>
          </div>

          {/* Center Navigation - Desktop Only */}
          <CenterNavigation
            onAllowanceClick={handleAllowanceClick}
            onStoreLocatorClick={handleStoreLocatorClick}
            onWhatsAppClick={handleWhatsAppClick}
          />

          {/* Right Side - Search, Account, Cart */}
          <HeaderNavigation
            onSearchClick={() => setSearchOpen(!searchOpen)}
            onAccountClick={handleAccountClick}
            onCartClick={handleCartClick}
          />
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <SearchBar
            searchQuery={searchQuery}
            searchResults={searchResults}
            isSearching={isSearching}
            onSearchChange={handleSearchInputChange}
            onClose={closeSearch}
            onProductClick={handleProductClick}
          />
        )}

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <MobileMenu
            user={convertedUser}
            onAccountClick={handleAccountClick}
            onCartClick={handleCartClick}
            onAllowanceClick={handleAllowanceClick}
            onStoreLocatorClick={handleStoreLocatorClick}
            onCategoryClick={handleCategoryClick}
            onWhatsAppClick={handleWhatsAppClick}
          />
        )}
      </div>
    </header>
  );
}

export default Header;
