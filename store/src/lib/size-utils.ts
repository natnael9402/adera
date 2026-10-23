export type ProductSizeType = 'shoe' | 'clothing' | null;

export const SHOE_SIZES = [
  'US 7 (EU 40)',
  'US 7.5 (EU 40.5)',
  'US 8 (EU 41)',
  'US 8.5 (EU 42)',
  'US 9 (EU 42.5)',
  'US 9.5 (EU 43)',
  'US 10 (EU 44)',
  'US 10.5 (EU 44.5)',
  'US 11 (EU 45)',
  'US 11.5 (EU 45.5)',
  'US 12 (EU 46)',
];

export const CLOTHING_SIZES = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '2XL',
  '3XL',
];

export function getProductSizeType(product?: { name?: string; category?: string; description?: string } | null): ProductSizeType {
  if (!product) return null;
  const name = (product.name || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const combined = `${category} ${name} ${desc}`;

  // Shoe / Footwear Detection
  const shoeKeywords = [
    'shoe', 'shoes', 'footwear', 'sneaker', 'sneakers', 'boot', 'boots',
    'runner', 'running shoe', 'trail running', 'jordan', 'air max', 'dunk',
    'slide', 'slides', 'sandal', 'sandals', 'loafer', 'loafers',
    'cleat', 'cleats', 'salomon xt', 'trainer', 'trainers', 'retro high',
    'low og', 'force 1', 'converse', 'vans', 'heel', 'heels'
  ];
  if (shoeKeywords.some(kw => combined.includes(kw))) {
    return 'shoe';
  }

  // Clothing / Apparel Detection
  const clothingKeywords = [
    'clothing', 'apparel', 'jacket', 'jackets', 'hoodie', 'hoodies', 'coat',
    'sweater', 'shirt', 't-shirt', 'tee', 'pants', 'jeans', 'trousers',
    'shorts', 'vest', 'outerwear', 'fleece', 'jersey', 'parka', 'windbreaker',
    'sweatshirt', 'sweatpants', 'dress', 'suit', 'blazer', 'hardshell', 'down jacket',
    'nuptse', 'beta ar', 'activewear', 'short sleeve', 'long sleeve', 'denim'
  ];
  if (clothingKeywords.some(kw => combined.includes(kw))) {
    return 'clothing';
  }

  if (category.includes('fashion') || category.includes('footwear') || category.includes('apparel')) {
    return 'clothing';
  }

  return null;
}

export function getDefaultSize(sizeType: ProductSizeType): string | undefined {
  if (sizeType === 'shoe') return 'US 10 (EU 44)';
  if (sizeType === 'clothing') return 'L';
  return undefined;
}
