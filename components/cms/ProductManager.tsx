
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Save, Plus, Trash2, Search as SearchIcon, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePersistentState } from '@/hooks/usePersistentState';
import { RichTextEditor } from './RichTextEditor';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string | null;
  insight: string | null;
  category: string;
  image_url: string | null;
  rating: number | null;
  reviews_count: number | null;
  in_stock: boolean | null;
  specifications: Record<string, unknown>;
  display_order: number | null;
  is_visible: boolean | null;
  created_at: string;
  updated_at: string;
}

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number | null;
  is_primary: boolean | null;
}

export const ProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Group products by category
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Sort products within each category by display_order
  Object.keys(groupedProducts).forEach(category => {
    groupedProducts[category].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  });

  // ---- Persistent form data functionality ----
  const getDraftKey = (editingId: string | null, isCreating: boolean) => {
    if (isCreating) return "edit-draft-product-new";
    if (editingId) return `edit-draft-product-${editingId}`;
    return "";
  };

  const draftKey = getDraftKey(editingId, isCreating);

  const specsTemplate = `{
    "brand": "",
    "model": "",
    "color": "",
    "size": "",
    "material": ""
  }`;

  const initialFormData = {
    name: '',
    description: '',
    insight: '',
    category: '',
    image_url: '',
    rating: '0',
    reviews_count: '0',
    in_stock: true,
    is_visible: true,
    display_order: '0',
    specifications: specsTemplate
  };

  const [formData, setFormDataRaw] = usePersistentState(
    initialFormData,
    "edit-draft-product-dummy"
  );

  const setFormData = (updater: (prev: typeof formData) => typeof formData) => {
    if (editingId || isCreating) {
      const newData = updater(formData);
      setFormDataRaw(newData);
    }
  };

  const clearFormDataDraft = () => {
    if (draftKey) window.localStorage.removeItem(draftKey);
  };

  const fetchProducts = useCallback(async () => {
    try {
      setIsSearching(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category')
        .order('display_order')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error: unknown) {
      toast({
        title: "Error loading products",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [toast]);

  const fetchProductImages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setProductImages(data || []);
    } catch (error: unknown) {
      console.error('Error loading product images:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchProductImages();
  }, [fetchProducts, fetchProductImages]);

  useEffect(() => {
    // Live filter on searchTerm change
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) => {
        const q = searchTerm.toLowerCase();
        return (
          product.name.toLowerCase().includes(q) ||
          (product.category && product.category.toLowerCase().includes(q)) ||
          (product.description && product.description.toLowerCase().includes(q))
        );
      });
      setFilteredProducts(filtered);
    }
  }, [products, searchTerm]);

  const moveProduct = async (productId: string, direction: 'up' | 'down', category: string) => {
    const categoryProducts = groupedProducts[category];
    const currentIndex = categoryProducts.findIndex(p => p.id === productId);
    
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === categoryProducts.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentProduct = categoryProducts[currentIndex];
    const targetProduct = categoryProducts[targetIndex];

    try {
      // Swap display_order values
      await supabase
        .from('products')
        .update({ display_order: targetProduct.display_order })
        .eq('id', currentProduct.id);

      await supabase
        .from('products')
        .update({ display_order: currentProduct.display_order })
        .eq('id', targetProduct.id);

      fetchProducts();
      toast({
        title: "Product order updated",
        description: "Product display order has been updated successfully",
      });
    } catch (error: unknown) {
      toast({
        title: "Error updating order",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const toggleVisibility = async (productId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_visible: !currentVisibility })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Product visibility updated",
        description: `Product is now ${!currentVisibility ? 'visible' : 'hidden'}`,
      });

      fetchProducts();
    } catch (error: unknown) {
      toast({
        title: "Error updating visibility",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const startEdit = (product: Product) => {
    let specsString = '';
    if (
      !product.specifications ||
      (typeof product.specifications === 'object' &&
        Object.keys(product.specifications).length === 0) ||
      (
        typeof product.specifications === 'object' &&
        Object.keys(product.specifications).length === 1 &&
        Object.keys(product.specifications)[0] === "" &&
        product.specifications[""] === ""
      )
    ) {
      specsString = specsTemplate;
    } else {
      specsString = JSON.stringify(product.specifications, null, 2);
    }
    setEditingId(product.id);
    setIsCreating(false);

    const nextDraftKey = getDraftKey(product.id, false);
    const maybeDraft = window.localStorage.getItem(nextDraftKey);
    if (maybeDraft) {
      try {
        const draft = JSON.parse(maybeDraft);
        setFormDataRaw(draft);
        console.log("Loaded edit draft from localStorage", draft);
      } catch {
        setFormDataRaw({
          name: product.name,
          description: product.description || '',
          insight: product.insight || '',
          category: product.category,
          image_url: product.image_url || '',
          rating: (product.rating || 0).toString(),
          reviews_count: (product.reviews_count || 0).toString(),
          in_stock: product.in_stock || false,
          is_visible: product.is_visible || true,
          display_order: (product.display_order || 0).toString(),
          specifications: specsString
        });
      }
    } else {
      setFormDataRaw({
        name: product.name,
        description: product.description || '',
        insight: product.insight || '',
        category: product.category,
        image_url: product.image_url || '',
        rating: (product.rating || 0).toString(),
        reviews_count: (product.reviews_count || 0).toString(),
        in_stock: product.in_stock || false,
        is_visible: product.is_visible || true,
        display_order: (product.display_order || 0).toString(),
        specifications: specsString
      });
    }
    setNewImageUrl('');
  };

  const cancelEdit = () => {
    clearFormDataDraft();
    setEditingId(null);
    setIsCreating(false);
    setNewImageUrl('');
    setFormDataRaw(initialFormData);
  };

  const saveProduct = async () => {
    try {
      let specifications = {};
      try {
        specifications = JSON.parse(formData.specifications);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast({
          title: "Invalid JSON",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      const productData: {
        name: string;
        description: string | null;
        insight: string | null;
        category: string;
        image_url: string | null;
        rating: number;
        reviews_count: number;
        in_stock: boolean;
        is_visible: boolean;
        display_order: number;
        specifications: Record<string, unknown>;
      } = {
        name: formData.name,
        description: formData.description || null,
        insight: formData.insight || null,
        category: formData.category,
        image_url: formData.image_url || null,
        rating: parseFloat(formData.rating) || 0,
        reviews_count: parseInt(formData.reviews_count) || 0,
        in_stock: formData.in_stock,
        is_visible: formData.is_visible,
        display_order: parseInt(formData.display_order) || 0,
        specifications
      };

      if (isCreating) {
        const { error } = await supabase
          .from('products')
          .insert(productData);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: isCreating ? "Product created successfully" : "Product updated successfully",
      });

      fetchProducts();
      clearFormDataDraft();
      cancelEdit();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error saving product",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully",
      });

      fetchProducts();
    } catch (error: unknown) {
      toast({
        title: "Error deleting product",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const addProductImage = async (productId: string) => {
    if (!newImageUrl.trim()) return;

    try {
      const { error } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          image_url: newImageUrl,
          display_order: 0,
          is_primary: false
        });

      if (error) throw error;

      toast({
        title: "Image added",
        description: "Product image has been added successfully",
      });

      setNewImageUrl('');
      fetchProductImages();
    } catch (error: unknown) {
      toast({
        title: "Error adding image",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const deleteProductImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast({
        title: "Image deleted",
        description: "Product image has been deleted successfully",
      });

      fetchProductImages();
    } catch (error: unknown) {
      toast({
        title: "Error deleting image",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const getProductImages = (productId: string) => {
    return productImages.filter(img => img.product_id === productId);
  };

  const showAddButton = !isCreating && !editingId;

  const handleAddProduct = () => {
    setIsCreating(true);
    setEditingId(null);
    setNewImageUrl('');
    const nextDraftKey = getDraftKey(null, true);
    const maybeDraft = window.localStorage.getItem(nextDraftKey);
    if (maybeDraft) {
      try {
        const draft = JSON.parse(maybeDraft);
        setFormDataRaw(draft);
        console.log("Recovered 'create product' draft from localStorage", draft);
      } catch {
        setFormDataRaw(initialFormData);
      }
    } else {
      setFormDataRaw(initialFormData);
    }
  };

  if (loading) {
    return <div className="text-center">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      {/* USAGE INSTRUCTIONS */}
      <div className="mb-4 rounded bg-blue-50 text-blue-800 px-4 py-3">
        <div className="font-medium mb-1">How to upload images:</div>
        <ul className="list-disc ml-6 text-sm mb-1">
          <li>
            <span className="font-semibold">Main Image:</span> 
            Paste the image&apos;s public URL (e.g. from Supabase Storage or any direct image upload CDN) into the &quot;Main Image URL&quot; field for each product. It will be used everywhere as the default image for this product.
          </li>
          <li>
            <span className="font-semibold">Additional Images:</span>
            To add up to 3 extra images, paste their public URLs (they can be hosted on Supabase Storage or a CDN) into the <span className="underline">&quot;Image URL&quot;</span> box below &quot;Additional Images&quot; inside each product and click <b>Add</b>. These show in the product detail page/image gallery.
          </li>
        </ul>
        <div className="text-xs text-blue-700">Tip: To use your own image, upload it to your preferred storage (Supabase Storage, Unsplash, or any CDN) and copy the direct image link.</div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Product Management</h2>
          {showAddButton && (
            <Button
              size="sm"
              className="ml-2"
              onClick={handleAddProduct}
              variant="default"
              aria-label="Add Product"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Product
            </Button>
          )}
        </div>
        {/* Search field */}
        <div className="flex items-center gap-2 md:ml-auto w-full md:w-80">
          <span className="relative flex-1">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              aria-label="Search products"
            />
            <SearchIcon className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </span>
          {searchTerm && (
            <button
              className="ml-1 text-muted-foreground hover:text-primary text-sm"
              aria-label="Clear search"
              onClick={() => setSearchTerm('')}
              tabIndex={0}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {(isCreating || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{isCreating ? 'Create New Product' : 'Edit Product'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                  placeholder="Product name"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, category: e.target.value }))}
                  placeholder="Product category"
                />
              </div>
            </div>
            
            <div>
              <Label>Description (with Media Support)</Label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData((prev: any) => ({ ...prev, description: value }))}
                placeholder="Enter product description with support for images, videos, and YouTube links..."
              />
            </div>
            
            <div>
              <Label htmlFor="insight">Insight</Label>
              <Textarea
                id="insight"
                value={formData.insight}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, insight: e.target.value }))}
                placeholder="Enter product insights here"
                className="min-h-20"
              />
            </div>
            
            <div>
              <Label htmlFor="image_url">Main Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, rating: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="reviews_count">Reviews Count</Label>
                <Input
                  id="reviews_count"
                  type="number"
                  min="0"
                  value={formData.reviews_count}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, reviews_count: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, display_order: e.target.value }))}
                />
              </div>
              
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="in_stock"
                    checked={formData.in_stock}
                    onCheckedChange={(checked: boolean) => setFormData((prev: any) => ({ ...prev, in_stock: checked }))}
                  />
                  <Label htmlFor="in_stock">In Stock</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_visible"
                    checked={formData.is_visible}
                    onCheckedChange={(checked: boolean) => setFormData((prev: any) => ({ ...prev, is_visible: checked }))}
                  />
                  <Label htmlFor="is_visible">Visible</Label>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="specifications">Specifications (JSON)</Label>
              <Textarea
                id="specifications"
                value={formData.specifications}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, specifications: e.target.value }))}
                placeholder='{"key": "value"}'
                className="min-h-24 font-mono text-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={saveProduct}>
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

      <div className="space-y-6">
        {Object.keys(groupedProducts).length === 0 && !isSearching && searchTerm ? (
          <div className="text-center text-muted-foreground italic py-8">
            No products match your search.
          </div>
        ) : (
          Object.keys(groupedProducts).sort().map((category) => (
            <div key={category} className="space-y-4">
              <h3 className="text-xl font-semibold text-primary border-b pb-2">
                {category} ({groupedProducts[category].length} products)
              </h3>
              
              <div className="grid gap-4">
                {groupedProducts[category].map((product, index) => {
                  const images = getProductImages(product.id);
                  
                  return (
                    <Card key={product.id} className={!product.is_visible ? 'opacity-60 border-dashed' : ''}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                              {product.name}
                              <Badge variant="outline">{product.category}</Badge>
                              {product.in_stock ? (
                                <Badge variant="secondary" className="text-green-700 bg-green-100">
                                  In Stock
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  Out of Stock
                                </Badge>
                              )}
                              {!product.is_visible && (
                                <Badge variant="secondary" className="text-red-700 bg-red-100">
                                  Hidden
                                </Badge>
                              )}
                            </CardTitle>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveProduct(product.id, 'up', category)}
                              disabled={index === 0}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveProduct(product.id, 'down', category)}
                              disabled={index === groupedProducts[category].length - 1}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleVisibility(product.id, Boolean(product.is_visible))}
                            >
                              {product.is_visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(product)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteProduct(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            {product.description && (
                              <p className="text-muted-foreground mb-2 line-clamp-3">
                                {product.description}
                              </p>
                            )}
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>Rating: {product.rating || 0}/5</span>
                              <span>Reviews: {product.reviews_count || 0}</span>
                              <span>Order: {product.display_order || 0}</span>
                            </div>
                            {product.image_url && (
                              <div className="mt-2">
                                <Image
                                  src={product.image_url}
                                  alt={product.name}
                                  className="h-20 w-20 object-cover rounded"
                                  width={80}
                                  height={80}
                                  unoptimized
                                />
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Image className="w-4 h-4" src="/placeholder.svg" alt="Placeholder" width={16} height={16} />
                              Additional Images ({images.length})
                            </h4>
                            
                            <div className="flex gap-2 mb-2">
                              <Input
                                placeholder="Image URL"
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                className="text-sm"
                              />
                              <Button
                                size="sm"
                                onClick={() => addProductImage(product.id)}
                              >
                                Add
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2">
                              {images.map((image) => (
                                <div key={image.id} className="relative group">
                                  <Image
                                    src={image.image_url}
                                    alt="Product"
                                    className="h-16 w-16 object-cover rounded"
                                    width={64}
                                    height={64}
                                    unoptimized
                                  />
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-1 -right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => deleteProductImage(image.id)}
                                  >
                                    ×
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
