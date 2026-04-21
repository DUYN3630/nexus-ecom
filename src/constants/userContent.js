import {
  Smartphone, Monitor, Tablet, Watch, Tv, Cpu, ShoppingBag, Info
} from 'lucide-react';

export const NAV_CATEGORIES = [
  {
    id: 'store',
    name: 'Cửa hàng',
    icon: ShoppingBag,
    children: []
  },
  {
    id: 'iphone',
    name: 'iPhone',
    icon: Smartphone,
    children: [
      { id: 'ip-15-pro', name: 'iPhone 15 Pro' },
      { id: 'ip-15', name: 'iPhone 15' },
      { id: 'ip-14', name: 'iPhone 14' },
      { id: 'ip-se', name: 'iPhone SE' },
      { id: 'ip-compare', name: 'So sánh iPhone' }
    ]
  },
  {
    id: 'mac',
    name: 'Mac',
    icon: Monitor,
    children: [
      { id: 'mac-air', name: 'MacBook Air' },
      { id: 'mac-pro', name: 'MacBook Pro' },
      { id: 'imac', name: 'iMac' },
      { id: 'mac-mini', name: 'Mac mini' },
      { id: 'mac-studio', name: 'Mac Studio' }
    ]
  },
  {
    id: 'ipad',
    name: 'iPad',
    icon: Tablet,
    children: [
      { id: 'ipad-pro', name: 'iPad Pro' },
      { id: 'ipad-air', name: 'iPad Air' },
      { id: 'ipad-gen', name: 'iPad (Gen 10)' },
      { id: 'ipad-mini', name: 'iPad mini' }
    ]
  },
  {
    id: 'watch',
    name: 'Watch',
    icon: Watch,
    children: [
      { id: 'w-ultra', name: 'Apple Watch Ultra 2' },
      { id: 'w-s9', name: 'Apple Watch Series 9' },
      { id: 'w-se', name: 'Apple Watch SE' },
      { id: 'w-hermes', name: 'Apple Watch Hermès' }
    ]
  },
  {
    id: 'tv-ent',
    name: 'TV & Entertainment',
    icon: Tv,
    children: [
      { id: 'apple-tv', name: 'Apple TV 4K' },
      { id: 'homepod', name: 'HomePod' },
      { id: 'homepod-mini', name: 'HomePod mini' }
    ]
  },
  {
    id: 'acc',
    name: 'Accessories',
    icon: Cpu,
    children: [
      { id: 'magsafe', name: 'MagSafe' },
      { id: 'airtag', name: 'AirTag' },
      { id: 'airpods', name: 'AirPods' },
      { id: 'beats', name: 'Beats by Dre' }
    ]
  },
  {
    id: 'about',
    name: 'Về chúng tôi',
    icon: Info,
    children: []
  }
];

export const HERO_SLIDES = [
  {
    id: 1,
    headline: "Hiệu năng Pro.\nTitan tự nhiên.",
    subtitle: "iPhone 15 Pro với chip A17 Pro mạnh mẽ nhất từ trước đến nay.",
    buttonText: "Mua ngay từ $999",
    imageUrl: "/products/product-archive-1.jpg"
  },
  {
    id: 2,
    headline: "MacBook Air M3.\nMỏng. Mạnh. Mới.",
    subtitle: "Laptop mỏng nhẹ nhất thế giới nay còn mạnh mẽ hơn với chip M3.",
    buttonText: "Khám phá MacBook",
    imageUrl: "https://images.unsplash.com/photo-1517336712468-da1133206-80ce9b88a853?auto=format&fit=crop&q=80&w=1200"
  }
];
