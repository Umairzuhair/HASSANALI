
export const generateProductKeywords = (product: any) => {
  const keywords = [
    product.name,
    product.category,
    'duty free',
    'airport shopping',
    'electronics',
    'appliances',
    'sri lanka',
    'bandaranaike airport',
    'metro international'
  ];
  
  return keywords.join(', ');
};

export const generateProductSlug = (productName: string) => {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://metro-dutyfree.com';

export const generateCanonicalUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
};

export const generateProductUrl = (productId: string): string => {
  return generateCanonicalUrl(`/product/${productId}`);
};

export const generateCategoryUrl = (categorySlug: string): string => {
  return generateCanonicalUrl(`/category/${categorySlug}`);
};

export const generateImageUrl = (imagePath: string): string => {
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `${BASE_URL}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
};

export const truncateDescription = (text: string, maxLength: number = 160): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};
