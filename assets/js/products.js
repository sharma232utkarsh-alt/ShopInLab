/* Product catalogue — edit freely. Prices in INR. */
const CATEGORIES = {
  phones: 'Phones',
  laptops: 'Laptops',
  audio: 'Audio',
  wearables: 'Wearables'
};

const PRODUCTS = [
  { id: 'P1001', sku: 'PH-NOVA-128', name: 'Nova X Smartphone 128GB', category: 'phones', brand: 'Nova', price: 24999, emoji: '📱', desc: '6.6" AMOLED display, 50MP triple camera and an all-day 5000mAh battery.' },
  { id: 'P1002', sku: 'PH-NOVA-256P', name: 'Nova X Pro 256GB', category: 'phones', brand: 'Nova', price: 39999, emoji: '📱', desc: '120Hz display, 200MP main camera and 45W fast charging.' },
  { id: 'P1003', sku: 'PH-ORBIT-64', name: 'Orbit Lite 64GB', category: 'phones', brand: 'Orbit', price: 11999, emoji: '📲', desc: 'Compact everyday phone with a clean, ad-free interface.' },
  { id: 'P2001', sku: 'LT-AERO-14', name: 'AeroBook 14', category: 'laptops', brand: 'Aero', price: 58990, emoji: '💻', desc: 'Thin and light 14" laptop, 16GB RAM, 512GB SSD.' },
  { id: 'P2002', sku: 'LT-AERO-16P', name: 'AeroBook Pro 16', category: 'laptops', brand: 'Aero', price: 112990, emoji: '💻', desc: 'Creator-grade 16" laptop with dedicated graphics.' },
  { id: 'P2003', sku: 'LT-FLEX-13', name: 'Flex 2-in-1 13', category: 'laptops', brand: 'Flex', price: 45490, emoji: '🖥️', desc: 'Convertible touchscreen laptop with stylus support.' },
  { id: 'P3001', sku: 'AU-PULSE-ANC', name: 'Pulse ANC Headphones', category: 'audio', brand: 'Pulse', price: 8999, emoji: '🎧', desc: 'Over-ear active noise cancelling, 40-hour battery.' },
  { id: 'P3002', sku: 'AU-PULSE-BUDS', name: 'Pulse Buds 2', category: 'audio', brand: 'Pulse', price: 3499, emoji: '🎵', desc: 'True wireless earbuds with low-latency gaming mode.' },
  { id: 'P3003', sku: 'AU-BOOM-SPK', name: 'Boom Portable Speaker', category: 'audio', brand: 'Boom', price: 2799, emoji: '🔊', desc: 'Waterproof Bluetooth speaker with punchy bass.' },
  { id: 'P4001', sku: 'WR-TEMPO-W5', name: 'Tempo Watch 5', category: 'wearables', brand: 'Tempo', price: 14999, emoji: '⌚', desc: 'AMOLED smartwatch with GPS and sleep tracking.' },
  { id: 'P4002', sku: 'WR-TEMPO-BAND', name: 'Tempo Band', category: 'wearables', brand: 'Tempo', price: 2499, emoji: '📿', desc: 'Lightweight fitness band, 14-day battery.' },
  { id: 'P4003', sku: 'WR-RING-S1', name: 'Halo Smart Ring', category: 'wearables', brand: 'Halo', price: 19999, emoji: '💍', desc: 'Titanium smart ring for health and activity insights.' }
];
