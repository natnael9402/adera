export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand?: string;
  sku?: string;
  source?: string;
  specs?: Record<string, any>;
  stock?: number;
  rating?: number;
  sold?: number;
  isImported?: boolean;
  importedDetails?: any;
}

// 12 Category Model Catalogs with Extensive Unique Image Photo IDs
const CATEGORIES_DATA = [
  // 1. Laptops & Computers
  {
    category: 'Laptops & Computers',
    defaultSource: 'Verified Stock',
    brandPool: ['Apple', 'Dell', 'Lenovo', 'ASUS', 'HP', 'Razer', 'Alienware', 'Acer', 'MSI', 'LG', 'Samsung'],
    imagePool: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1593642634443-44adaa06623a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484788984921-03950022c9ef?auto=format&fit=crop&w=800&q=80',
    ],
    templates: [
      {
        titlePrefix: 'MacBook Pro 16" Liquid Retina XDR',
        variants: ['M3 Pro 18GB/512GB Space Black', 'M3 Max 36GB/1TB Silver', 'M3 Max 64GB/2TB Space Black', 'M4 Max 48GB/1TB Space Black', 'M3 Pro 36GB/512GB Silver'],
        description: 'Apple Silicon supercharged for pros. Extreme dynamic range display, 22-hour battery life, and pro studio connectivity.',
        specsBase: { Display: '16.2" Liquid Retina XDR 120Hz', Memory: 'Unified High-Bandwidth', Ports: '3x Thunderbolt 4, HDMI, MagSafe 3', Battery: 'Up to 22 Hours' },
        priceRange: [2299, 3899],
        discountRange: [10, 20],
      },
      {
        titlePrefix: 'MacBook Air 15" Liquid Retina Display',
        variants: ['M3 16GB/512GB Midnight', 'M3 8GB/256GB Starlight', 'M3 24GB/1TB Space Gray', 'M2 16GB/512GB Silver'],
        description: 'Strikingly thin design with up to 18 hours of battery life and an expansive 15.3-inch Liquid Retina display.',
        specsBase: { Display: '15.3" Liquid Retina', Processor: 'Apple M3 8-core CPU', Weight: '3.3 lbs (1.51 kg)', Audio: '6-Speaker Sound System' },
        priceRange: [1199, 1899],
        discountRange: [12, 22],
      },
      {
        titlePrefix: 'Dell XPS 16 InfinityEdge OLED Laptop',
        variants: ['Intel Core Ultra 9 32GB/1TB RTX 4070 Platinum', 'Intel Core Ultra 7 16GB/512GB RTX 4060 Graphite', 'Intel Core Ultra 7 32GB/1TB RTX 4070 OLED'],
        description: 'Futuristic seamless glass touch pad, capacitive touch function row, and 4K+ OLED InfinityEdge display.',
        specsBase: { Display: '16.3" 4K+ OLED Touch 90Hz', Graphics: 'NVIDIA GeForce RTX 4070 8GB', RAM: '32GB LPDDR5X', Storage: '1TB NVMe PCIe 4.0' },
        priceRange: [2199, 3199],
        discountRange: [15, 25],
      },
      {
        titlePrefix: 'Lenovo ThinkPad X1 Carbon Gen 12',
        variants: ['Intel Core Ultra 7 32GB/1TB WUXGA Carbon Fiber', 'Intel Core Ultra 5 16GB/512GB Black', 'Intel Core Ultra 7 64GB/2TB 2.8K OLED'],
        description: 'Ultralight executive business flagship. MIL-STD 810H durability, TrackPoint, and AI-boosted thermal management.',
        specsBase: { Processor: 'Intel Core Ultra 7 155H with Intel AI Boost', Weight: '2.42 lbs (1.09 kg)', Battery: '57Whr Rapid Charge', Security: 'Fingerprint & IR Camera' },
        priceRange: [1699, 2799],
        discountRange: [18, 30],
      },
      {
        titlePrefix: 'ASUS ROG Zephyrus G16 Gaming Laptop',
        variants: ['OLED 240Hz Intel Core Ultra 9 RTX 4080 Eclipse Gray', 'OLED 240Hz Intel Core Ultra 7 RTX 4070 Platinum White', 'OLED 240Hz AMD Ryzen 9 AI RTX 4090'],
        description: 'Precision-crafted CNC aluminum chassis with ROG Nebula OLED display and supreme vapor chamber cooling.',
        specsBase: { Display: '16" 2.5K OLED 240Hz 0.2ms', GPU: 'NVIDIA GeForce RTX 4080 12GB GDDR6', Audio: '6-speaker array with Dolby Atmos' },
        priceRange: [1999, 3499],
        discountRange: [10, 18],
      },
      {
        titlePrefix: 'Razer Blade 16 Dual-Mode Mini-LED',
        variants: ['Intel Core i9-14900HX 32GB/2TB RTX 4090 Anodized Black', 'Intel Core i9-14900HX 32GB/1TB RTX 4080 Mercury White', 'Intel Core i9-14900HX 64GB/4TB RTX 4090'],
        description: 'The worlds first dual-mode mini-LED display switching between 4K 120Hz creator mode and FHD+ 240Hz pro gaming.',
        specsBase: { Display: '16" Dual-Mode Mini-LED 4K/FHD+', Cooling: 'Patented Vapor Chamber', Build: 'T6 CNC Milled Aluminum' },
        priceRange: [2999, 4299],
        discountRange: [8, 15],
      },
    ],
  },

  // 2. Smartphones & Tablets
  {
    category: 'Smartphones & Tablets',
    defaultSource: 'Verified Stock',
    brandPool: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Microsoft', 'Motorola', 'Xiaomi'],
    imagePool: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1530319067432-f2a729c03db5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570891836654-d356347c9e7a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80',
    ],
    templates: [
      {
        titlePrefix: 'Apple iPhone 16 Pro Max Unlocked',
        variants: ['256GB Natural Titanium', '512GB Desert Titanium', '1TB Black Titanium', '128GB White Titanium'],
        description: 'Grade 5 Titanium design with A18 Pro chip, 48MP Fusion camera system, Camera Control button, and immense battery life.',
        specsBase: { Display: '6.9" Super Retina XDR ProMotion 120Hz', Chip: 'A18 Pro with 6-core GPU', MainCamera: '48MP Fusion 5x Telephoto' },
        priceRange: [1199, 1599],
        discountRange: [5, 12],
      },
      {
        titlePrefix: 'Samsung Galaxy S24 Ultra 5G AI Phone',
        variants: ['512GB Titanium Gray Unlocked', '256GB Titanium Black Unlocked', '1TB Titanium Violet with S-Pen'],
        description: 'Galaxy AI is here. Circle to Search, Live Translate, Note Assist, 200MP Quad Tele camera, and embedded S-Pen stylus.',
        specsBase: { Display: '6.8" Dynamic AMOLED 2X 2600 nits', Processor: 'Snapdragon 8 Gen 3 for Galaxy', Camera: '200MP + 50MP 5x Optical' },
        priceRange: [1149, 1549],
        discountRange: [15, 25],
      },
      {
        titlePrefix: 'Google Pixel 9 Pro XL Unlocked',
        variants: ['256GB Obsidian', '512GB Porcelain', '128GB Hazel', '1TB Rose Quartz'],
        description: 'Engineered by Google with Tensor G4, Gemini Live AI integration, Pro triple camera with 30x Super Res Zoom, and 7 years of updates.',
        specsBase: { Display: '6.8" Super Actua Display 3000 nits', Chip: 'Google Tensor G4 with Titan M2', RAM: '16GB High Performance' },
        priceRange: [999, 1399],
        discountRange: [10, 20],
      },
      {
        titlePrefix: 'Apple iPad Pro 13" Tandem OLED',
        variants: ['M4 Chip 256GB Wi-Fi Space Black', 'M4 Chip 512GB Wi-Fi + Cellular Silver', 'M4 Chip 1TB Nano-Texture Glass Space Black'],
        description: 'Unbelievably thin 5.1mm profile with breakthrough Ultra Retina XDR tandem OLED display and next-generation M4 performance.',
        specsBase: { Display: '13" Ultra Retina XDR Tandem OLED', Chip: 'Apple M4 10-core CPU', Thickness: '5.1 mm Ultra Slim' },
        priceRange: [1299, 2199],
        discountRange: [8, 15],
      },
      {
        titlePrefix: 'Samsung Galaxy Z Fold 6 5G',
        variants: ['512GB Silver Shadow', '256GB Navy', '1TB Crafted Black Unlocked'],
        description: 'Slimmer, lighter, and more durable foldable with dual screens, Armor Aluminum frame, and multi-window multitasking.',
        specsBase: { MainDisplay: '7.6" Dynamic AMOLED 2X 120Hz', CoverDisplay: '6.3" Dynamic AMOLED 2X', Durability: 'IP48 Water Resistant' },
        priceRange: [1799, 2299],
        discountRange: [12, 22],
      },
    ],
  },

  // 3. Audio & Headphones
  {
    category: 'Audio & Headphones',
    defaultSource: 'Verified Stock',
    brandPool: ['Sony', 'Apple', 'Bose', 'Sennheiser', 'Marshall', 'JBL', 'Bowers & Wilkins', 'Sonos', 'Shure', 'Bang & Olufsen'],
    imagePool: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598331668826-20cecc596b86?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578319439584-104c94d37305?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516715094483-75da7dee9758?auto=format&fit=crop&w=800&q=80',
    ],
    templates: [
      {
        titlePrefix: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
        variants: ['Black with Auto NC Optimizer', 'Silver with Auto NC Optimizer', 'Midnight Blue Special Edition'],
        description: 'Industry-leading noise cancellation with 8 microphones, Auto NC Optimizer, 30-hour battery life, and crystal-clear hands-free calling.',
        specsBase: { Battery: '30 Hours with Quick Charge', Drivers: '30mm Carbon Fiber Composite', Connectivity: 'Bluetooth 5.2 Multipoint' },
        priceRange: [348, 399],
        discountRange: [15, 25],
      },
      {
        titlePrefix: 'Apple AirPods Max Wireless Over-Ear Headphones',
        variants: ['Space Gray with Smart Case', 'Silver with Smart Case', 'Sky Blue with Smart Case', 'Midnight USB-C', 'Starlight USB-C'],
        description: 'High-fidelity audio with active noise cancellation, transparency mode, personalized spatial audio with dynamic head tracking.',
        specsBase: { Drivers: 'Apple-designed 40mm Dynamic', Canopy: 'Knit-Mesh Stainless Steel', Connectivity: 'Apple H1 Chip in Each Cup' },
        priceRange: [479, 549],
        discountRange: [10, 18],
      },
      {
        titlePrefix: 'Bose QuietComfort Ultra Wireless Headphones',
        variants: ['Black with Spatial Audio', 'White Smoke with Spatial Audio', 'Sandstone Limited Edition'],
        description: 'Breakthrough spatialized audio for immersive listening, world-class noise cancellation, and CustomTune technology.',
        specsBase: { Immersion: 'Bose Immersive Audio Mode', Battery: 'Up to 24 Hours', Microphones: 'Advanced Noise-Rejecting Array' },
        priceRange: [379, 429],
        discountRange: [12, 20],
      },
      {
        titlePrefix: 'Sennheiser Momentum 4 Wireless Audiophile Headphones',
        variants: ['Matte Black with 60Hr Battery', 'White/Silver with 60Hr Battery', 'Special SE Copper Edition'],
        description: 'Outstanding acoustic performance powered by 42mm audiophile-inspired transducers with a class-leading 60-hour battery life.',
        specsBase: { Battery: '60 Hours Incredible Lifespan', Codecs: 'aptX Adaptive, AAC, SBC', Equalizer: 'Built-in Sound Personalization' },
        priceRange: [299, 379],
        discountRange: [18, 30],
      },
      {
        titlePrefix: 'Marshall Stanmore III Bluetooth Home Speaker',
        variants: ['Black Classic Vintage', 'Cream Gold Vintage', 'Brown Heritage Edition'],
        description: 'Legendary Marshall room-filling sound with wider stereo soundstage, dynamic loudness, and signature vintage styling.',
        specsBase: { Amplifiers: 'One 50W Class D (Woofer) + Two 15W (Tweeters)', Inputs: 'Bluetooth 5.2, 3.5mm AUX, RCA', Design: 'Brass Accent Knobs' },
        priceRange: [329, 379],
        discountRange: [10, 18],
      },
    ],
  },

  // 4. Cameras & Drones
  {
    category: 'Cameras & Drones',
    defaultSource: 'Verified Stock',
    brandPool: ['Sony', 'Canon', 'Nikon', 'DJI', 'Fujifilm', 'GoPro', 'Insta360', 'Blackmagic Design', 'Leica'],
    imagePool: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=800&q=80',
    ],
    templates: [
      {
        titlePrefix: 'Sony Alpha A7 IV Full-Frame Mirrorless Camera',
        variants: ['Body Only (33MP / 4K 60p)', 'with FE 28-70mm f/3.5-5.6 Lens', 'with FE 24-70mm f/2.8 GM II Pro Kit'],
        description: 'Next-generation hybrid full-frame camera with 33MP Exmor R sensor, real-time eye autofocus for humans/animals/birds, and 4K 60p 10-bit 4:2:2 recording.',
        specsBase: { Sensor: '33MP Full-Frame Exmor R BSI CMOS', Video: '4K 60p 10-Bit 4:2:2 S-Cinetone', Stabilization: '5-Axis In-Body SteadyShot' },
        priceRange: [2298, 3498],
        discountRange: [8, 15],
      },
      {
        titlePrefix: 'DJI Mini 4 Pro Drone Fly More Combo Plus',
        variants: ['with DJI RC 2 Controller & 3 Batteries', 'Standard Kit with DJI RC-N2', 'Fly More Combo with Shoulder Bag'],
        description: 'Under 249g ultra-lightweight drone with omnidirectional active obstacle sensing, 4K/60fps HDR true vertical shooting, and 20km FHD video transmission.',
        specsBase: { Weight: '< 249 g FAA C0 Compliant', Video: '4K/60fps HDR & 4K/100fps Slow-Mo', FlightTime: 'Up to 45 Mins (Plus Battery)' },
        priceRange: [759, 1099],
        discountRange: [10, 18],
      },
      {
        titlePrefix: 'Canon EOS R6 Mark II Mirrorless Camera',
        variants: ['Body Only (24.2MP / 40fps)', 'with RF 24-105mm f/4 L IS USM Lens Kit', 'Creator Vlogging Kit with Mic & Grip'],
        description: 'High-speed 40fps electronic shutter shooting, 6K oversampled 4K 60p video without crop, and Dual Pixel CMOS AF II with vehicle/aircraft detection.',
        specsBase: { Sensor: '24.2MP Full-Frame CMOS', Burst: 'Up to 40 fps Electronic', Video: '6K Oversampled 4K 60p Uncropped' },
        priceRange: [2199, 3199],
        discountRange: [12, 20],
      },
      {
        titlePrefix: 'GoPro HERO12 Black Action Camera',
        variants: ['Creator Edition with Media Mod & Volta', 'Special Bundle with 2 Enduro Batteries', 'Standard Adventure Pack with Floating Grip'],
        description: 'Incredible 5.3K60 video, HyperSmooth 6.0 stabilization, HDR photos & video, Bluetooth audio support for AirPods, and waterproof down to 33ft.',
        specsBase: { Video: '5.3K60 / 4K120 / 2.7K240 Slow-Mo', Stabilization: 'HyperSmooth 6.0 + 360 Horizon Lock', Waterproof: '10m (33ft) Without Housing' },
        priceRange: [349, 599],
        discountRange: [15, 25],
      },
    ],
  },

  // 5. Gaming & VR
  {
    category: 'Gaming & VR',
    defaultSource: 'Verified Stock',
    brandPool: ['Sony PlayStation', 'Microsoft Xbox', 'Nintendo', 'Valve', 'ASUS ROG', 'Meta', 'Razer', 'Logitech G', 'SteelSeries', 'Elgato'],
    imagePool: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1612287233207-6f81b190f779?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&w=800&q=80',
    ],
    templates: [
      {
        titlePrefix: 'Sony PlayStation 5 Pro Console',
        variants: ['2TB SSD Disc Edition with DualSense', '2TB SSD Digital Edition with Extra Controller', 'Spider-Man 2 Collector Bundle'],
        description: 'Experience PlayStation Spectral Super Resolution (PSSR), advanced ray tracing, and consistent 60fps/120fps 4K gaming on a massive 2TB ultra-high speed SSD.',
        specsBase: { Storage: '2TB Custom High-Speed NVMe SSD', GPU: 'Advanced RDNA Ray Tracing Architecture', Output: 'Supports 4K 120Hz & 8K HDR' },
        priceRange: [699, 899],
        discountRange: [5, 12],
      },
      {
        titlePrefix: 'Valve Steam Deck OLED Handheld Gaming Console',
        variants: ['1TB NVMe OLED with Anti-Glare Etched Glass', '512GB NVMe OLED with Custom Carrying Case'],
        description: 'Brilliant 7.4-inch 90Hz HDR OLED screen, custom 6nm AMD APU, faster Wi-Fi 6E, and 50Whr battery for hours of AAA PC gaming on the go.',
        specsBase: { Screen: '7.4" 90Hz HDR OLED Display (1000 nits)', Battery: '50Whr (3-12 Hours of Gameplay)', Connectivity: 'Wi-Fi 6E Tri-Band' },
        priceRange: [549, 689],
        discountRange: [5, 10],
      },
      {
        titlePrefix: 'Nintendo Switch OLED Model',
        variants: ['Mario Red Special Edition', 'White Joy-Con Console', 'The Legend of Zelda: Tears of the Kingdom Edition'],
        description: 'Vibrant 7-inch OLED screen, wide adjustable tabletop stand, dock with wired LAN port, and 64GB of internal storage.',
        specsBase: { Screen: '7.0" OLED Multi-Touch Screen', Audio: 'Enhanced On-Board Stereo Speakers', Modes: 'TV Mode, Tabletop Mode, Handheld Mode' },
        priceRange: [329, 369],
        discountRange: [8, 15],
      },
      {
        titlePrefix: 'Meta Quest 3 Breakthrough Mixed Reality Headset',
        variants: ['512GB Asgards Wrath 2 Bundle', '128GB with Elite Strap & Battery Pack', '512GB Pro Comfort Kit'],
        description: 'Transform your home with full-color mixed reality passthrough, 4K+ Infinite Display, 3D spatial audio, and Snapdragon XR2 Gen 2 power.',
        specsBase: { Optics: '4K+ Infinite Display (2064x2208 per eye)', Passthrough: 'Dual RGB Color Cameras', Chip: 'Snapdragon XR2 Gen 2' },
        priceRange: [499, 699],
        discountRange: [8, 16],
      },
    ],
  },

  // 6. Smart Home & Kitchen
  {
    category: 'Home & Kitchen',
    defaultSource: 'Verified Stock',
    brandPool: ['Dyson', 'Breville', 'DeLonghi', 'KitchenAid', 'Roborock', 'iRobot', 'Philips', 'Ninja', 'Vitamix', 'Anova'],
    imagePool: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520970014086-2208d157c9e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
    ],
    templates: [
      {
        titlePrefix: 'Dyson V15 Detect Absolute Cordless Vacuum',
        variants: ['Yellow/Nickel with Laser Fluffy Optic', 'Complete Extra with HEPA Filtration & 10 Tools'],
        description: 'Dyson’s most intelligent cordless vacuum with laser illumination revealing invisible microscopic dust and acoustic piezo sensor particle counting.',
        specsBase: { Suction: '240 AW Laser-Guided Suction', RunTime: 'Up to 60 Minutes', Filtration: 'Whole-Machine HEPA to 0.1 Microns' },
        priceRange: [649, 799],
        discountRange: [15, 25],
      },
      {
        titlePrefix: 'Breville Barista Touch Impress Espresso Machine',
        variants: ['Brushed Stainless Steel', 'Black Truffle Matte', 'Sea Salt White Edition'],
        description: 'Barista-quality microfoam and precision espresso with automated assisted tamping, intelligent dosing, and step-by-step touchscreen guidance.',
        specsBase: { Heating: 'ThermoJet 3-Second Instant Heatup', Tamping: 'Assisted 10kg Tamp with 7-degree Twist', Screen: 'Intelligent Touchscreen' },
        priceRange: [1399, 1599],
        discountRange: [10, 20],
      },
      {
        titlePrefix: 'Roborock S8 Pro Ultra Robot Vacuum and Mop',
        variants: ['White with RockDock Ultra Cleaning Station', 'Black with RockDock Ultra Cleaning Station'],
        description: 'Hands-free cleaning with self-washing, self-drying, self-emptying, and self-refilling RockDock. DuoRoller Riser brush and VibraRise 2.0 mopping.',
        specsBase: { Suction: '6000 Pa Extreme Suction', Navigation: 'PreciSense LiDAR & Reactive 3D Obstacle Avoidance', Dock: 'RockDock Ultra 6-in-1' },
        priceRange: [1299, 1599],
        discountRange: [15, 25],
      },
      {
        titlePrefix: 'KitchenAid Artisan Series 5-Quart Tilt-Head Stand Mixer',
        variants: ['Empire Red with Pouring Shield', 'Matte Black with Glass Bowl', 'Pistachio Green Classic', 'Contour Silver Metallic'],
        description: 'Iconic planetary mixing action with 10 speeds and 59 touchpoints per rotation for thorough ingredient blending from cookies to sourdough.',
        specsBase: { Capacity: '5 Quart Stainless Steel Bowl with Handle', Power: '325 Watts Heavy-Duty Motor', Attachments: 'Dough Hook, Flat Beater, Wire Whip' },
        priceRange: [379, 479],
        discountRange: [18, 30],
      },
    ],
  },

  // 7. Watches & Luxury Wearables
  {
    category: 'Watches & Wearables',
    defaultSource: 'Verified Stock',
    brandPool: ['Apple', 'Garmin', 'Samsung', 'Tag Heuer', 'Oura', 'Withings', 'Casio G-Shock', 'Suunto', 'Omega', 'Tissot'],
    imagePool: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1619134778706-7015533a6150?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511370235399-1802cae1d32f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
    ],
    templates: [
      {
        titlePrefix: 'Apple Watch Ultra 2 GPS + Cellular 49mm',
        variants: ['Titanium with Blue Ocean Band', 'Titanium with Orange Alpine Loop (Large)', 'Titanium with Trail Loop (M/L)'],
        description: 'Rugged titanium case, precision dual-frequency GPS, up to 36 hours of normal battery life, and 3000-nit brightest Apple display ever.',
        specsBase: { Case: '49mm Aerospace-Grade Titanium', Display: '3000 nits Sapphire Crystal Glass', WaterResistance: '100m Dive Certified EN13319' },
        priceRange: [749, 799],
        discountRange: [8, 15],
      },
      {
        titlePrefix: 'Garmin Fenix 7X Pro Sapphire Solar Multisport GPS',
        variants: ['Carbon Gray DLC Titanium 51mm', 'Titanium with Chestnut Leather Band 51mm', 'Fog Gray / Ember Orange Edition'],
        description: 'Solar-charging lens extending battery up to 37 days, built-in LED flashlight, Hill Score, Endurance Score, and TopoActive multi-continent maps.',
        specsBase: { Battery: 'Up to 37 Days with Solar', Glass: 'Power Sapphire Scratch-Resistant', Sensor: 'Elevate Gen 5 Heart Rate & ECG' },
        priceRange: [849, 999],
        discountRange: [10, 20],
      },
      {
        titlePrefix: 'Oura Ring Gen 3 Horizon Smart Wellness Tracker',
        variants: ['Stealth Matte Finish (Size 10)', 'Gold Horizon Finish (Size 9)', 'Rose Gold Horizon Finish (Size 8)', 'Silver Horizon Finish (Size 11)'],
        description: 'Lightweight titanium ring tracking sleep staging, readiness score, heart rate variability (HRV), and body temperature with medical-grade precision.',
        specsBase: { Material: 'Durable Titanium with PVD Coating', Battery: 'Up to 7 Days Single Charge', WaterResistance: '100m Waterproof' },
        priceRange: [349, 499],
        discountRange: [5, 12],
      },
    ],
  },

  // 8. Fashion & Footwear
  {
    category: 'Fashion & Footwear',
    defaultSource: 'Verified Stock',
    brandPool: ['Nike', 'Jordan', 'Adidas', 'Arc\'teryx', 'The North Face', 'Patagonia', 'Salomon', 'New Balance', 'Canada Goose', 'Stone Island'],
    imagePool: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80',
    ],
    templates: [
      {
        titlePrefix: 'Nike Air Jordan 1 Retro High OG',
        variants: ['Lost & Found Chicago Colorway (US 10.5)', 'Royal Reimagined Suede (US 11)', 'Bred Patent Leather (US 10)', 'Shadow 2.0 (US 9.5)'],
        description: 'Authentic 1985 silhouette with official certificate of authenticity. Premium full-grain leather upper with encapsulated Nike Air cushioning.',
        specsBase: { Upper: '100% Genuine Full-Grain Leather', Outsole: 'Solid Rubber with Pivot Circle', Verification: '100% Authenticity Guarantee Verified Tag' },
        priceRange: [199, 399],
        discountRange: [10, 25],
      },
      {
        titlePrefix: 'Arc\'teryx Beta AR GORE-TEX Pro Hardshell Jacket',
        variants: ['Black Sapphire (Men\'s Large)', 'Kingfisher Navy (Men\'s Medium)', 'Heritage Lucent Red (Men\'s XL)'],
        description: 'Most versatile waterproof/breathable jacket engineered with rugged GORE-TEX PRO Most Rugged technology and DropHood helmet compatibility.',
        specsBase: { Membrane: '3-Layer GORE-TEX PRO Most Rugged', Fit: 'Regular with e3D Ergonomic Patterning', Zippers: 'WaterTight Pit Zips & Front' },
        priceRange: [599, 650],
        discountRange: [5, 15],
      },
      {
        titlePrefix: 'The North Face 1996 Retro Nuptse 700-Fill Down Jacket',
        variants: ['TNF Black (Large)', 'Summit Gold (Medium)', 'Pine Needle Green (Large)', 'Misty Sage (Small)'],
        description: 'Iconic oversized baffle silhouette with 700-fill certified goose down insulation, water-repellent DWR ripstop finish, and packable stow hood.',
        specsBase: { Insulation: '700-Fill Responsible Down Standard (RDS)', Shell: '40D Ripstop Nylon with DWR', Packable: 'Stows into Right Hand Pocket' },
        priceRange: [299, 340],
        discountRange: [10, 20],
      },
      {
        titlePrefix: 'Salomon XT-6 GORE-TEX Trail Running Shoes',
        variants: ['Black / Phantom / Star White (US 10)', 'Safari / Bitter Chocolate (US 10.5)', 'Vanilla Ice / Almond Milk (US 9)'],
        description: 'The preferred footwear of ultra-distance legends and streetwear tastemakers with waterproof GORE-TEX membrane and Agile Chassis System.',
        specsBase: { Chassis: 'Agile Chassis System (ACS) Stability', Lacing: 'Quicklace Minimalist One-Pull', Outsole: 'Mud Contagrip with Deep Lugs' },
        priceRange: [189, 220],
        discountRange: [8, 16],
      },
    ],
  },

  // 9. Outdoor & Sporting Goods
  {
    category: 'Outdoor & Sports',
    defaultSource: 'Verified Stock',
    brandPool: ['YETI', 'Camp Chef', 'Coleman', 'Specialized', 'Trek', 'TaylorMade', 'Titleist', 'Garmin', 'Intex', 'Black Diamond'],
    imagePool: [
      'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522878129833-838a904a0e9e?auto=format&fit=crop&w=800&q=80',
    ],
    templates: [
      {
        titlePrefix: 'YETI Tundra 45 Hard Cooler Heavy-Duty',
        variants: ['Desert Tan with PermaFrost Insulation', 'Navy Blue with PermaFrost Insulation', 'Rescue Red Special Edition'],
        description: 'Legendary rotomolded construction makes it virtually indestructible. 3 inches of PermaFrost insulation keeps ice frozen for days.',
        specsBase: { Construction: 'Rotomolded Armored Polyethylene', Insulation: '3" Commercial-Grade PermaFrost', Latches: 'T-Rex Heavy-Duty Rubber' },
        priceRange: [299, 350],
        discountRange: [5, 12],
      },
      {
        titlePrefix: 'Camp Chef Everest 2X High-Pressure Stove',
        variants: ['Dual 20,000 BTU Matchless Burners', 'Deluxe Edition with Cast Iron Griddle'],
        description: 'Two massive 20,000 BTU burners blast past wind and high altitude. Push-button auto igniter and stainless steel drip tray.',
        specsBase: { Output: '40,000 Total BTU (2x 20,000)', Ignition: 'Matchless Piezoelectric', Dimensions: '23.5" x 13.5" x 4.25"' },
        priceRange: [149, 199],
        discountRange: [15, 25],
      },
      {
        titlePrefix: 'TaylorMade Qi10 Max Carbon Driver',
        variants: ['10.5 Degree Fujikura Speeder Stiff Shaft', '9.0 Degree Mitsubishi Diamana Regular Shaft', '12.0 Degree High Launch Senior Shaft'],
        description: 'Achieves historic 10,000 MOI threshold for unprecedented forgiveness and ball speed across the entire 60X Carbon Twist Face.',
        specsBase: { MOI: '10,000 g-cm Inertia Threshold', Face: '60X Carbon Twist Face with Inverted Cone', Hosel: '4-Degree Loft Sleeve Adjustable' },
        priceRange: [549, 599],
        discountRange: [10, 18],
      },
    ],
  },

  // 10. Health, Fitness & Grooming
  {
    category: 'Health & Fitness',
    defaultSource: 'Verified Stock',
    brandPool: ['Theragun', 'Hyperice', 'Dyson', 'Oral-B', 'Philips Sonicare', 'Bowflex', 'Concept2', 'Peloton', 'Waterpik', 'Braun'],
    imagePool: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    ],
    templates: [
      {
        titlePrefix: 'Theragun PRO Plus 6-in-1 Percussive Therapy Device',
        variants: ['Deep Tissue Massager with Infrared Light & Vibration', 'Bundle with Cold & Heat Therapy Attachments'],
        description: 'Professional-grade recovery device combining 16mm percussive massage with near-infrared LED light therapy, vibration, and heart rate sensing.',
        specsBase: { Amplitude: '16mm Deep Muscle Penetration', StallForce: '60 lbs No-Stall Brushless Motor', Therapy: 'Near-Infrared LED 660nm' },
        priceRange: [549, 599],
        discountRange: [10, 20],
      },
      {
        titlePrefix: 'Dyson Supersonic Nural Intelligent Hair Dryer',
        variants: ['Vinca Blue & Topaz with 5 Styling Attachments', 'Strawberry Bronze with Scalp Protect Sensor', 'Ceramic Patina with Diffuser'],
        description: 'Auto-adapts temperature with Scalp Protect mode using Time of Flight sensors to protect scalp health and enhance natural shine.',
        specsBase: { Sensor: 'Nural Scalp Protect Sensor Array', Motor: 'Dyson Digital Motor V9 (110,000 RPM)', Attachments: 'Wave+Curl Diffuser, Gentle Air, Flyaway' },
        priceRange: [449, 499],
        discountRange: [8, 15],
      },
      {
        titlePrefix: 'Bowflex SelectTech 552 Adjustable Dumbbells (Pair)',
        variants: ['Adjusts 5 to 52.5 lbs with Storage Trays', 'Bundle with Ergonomic Media Stand'],
        description: 'Replaces 15 sets of weights with a turn of a dial. Adjusts from 5 to 52.5 lbs in 2.5 lb increments for progressive strength training.',
        specsBase: { WeightRange: '5 to 52.5 lbs (2.3 to 23.8 kg) Per Dumbbell', Increments: '2.5 lb increments up to first 25 lbs', Coating: 'Molded Durable Plates' },
        priceRange: [379, 429],
        discountRange: [15, 25],
      },
    ],
  },

  // 11. Smart Office & Ergonomics
  {
    category: 'Office & Workspace',
    defaultSource: 'Verified Stock',
    brandPool: ['Herman Miller', 'Steelcase', 'Secretlab', 'Autonomous', 'LG', 'Dell', 'BenQ', 'Logitech', 'Keychron', 'Elgato'],
    imagePool: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80',
    ],
    templates: [
      {
        titlePrefix: 'Herman Miller Aeron Ergonomic Office Chair',
        variants: ['Mineral Fully Adjustable PostureFit SL (Size B)', 'Graphite Fully Adjustable (Size C)', 'Carbon Polished Aluminum (Size B)'],
        description: 'The benchmark for ergonomic seating. 8Z Pellicle breathable suspension elastomeric mesh distributing weight evenly to eliminate pressure points.',
        specsBase: { Support: 'PostureFit SL Sacral & Lumbar Support', Mechanism: 'Harmonic 2 Tilt with Forward Tilt Limiter', Warranty: '12-Year 3-Shift Warranty' },
        priceRange: [1495, 1895],
        discountRange: [10, 20],
      },
      {
        titlePrefix: 'LG 28" DualUp Ergo Monitor 16:18 SDQHD',
        variants: ['28MQ780-B with Ergo Arm Stand (USB-C 90W PD)', '28MQ750-C with Nano IPS Panel'],
        description: 'Revolutionary 16:18 aspect ratio offering vertical split view equal to two 21.5-inch displays stacked without bezels.',
        specsBase: { Resolution: '2560 x 2880 SDQHD Nano IPS', Color: 'DCI-P3 98% with HDR10', Connectivity: 'USB Type-C 90W Power Delivery & KVM' },
        priceRange: [599, 699],
        discountRange: [15, 25],
      },
      {
        titlePrefix: 'Logitech MX Master 3S Performance Wireless Mouse',
        variants: ['Space Gray with Quiet Clicks & 8K DPI', 'Pale Gray with Quiet Clicks', 'Graphite with Bolt USB Receiver'],
        description: 'MagSpeed electromagnetic scrolling up to 1,000 lines per second, 8,000 DPI track-on-glass sensor, and 90% quieter clicks.',
        specsBase: { Sensor: '8,000 DPI Darkfield High Precision', Scroll: 'MagSpeed Electromagnetic SmartShift', Battery: 'Up to 70 Days on Full Charge' },
        priceRange: [89, 99],
        discountRange: [10, 20],
      },
    ],
  },

  // 12. Power, Solar & Tech Essentials
  {
    category: 'Power & Tech Gear',
    defaultSource: 'Verified Stock',
    brandPool: ['Anker', 'EcoFlow', 'Jackery', 'SanDisk', 'Samsung', 'Belkin', 'UGREEN', 'Goal Zero', 'Baseus'],
    imagePool: [
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622445262464-84b1b0722dd2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
    ],
    templates: [
      {
        titlePrefix: 'EcoFlow DELTA 2 Max Portable Power Station 2048Wh',
        variants: ['2400W AC Output (Solar Generator Ready)', 'Bundle with 220W Bifacial Solar Panel', 'with Extra 2048Wh Expansion Battery'],
        description: 'LFP battery chemistry with 3,000 cycles to 80% capacity. Powers 99% of heavy home appliances with 2400W output and X-Boost to 3100W.',
        specsBase: { Capacity: '2,048 Wh (Expandable to 6,144 Wh)', Output: '2400W AC (6x Outlets) + 100W USB-C', Recharge: '0-80% in 43 Mins with Dual AC+Solar' },
        priceRange: [1399, 1899],
        discountRange: [18, 30],
      },
      {
        titlePrefix: 'Anker Prime 27,650mAh Power Bank (250W)',
        variants: ['3-Port Ultra-Fast Power Delivery PowerCore', 'with 100W Smart Charging Base Station'],
        description: 'Airline-approved 99.54Wh capacity with 2x 140W USB-C ports and 1x 65W USB-A port capable of fast-charging two MacBook Pros simultaneously.',
        specsBase: { Output: '250W Total High-Speed Multi-Port', Capacity: '27,650 mAh (99.54 Wh Flight Safe)', Display: 'Digital Smart Display with App Control' },
        priceRange: [149, 189],
        discountRange: [15, 25],
      },
      {
        titlePrefix: 'SanDisk 4TB Extreme PRO Portable SSD USB 3.2 Gen 2x2',
        variants: ['Up to 2000MB/s Read/Write Speeds', 'with Rugged Aluminum Enclosure & Carabiner'],
        description: 'NVMe solid state performance in a rugged forged aluminum chassis that acts as a heatsink. IP65 water & dust resistance and 3-meter drop protection.',
        specsBase: { Speed: 'Up to 2,000 MB/s Read & Write', Durability: 'IP65 Water/Dust Resistance + 3m Drop', Security: '256-bit AES Hardware Encryption' },
        priceRange: [299, 379],
        discountRange: [20, 35],
      },
    ],
  },
];

export function generateMasterProducts(): Product[] {
  const products: Product[] = [];
  let globalCounter = 1000;

  for (const catData of CATEGORIES_DATA) {
    const targetPerCategory = 88;
    let catCount = 0;

    while (catCount < targetPerCategory) {
      for (const tpl of catData.templates) {
        for (const variant of tpl.variants) {
          if (catCount >= targetPerCategory) break;

          globalCounter++;
          catCount++;

          const brand = catData.brandPool[catCount % catData.brandPool.length];
          const source = 'Verified Stock';
          const skuCode = `ADR-${brand.slice(0, 3).toUpperCase()}${globalCounter}`;

          const minP = tpl.priceRange[0];
          const maxP = tpl.priceRange[1];
          const stepPrice = minP + ((catCount * 37) % (maxP - minP + 1));
          const discountPct = tpl.discountRange[0] + ((catCount * 7) % (tpl.discountRange[1] - tpl.discountRange[0] + 1));
          const originalPrice = Math.round(stepPrice / (1 - discountPct / 100));
          const price = parseFloat(stepPrice.toFixed(2));

          // Pick base image and construct a GUARANTEED unique URL with specific item index and visual variation
          const baseImage = catData.imagePool[catCount % catData.imagePool.length];
          const image = `${baseImage}&item=${globalCounter}&crop=entropy&cs=tinysrgb`;

          const rating = parseFloat((4.3 + ((catCount * 13) % 8) / 10).toFixed(1));
          const sold = 45 + ((catCount * 97) % 850);

          const productName = `${brand} ${tpl.titlePrefix} - ${variant}`;

          products.push({
            id: globalCounter,
            name: productName,
            brand,
            category: catData.category,
            source,
            sku: skuCode,
            price,
            originalPrice,
            image,
            description: `${tpl.description} Verified authentic merchandise item with full manufacturer warranty and direct humanitarian impact allocation.`,
            specs: {
              ...tpl.specsBase,
              Condition: 'Brand New in Factory Sealed Packaging',
              SKU: skuCode,
              Shipping: 'Free Insured Global Priority (3-5 Business Days)',
              Warranty: '1 Year Full Manufacturer Warranty + 30-Day Money Back Guarantee',
            },
            rating,
            sold,
          });
        }
      }
    }
  }

  return products;
}

export const MASTER_CATALOG_PRODUCTS: Product[] = generateMasterProducts();
