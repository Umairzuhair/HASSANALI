
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Pencil, Save, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

export const BrandLogoManager = () => {
  const [logos, setLogos] = useState<Array<{
    id: string;
    name: string;
    image_url: string;
    display_order: number | null;
    is_active: boolean | null;
    created_at: string;
    updated_at: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    display_order: '0',
    is_active: true
  });

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_logos')
        .select('*')
        .order('display_order')
        .order('name');

      if (error) throw error;
      setLogos(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error loading brand logos",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const moveLogo = async (logoId: string, direction: 'up' | 'down') => {
    const currentIndex = logos.findIndex(l => l.id === logoId);
    
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === logos.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentLogo = logos[currentIndex];
    const targetLogo = logos[targetIndex];

    try {
      // Swap display_order values
      await supabase
        .from('brand_logos')
        .update({ display_order: targetLogo.display_order })
        .eq('id', currentLogo.id);

      await supabase
        .from('brand_logos')
        .update({ display_order: currentLogo.display_order })
        .eq('id', targetLogo.id);

      fetchLogos();
      toast({
        title: "Logo order updated",
        description: "Brand logo display order has been updated successfully",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error updating order",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const startEdit = (logo: BrandLogo) => {
    setEditingId(logo.id);
    setIsCreating(false);
    setFormData({
      name: logo.name,
      image_url: logo.image_url,
      display_order: (logo.display_order || 0).toString(),
      is_active: logo.is_active || false
    });
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      name: '',
      image_url: '',
      display_order: '0',
      is_active: true
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({
      name: '',
      image_url: '',
      display_order: '0',
      is_active: true
    });
  };

  const saveLogo = async () => {
    try {
      const logoData = {
        name: formData.name,
        image_url: formData.image_url,
        display_order: parseInt(formData.display_order) || 0,
        is_active: formData.is_active
      };

      if (isCreating) {
        const { error } = await supabase
          .from('brand_logos')
          .insert(logoData);
        if (error) throw error;
      } else if (editingId) {
        const { error } = await supabase
          .from('brand_logos')
          .update(logoData)
          .eq('id', editingId);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: isCreating ? "Brand logo created successfully" : "Brand logo updated successfully",
      });

      fetchLogos();
      cancelEdit();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error saving brand logo",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const deleteLogo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('brand_logos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Brand logo deleted",
        description: "Brand logo has been deleted successfully",
      });

      fetchLogos();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error deleting brand logo",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (logoId: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('brand_logos')
        .update({ is_active: !currentActive })
        .eq('id', logoId);

      if (error) throw error;

      toast({
        title: "Logo status updated",
        description: `Logo is now ${!currentActive ? 'active' : 'inactive'}`,
      });

      fetchLogos();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error updating status",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center">Loading brand logos...</div>;
  }

  const showAddButton = !isCreating && !editingId;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Brand Logo Management</h2>
        {showAddButton && (
          <Button onClick={startCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Brand Logo
          </Button>
        )}
      </div>

      {(isCreating || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{isCreating ? 'Create New Brand Logo' : 'Edit Brand Logo'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Brand Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Brand name"
                />
              </div>
              
              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="image_url">Logo Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={saveLogo}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {logos.map((logo, index) => (
          <Card key={logo.id} className={!logo.is_active ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Image
                    src={logo.image_url}
                    alt={logo.name}
                    className="h-12 w-auto object-contain"
                    width={120}
                    height={48}
                    unoptimized
                  />
                  <div>
                    <CardTitle className="text-lg">{logo.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Order: {logo.display_order} | {logo.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveLogo(logo.id, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveLogo(logo.id, 'down')}
                    disabled={index === logos.length - 1}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(logo.id, logo.is_active || false)}
                  >
                    {logo.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(logo)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteLogo(logo.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};
