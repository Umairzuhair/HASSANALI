
import { Button } from '@/components/ui/button';
import { Package, MapPin, Phone } from 'lucide-react';

interface CenterNavigationProps {
  onAllowanceClick: () => void;
  onStoreLocatorClick: () => void;
  onWhatsAppClick: () => void;
}

export const CenterNavigation = ({
  onAllowanceClick,
  onStoreLocatorClick,
  onWhatsAppClick,
}: CenterNavigationProps) => {
  return (
    <nav className="hidden md:flex items-center space-x-6">
      <Button variant="ghost" size="sm" onClick={onAllowanceClick}>
        <Package className="w-4 h-4 mr-2" /> Allowance
      </Button>
      <Button variant="ghost" size="sm" onClick={onStoreLocatorClick}>
        <MapPin className="w-4 h-4 mr-2" /> Store Locator
      </Button>
      <Button variant="ghost" size="sm" onClick={onWhatsAppClick}>
        <Phone className="w-4 h-4 mr-2" /> WhatsApp
      </Button>
    </nav>
  );
};
