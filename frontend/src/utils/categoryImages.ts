import { MaterialListing } from '../types';

export const CATEGORY_IMAGES: Record<string, string> = {
  'Paper/Cardboard': '/images/cat-cardboard.jpg',
  'Plastic': '/images/cat-plastic.jpg',
  'Metal': '/images/cat-metal.jpg',
  'Glass': '/images/cat-glass.jpg',
  'Wood': '/images/cat-wood.jpg',
  'Textile': '/images/cat-textile.jpg',
  'Food waste': '/images/cat-food-waste.jpg',
  'Packaging materials': '/images/cat-packaging.jpg',
  'Construction materials': '/images/cat-construction.jpg',
  'Industrial scrap': '/images/cat-industrial-scrap.jpg',
  'Furniture': '/images/cat-furniture.jpg',
  'Business equipment': '/images/cat-business-equipment.jpg',
};

const TITLE_KEYWORD_IMAGES: Array<{ pattern: RegExp; image: string }> = [
  { pattern: /\b(cardboard|corrugated|kraft|carton|paper)\b/i, image: CATEGORY_IMAGES['Paper/Cardboard'] },
  { pattern: /\b(plastic|hdpe|ldpe|pet|pvc|polyethylene|polymer|granule|regrind)\b/i, image: CATEGORY_IMAGES['Plastic'] },
  { pattern: /\b(steel|stainless|ss\s*304|metal|iron|alloy|aluminum|aluminium|copper)\b/i, image: CATEGORY_IMAGES['Metal'] },
  { pattern: /\b(wood|wooden|timber|pallet|epal|pine|lumber)\b/i, image: CATEGORY_IMAGES['Wood'] },
  { pattern: /\b(glass|bottle|amber|cullet)\b/i, image: CATEGORY_IMAGES['Glass'] },
  { pattern: /\b(textile|fabric|cotton|garment|cloth|clipping|selvedge)\b/i, image: CATEGORY_IMAGES['Textile'] },
  { pattern: /\b(food|organic|compost|biomass|peel|vegetable)\b/i, image: CATEGORY_IMAGES['Food waste'] },
  { pattern: /\b(packaging|wrap|stretch film|box)\b/i, image: CATEGORY_IMAGES['Packaging materials'] },
  { pattern: /\b(brick|concrete|tile|construction|cement)\b/i, image: CATEGORY_IMAGES['Construction materials'] },
  { pattern: /\b(furniture|desk|chair|office)\b/i, image: CATEGORY_IMAGES['Furniture'] },
  { pattern: /\b(equipment|machinery|rack|worktable)\b/i, image: CATEGORY_IMAGES['Business equipment'] },
];

// Legacy Unsplash URLs that were previously mismatched or broken (404/irrelevant)
const LEGACY_MISMATCHED_IDS = [
  '1530587191325',
  '1595278069441',
  '1586528116311',
  '1558769132',
  '1513558161293',
  '1565793298595',
  '1504917599217',
  '1589365278144',
  '1607604276583',
  '1514432324607',
  '1577705998148',
  '1590069261209',
  '1518709268805',
  '1524758631624',
  '1581092160607',
  '1578328819058',
  '1542601906990',
];

export function isLegacyStockUrl(url: string): boolean {
  return Boolean(url && LEGACY_MISMATCHED_IDS.some((id) => url.includes(id)));
}

export function getCategoryFallbackImage(category?: string | null, title?: string | null): string {
  if (category && CATEGORY_IMAGES[category]) {
    return CATEGORY_IMAGES[category];
  }
  if (title) {
    for (const entry of TITLE_KEYWORD_IMAGES) {
      if (entry.pattern.test(title)) {
        return entry.image;
      }
    }
  }
  return CATEGORY_IMAGES['Paper/Cardboard'];
}

export function getListingPrimaryImage(listing: Partial<MaterialListing> & { imageUrl?: string }): string {
  const fallback = getCategoryFallbackImage(listing?.category, listing?.title);
  let candidate = '';

  if (Array.isArray(listing?.images) && listing.images.length > 0) {
    const primary = listing.images.find((img) => img?.isPrimary)?.url;
    candidate = primary || listing.images[0]?.url || '';
  } else if (typeof listing?.imageUrl === 'string' && listing.imageUrl) {
    candidate = listing.imageUrl;
  }

  if (!candidate || isLegacyStockUrl(candidate)) {
    return fallback;
  }

  return candidate;
}
