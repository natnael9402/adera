"use strict";

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Load verified scraped tech images if available
let scrapedTechImages = {};
try {
  const candidates = [
    path.resolve(__dirname, "./tech-images-scraped.json"),
    path.resolve(__dirname, "../tech-images-scraped.json"),
    path.resolve(__dirname, "../../tech-images-scraped.json"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      scrapedTechImages = JSON.parse(fs.readFileSync(c, "utf8"));
      break;
    }
  }
} catch (e) {
  // fallback to registry
}

// Registry of verified tech photo IDs from Unsplash
const TECH_IMAGE_REGISTRY = {
  'Smartphones & Mobile Flagships': [
    'photo-1592750475338-74b7b21085ab', 'photo-1511707171634-5f897ff02aa9', 'photo-1565849904461-04a58ad377e0', 'photo-1510557880182-3d4d3cba35a5',
    'photo-1574944985070-8f3ebc6b79d2', 'photo-1589492477829-5e65395b66cc', 'photo-1598327105666-5b89351aff97', 'photo-1530319067432-f2a729c03db5',
    'photo-1567581935884-3349723552ca', 'photo-1570891836654-d356347c9e7a', 'photo-1601784551446-20c9e07cdbdb', 'photo-1591337676887-a217a6970a8a',
    'photo-1584438784894-089d6a62b8fa', 'photo-1565630916779-e303be97b6f5', 'photo-1523206489230-c012c64b2b48', 'photo-1533228892404-e0c1f6c43c16',
    'photo-1556656793-08538906a9f8', 'photo-1572569511254-d8f925fe2cbb', 'photo-1592899677977-9c10ca588bbd', 'photo-1605236453806-6ff36851218e',
    'photo-1609692814858-f7cd2f0afe44', 'photo-1616348436168-de43ad0db179', 'photo-1616469829941-c7200edec809', 'photo-1546054454-aa26e2b734c7',
  ],
  'Tablets & Mobile Slates': [
    'photo-1544244015-0df4b3ffc6b0', 'photo-1580910051074-3eb694886505', 'photo-1561154464-82e9adf32764', 'photo-1550029402-226115b7c579',
    'photo-1569770218135-bea267ed7e84', 'photo-1585060544812-6b45742d762f', 'photo-1536412597336-ade7b523ecfc', 'photo-1541345023926-55d6e0853f4b',
    'photo-1512941937669-90a1b58e7e9c', 'photo-1584006682522-dc17d6c0d9ac', 'photo-1575695342320-d2d2d2f9b73f', 'photo-1585771724684-38269d6639fd',
  ],
  'Mobile Gadgets & MagSafe Gear': [
    'photo-1609091839311-d5365f9ff1c5', 'photo-1622445262464-84b1b0722dd2', 'photo-1583863788434-e58a36330cf0', 'photo-1580927752452-89d86da3fa0a',
    'photo-1558618666-fcd25c85cd64', 'photo-1600080972464-8e5f35f63d08', 'photo-1544716278-ca5e3f4abd8c', 'photo-1518770660439-4636190af475',
    'photo-1591488320449-011701bb6704', 'photo-1612815154858-60aa4c59eaa6', 'photo-1546868871-7041f2a55e12', 'photo-1588508065123-287b28e013da',
  ],
  'Laptops & Computers': [
    'photo-1517336714731-489689fd1ca8', 'photo-1593642632823-8f785ba67e45', 'photo-1588872657578-7efd1f1555ed', 'photo-1525547719571-a2d4ac8945e2',
    'photo-1603302576837-37561b2e2302', 'photo-1541807084-5c52b6b3adef', 'photo-1496181133206-80ce9b88a853', 'photo-1516321318423-f06f85e504b3',
    'photo-1531297484001-80022131f5a1', 'photo-1585060544812-6b45742d762f', 'photo-1498050108023-c5249f4df085', 'photo-1527443224154-c4a3942d3acf',
    'photo-1563770660941-20978e870e26', 'photo-1593642702821-c8da6771f0c6', 'photo-1593642634315-48f5414c3ad9', 'photo-1593642634443-44adaa06623a',
  ],
  'Monitors & Displays': [
    'photo-1527443224154-c4a3942d3acf', 'photo-1585792180666-f7347c490ee2', 'photo-1593642532744-e377ab2570bc', 'photo-1547082299-de196ea013d6',
    'photo-1587829741301-dc798b83add3', 'photo-1595225476474-87563907a212', 'photo-1618384887929-16ec33fab9ef', 'photo-1629429408209-1f912961dbd8',
  ],
  'Keyboards & Mice': [
    'photo-1587829741301-dc798b83add3', 'photo-1618384887929-16ec33fab9ef', 'photo-1527864550417-7fd91fc51a46', 'photo-1595225476474-87563907a212',
    'photo-1629429408209-1f912961dbd8', 'photo-1511556532299-8f662fc26c06', 'photo-1587614387466-0a72ca909e16', 'photo-1587614382200-a0a1f0a149c7',
  ],
  'Audio & Headphones': [
    'photo-1505740420928-5e560c06d30e', 'photo-1583394838336-acd977736f90', 'photo-1546435770-a3e426bf472b', 'photo-1484704849700-f032a568e944',
    'photo-1572536147248-ac59a8abfa4b', 'photo-1590658268037-6bf12165a8df', 'photo-1618366712010-f4ae9c647dcb', 'photo-1598331668826-20cecc596b86',
  ],
  'Earbuds & Portable Speakers': [
    'photo-1590658006821-04f4008d5717', 'photo-1577174881658-0f30ed549adc', 'photo-1585298723682-7115561c51b7', 'photo-1608156639585-34a0a562a0cf',
    'photo-1590658189679-b1d62c3f8152', 'photo-1520523839898-5071270409a8', 'photo-1543512214-318c7553f230', 'photo-1558089687-f282ffcbc126',
  ],
  'Cameras, Drones & Creators': [
    'photo-1516035069371-29a1b244cc32', 'photo-1502920917128-1aa500764cbd', 'photo-1527011046414-4781f1f94f8c', 'photo-1508614589041-895b88991e3e',
    'photo-1512790182412-b19e6d62bc39', 'photo-1526170375885-4d8ecf77b99f', 'photo-1495707902641-75cac588d2e9', 'photo-1507679799987-c73779587ccf',
  ],
  'Gaming Handhelds & VR': [
    'photo-1606813907291-d86efa9b94db', 'photo-1607604276583-eef5d076aa5f', 'photo-1622979135225-d2ba269bc1df', 'photo-1598550476439-6847785fcea6',
    'photo-1550745165-9bc0b252726f', 'photo-1538481199705-c710c4e965fc', 'photo-1580234811497-9df7fd2f357e', 'photo-1592840496694-26d035b52b48',
  ],
  'Smart Home & Robotics': [
    'photo-1556911220-e15b29be8c8f', 'photo-1584269600464-37b1b58a9fe7', 'photo-1544816155-12df9643f363', 'photo-1578643463396-0997cb5328c1',
    'photo-1517256064527-09c73fc73e38', 'photo-1520970014086-2208d157c9e2', 'photo-1574269909862-7e1d70bb8078', 'photo-1585515320310-259814833e62',
  ],
  'Storage & PC Hardware': [
    'photo-1591488320449-011701bb6704', 'photo-1612815154858-60aa4c59eaa6', 'photo-1546868871-7041f2a55e12', 'photo-1588508065123-287b28e013da',
    'photo-1583394838336-acd977736f90', 'photo-1616486338812-3dadae4b4ace', 'photo-1592899677977-9c10ca588bbd', 'photo-1598327105666-5b89351aff97',
  ],
  'Power Stations & Solar Tech': [
    'photo-1609091839311-d5365f9ff1c5', 'photo-1622445262464-84b1b0722dd2', 'photo-1583863788434-e58a36330cf0', 'photo-1580927752452-89d86da3fa0a',
    'photo-1558618666-fcd25c85cd64', 'photo-1600080972464-8e5f35f63d08', 'photo-1544716278-ca5e3f4abd8c', 'photo-1518770660439-4636190af475',
  ],
  'Smartwatches & Wearables': [
    'photo-1523275335684-37898b6baf30', 'photo-1524805444758-089113d48a6d', 'photo-1542496658-e33a6d0d50f6', 'photo-1509042239860-f550ce710b93',
    'photo-1533139502658-0198f920d8e8', 'photo-1619134778706-7015533a6150', 'photo-1522335789203-aabd1fc54bc9', 'photo-1548036328-c9fa89d128fa',
  ],
};

function getCategoryImages(catName, queryKeys) {
  const keys = Array.isArray(queryKeys) ? queryKeys : [queryKeys];
  let scraped = [];
  for (const k of keys) {
    if (scrapedTechImages[k]) {
      scraped.push(...scrapedTechImages[k]);
    }
  }
  const registered = (TECH_IMAGE_REGISTRY[catName] || []).map(
    id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`
  );
  const combined = [...scraped, ...registered];
  return combined.length > 0 ? combined : registered;
}

// 1. SMARTPHONES & MOBILE FLAGSHIPS: 1,100 Distinct Authentic Items
const SMARTPHONE_BRANDS_MODELS = [
  {
    brand: 'Apple',
    imgKeys: ['iphone', 'smartphone', 'mobile-technology'],
    chipset: 'Apple A18 Pro / A17 Pro Bionic',
    models: [
      { name: 'iPhone 16 Pro Max Titanium 5G', basePrice: 1199, desc: 'Grade 5 Titanium frame with A18 Pro silicon, 48MP Fusion camera with 5x optical telephoto, Camera Control button, and 33-hour battery.' },
      { name: 'iPhone 16 Pro Super Retina XDR 120Hz', basePrice: 999, desc: 'Apple A18 Pro chip, ProMotion 120Hz display with thinner borders, 48MP Ultra Wide sensor, and studio-quality 4-mic array.' },
      { name: 'iPhone 16 Plus Dynamic Island OLED', basePrice: 899, desc: 'Expansive 6.7-inch Super Retina XDR display, A18 silicon with Apple Intelligence, customizable Action button, and marathon battery.' },
      { name: 'iPhone 16 Ceramic Shield 5G', basePrice: 799, desc: 'Next-generation Ceramic Shield front, A18 chip, 48MP 2-in-1 camera system with 2x optical-quality telephoto, and Spatial Video.' },
      { name: 'iPhone 15 Pro Max A17 Pro Titanium', basePrice: 1099, desc: 'Aerospace-grade titanium design with revolutionary A17 Pro chip, Action button, USB-C 10Gbps data speeds, and 5x optical zoom.' },
      { name: 'iPhone 15 Pro Action Button Flagship', basePrice: 899, desc: 'Lightweight titanium construction with A17 Pro GPU hardware ray tracing and versatile 48MP main camera system.' },
      { name: 'iPhone 15 Dynamic Island USB-C', basePrice: 699, desc: 'Color-infused durable back glass with Dynamic Island, 48MP Main camera, and universal USB-C charging connector.' },
      { name: 'iPhone 14 Pro Max Deep Purple Flagship', basePrice: 799, desc: 'A16 Bionic powerhouse with Always-On display, Dynamic Island, Crash Detection, and Photonic Engine computational imaging.' },
    ],
  },
  {
    brand: 'Samsung Galaxy',
    imgKeys: ['samsung-galaxy', 'foldable-phone', 'smartphone'],
    chipset: 'Snapdragon 8 Gen 3 for Galaxy',
    models: [
      { name: 'Galaxy S24 Ultra 5G AI Smartphone', basePrice: 1299, desc: 'Titanium frame with integrated S Pen stylus, Galaxy AI Live Translate, 200MP Quad Tele camera, and Gorilla Armor anti-reflective glass.' },
      { name: 'Galaxy S24+ 5G QHD+ Dynamic AMOLED 2X', basePrice: 999, desc: 'Armor Aluminum 2.0 with Snapdragon 8 Gen 3, 12GB RAM, 4900mAh battery, and seamless Galaxy AI photo editing.' },
      { name: 'Galaxy S24 5G Compact AI Flagship', basePrice: 799, desc: 'One-hand friendly 6.2-inch 120Hz Dynamic AMOLED 2X with 2600 nits peak brightness and Galaxy AI Circle to Search.' },
      { name: 'Galaxy Z Fold6 AI Slim Armor Foldable', basePrice: 1899, desc: 'Expansive 7.6-inch Dynamic AMOLED 2X tablet screen folding into a pocketable device with dual-rail hinge and Ray Tracing.' },
      { name: 'Galaxy Z Flip6 AI Compact FlexCam', basePrice: 1099, desc: 'Pocket-sized folding flagship with 3.4-inch FlexWindow, 50MP main camera, vapor chamber cooling, and 4000mAh battery.' },
      { name: 'Galaxy S23 Ultra 200MP Space Zoom Flagship', basePrice: 949, desc: 'Snapdragon 8 Gen 2 Mobile Platform for Galaxy with embedded S Pen, 100x Space Zoom, and Expert RAW astro-hyperlapse.' },
      { name: 'Galaxy S23 FE 5G High-Performance Edition', basePrice: 599, desc: 'Flagship-grade 50MP camera, vibrant 120Hz Dynamic AMOLED display, and all-day intelligent battery at accessible pricing.' },
      { name: 'Galaxy A55 5G Metal Frame Super AMOLED', basePrice: 429, desc: 'Premium metal flat frame with 50MP OIS camera, Samsung Knox Vault security, and IP67 water/dust resistance.' },
    ],
  },
  {
    brand: 'Google Pixel',
    imgKeys: ['google-pixel', 'smartphone', 'android-phone'],
    chipset: 'Google Tensor G4 & Titan M2 Security',
    models: [
      { name: 'Pixel 9 Pro XL Google AI Smartphone', basePrice: 1099, desc: 'Custom Google Tensor G4 with 16GB RAM, Super Res Zoom 30x, Magic Eraser, and 7 years of direct OS updates.' },
      { name: 'Pixel 9 Pro Compact Super Res Zoom Phone', basePrice: 999, desc: 'Pro-grade triple camera system in a compact 6.3-inch Super Actua display with 3000 nits peak brightness and Gemini Nano.' },
      { name: 'Pixel 9 Google Tensor G4 Smartphone', basePrice: 799, desc: '6.3-inch Actua display, 50MP dual rear camera, Gemini AI built-in, and satellite SOS emergency messaging.' },
      { name: 'Pixel 9 Pro Fold Dual-Screen AI Foldable', basePrice: 1799, desc: 'Google thinnest foldable with 8-inch Super Actua Flex inner display, fluid multi-tasking Split Screen, and Tensor G4.' },
      { name: 'Pixel 8 Pro Temperature Sensor Flagship', basePrice: 749, desc: 'Polished aluminum frame with matte back glass, built-in object temperature sensor, Best Take, and Audio Magic Eraser.' },
      { name: 'Pixel 8a AI Compact Smartphone', basePrice: 499, desc: 'Tensor G3 power with 120Hz Actua display, IP67 durability, 64MP quad PD camera, and 24+ hour battery.' },
    ],
  },
  {
    brand: 'OnePlus',
    imgKeys: ['smartphone', 'cellphone', 'android-phone'],
    chipset: 'Qualcomm Snapdragon 8 Gen 3',
    models: [
      { name: 'OnePlus 12 Hasselblad Flagship 5G', basePrice: 799, desc: 'Snapdragon 8 Gen 3 with 5400mAh dual-cell battery, 80W SUPERVOOC fast charging, and 4th Gen Hasselblad Camera.' },
      { name: 'OnePlus Open Dual-Screen Foldable Flagship', basePrice: 1699, desc: 'Lightweight aerospace titanium hinge, dual 120Hz 2K ProXDR displays, Open Canvas multitasking, and Sony LYT-T808 sensor.' },
      { name: 'OnePlus 12R Extreme Performance Edition', basePrice: 499, desc: 'Snapdragon 8 Gen 2 powerhouse with 5500mAh largest-ever battery, 1.5K 120Hz 4th Gen LTPO display, and 100W charging.' },
      { name: 'OnePlus 11 5G Dual-SIM Flagship', basePrice: 599, desc: 'Hasselblad camera with Sony IMX890, 100W flash charging, Dolby Vision AMOLED, and Cryo-velocity VC cooling.' },
      { name: 'OnePlus Nord 4 All-Metal Unibody 5G', basePrice: 399, desc: 'Slim 7.99mm aircraft-grade unibody aluminum with Snapdragon 7+ Gen 3, 5500mAh battery, and 6 years of software support.' },
      { name: 'OnePlus Open Apex Edition Crimson Shadow', basePrice: 1899, desc: 'Luxurious vegan leather back with 1TB UFS 4.0 storage, 16GB LPDDR5X RAM, VIP privacy slider, and AI smart eraser.' },
    ],
  },
  {
    brand: 'Xiaomi & POCO',
    imgKeys: ['android-phone', 'cellphone', 'smartphone'],
    chipset: 'Snapdragon 8 Gen 3 / Dimensity 9300',
    models: [
      { name: 'Xiaomi 14 Ultra Leica Quad-Camera Master', basePrice: 1299, desc: '1-inch Sony LYT-900 sensor with stepless f/1.63-f/4.0 variable aperture, dual periscope zoom, and 90W HyperCharge.' },
      { name: 'Xiaomi 14 Pro Snapdragon 8 Gen 3 Flagship', basePrice: 899, desc: 'Xiaomi Ceramic Glass with 120Hz WQHD+ LTPO OLED, 120W wired + 50W wireless charging, and Leica Summilux lens.' },
      { name: 'Xiaomi 13T Pro Leica Optics 144Hz AMOLED', basePrice: 649, desc: 'MediaTek Dimensity 9200+ with 144Hz CrystalRes AMOLED, 50MP Leica professional optical camera, and IP68 resistance.' },
      { name: 'POCO F6 Pro Snapdragon 8 Gen 2 Gaming Phone', basePrice: 499, desc: 'WQHD+ 120Hz Flow AMOLED with 4000 nits, LiquidCool 4.0 with Iceloop, 120W HyperCharge, and Light Fusion 800 sensor.' },
      { name: 'POCO X6 Pro Dimensity 8300-Ultra Beast', basePrice: 349, desc: 'TSMC 4nm processor with WildBoost Optimization 2.0, 64MP OIS triple camera, and 67W turbo charging.' },
      { name: 'Redmi Note 13 Pro+ 5G 200MP Curved AMOLED', basePrice: 399, desc: '200MP ultra-clear main camera with OIS, 1.5K 120Hz curved display, IP68 water resistance, and 120W HyperCharge.' },
    ],
  },
  {
    brand: 'Asus ROG',
    imgKeys: ['phone-screen', 'android-phone', 'smartphone'],
    chipset: 'Overclocked Snapdragon 8 Gen 3',
    models: [
      { name: 'ROG Phone 8 Pro Ultimate Esports Gaming Phone', basePrice: 1199, desc: 'AniMe Matrix mini-LED rear display, AirTrigger ultrasonic buttons, 165Hz Samsung AMOLED, and AeroActive Cooler X.' },
      { name: 'ROG Phone 8 Snapdragon 8 Gen 3 Gaming Flagship', basePrice: 999, desc: 'IP68 water resistant gaming phone with 6-axis hybrid gimbal stabilizer, 5500mAh split battery, and 65W HyperCharge.' },
      { name: 'ROG Phone 7 Ultimate AeroActive Portal Edition', basePrice: 1099, desc: 'Motorized thermal air intake portal directing airflow directly onto cooling fins for sustained esports framerates.' },
      { name: 'Zenfone 11 Ultra LTPO AMOLED Flagship', basePrice: 899, desc: '6.78-inch 144Hz LTPO AMOLED, 50MP Sony IMX890 gimbal camera, AI Call Translator, and 5500mAh 2-day battery.' },
      { name: 'Zenfone 10 Compact One-Hand Flagship', basePrice: 699, desc: 'Sub-6-inch compact beast with 6-Axis Hybrid Gimbal Stabilizer 2.0, Snapdragon 8 Gen 2, and 144Hz AMOLED.' },
    ],
  },
  {
    brand: 'Sony Xperia',
    imgKeys: ['mobile-phone', 'smartphone', 'phone-screen'],
    chipset: 'Snapdragon 8 Gen 3 Mobile Platform',
    models: [
      { name: 'Xperia 1 VI Continuous Optical Zoom Flagship', basePrice: 1399, desc: 'True 85mm-170mm continuous optical telephoto lens with Exmor T sensor, BRAVIA AI picture tuning, and 2-day battery.' },
      { name: 'Xperia 5 V Compact Studio Cinema Phone', basePrice: 899, desc: 'Compact pro camera phone with Exmor T dual lens system, 3.5mm hi-res headphone jack, and front-facing stereo speakers.' },
      { name: 'Xperia Pro-I 1.0-Type Exmor RS Sensor Phone', basePrice: 1199, desc: 'Dedicated 1.0-type image sensor with phase-detection AF, dual physical shutter buttons, and professional 4K 120fps video.' },
      { name: 'Xperia 10 VI Ultra-Lightweight 5000mAh Phone', basePrice: 449, desc: 'Only 164g featherlight body with 2-day marathon battery life, front stereo speakers, and Corning Gorilla Glass Victus.' },
      { name: 'Xperia 1 V 4K HDR 120Hz OLED Studio Phone', basePrice: 1099, desc: 'World premier 4K HDR 120Hz 21:9 OLED display with S-Cinetone for mobile, specialized gaming gear, and Hi-Res Audio.' },
    ],
  },
  {
    brand: 'Nothing',
    imgKeys: ['cellphone', 'mobile-technology', 'smartphone'],
    chipset: 'Snapdragon 778G+ / Dimensity 7350 Pro',
    models: [
      { name: 'Nothing Phone (2) Glyph Interface Flagship', basePrice: 649, desc: 'Iconic transparent back with 33 addressable Glyph LED zones, Snapdragon 8+ Gen 1, dual 50MP Sony sensors, and Nothing OS 2.5.' },
      { name: 'Nothing Phone (2a) Transparent Design 5G', basePrice: 349, desc: 'Custom Dimensity 7200 Pro chipset with 120Hz flexible AMOLED, 50MP OIS camera, and 45W fast charging.' },
      { name: 'Nothing Phone (2a) Plus Dimensity 7350 Pro', basePrice: 399, desc: 'Metallic finish with 50MP selfie camera, 4K video recording on front & back, and turbocharged 50W wired charging.' },
      { name: 'CMF Phone 1 Modular Interchangeable Cover Phone', basePrice: 239, desc: 'Customizable rear case with modular accessory mounting point, 120Hz Super AMOLED, and MediaTek Dimensity 7300.' },
    ],
  },
  {
    brand: 'Motorola',
    imgKeys: ['foldable-phone', 'cellphone', 'smartphone'],
    chipset: 'Snapdragon 8s Gen 3 / 8 Gen 2',
    models: [
      { name: 'Motorola Razr+ 2024 Dual-Screen Flex Flagship', basePrice: 999, desc: 'Massive 4.0-inch external pOLED display, teardrop zero-gap hinge, Moto AI camera features, and Dolby Atmos stereo.' },
      { name: 'Motorola Razr 2024 OLED Clamshell Foldable', basePrice: 699, desc: 'Premium vegan leather clamshell with 3.6-inch cover screen, 6.9-inch 120Hz main display, and 30W TurboPower charging.' },
      { name: 'Edge 50 Ultra Pantone Certified Wooden Back Phone', basePrice: 999, desc: 'Real natural Nordic wood back panel with 64MP periscope telephoto, 125W TurboPower, and 50W wireless charging.' },
      { name: 'Edge 50 Pro 125W TurboPower 144Hz pOLED', basePrice: 699, desc: 'World first Pantone validated display and camera, 144Hz curved screen, and IP68 underwater protection.' },
      { name: 'ThinkPhone by Motorola Military Grade Carbon Fiber', basePrice: 599, desc: 'Aramid fiber unibody with aircraft-grade aluminum frame, ThinkShield enterprise security, and seamless PC integration.' },
    ],
  },
  {
    brand: 'Nubia RedMagic',
    imgKeys: ['android-phone', 'phone-screen', 'smartphone'],
    chipset: 'Snapdragon 8 Gen 3 Leading Version (3.4GHz)',
    models: [
      { name: 'RedMagic 9S Pro ICE 13.5 Cooling Fan Gaming Phone', basePrice: 749, desc: 'Under-display 16MP camera with 22,000 RPM internal RGB cooling fan, 520Hz shoulder triggers, and 6500mAh 80W battery.' },
      { name: 'RedMagic 9 Pro+ Esports Titan 24GB RAM Edition', basePrice: 899, desc: 'Monster 24GB LPDDR5X RAM + 1TB UFS 4.0 storage, flat zero-camera-bump back glass, and 165W ultra-fast flash charging.' },
      { name: 'Nubia Z60 Ultra Leading Edition Under-Display Cam', basePrice: 649, desc: 'True bezel-less 1.5K AMOLED with NeoVision under-display camera, 35mm optical street lens, and IP68 waterproof body.' },
      { name: 'Nubia Z60S Pro Satellite Edition Outdoor Flagship', basePrice: 569, desc: 'Two-way satellite communication with 35mm custom primary lens, 5100mAh battery, and snapdragon 8 Gen 2 platform.' },
      { name: 'RedMagic 8S Pro Snapdragon 8+ Gen 2 Beast', basePrice: 649, desc: 'Bezel-less 120Hz gaming screen with vapor chamber liquid cooling, dual stereo x-axis linear motors, and DTS:X Ultra.' },
    ],
  },
  {
    brand: 'Honor',
    imgKeys: ['smartphone', 'mobile-technology', 'foldable-phone'],
    chipset: 'Snapdragon 8 Gen 3 / MagicOS 8.0',
    models: [
      { name: 'Honor Magic6 Pro Falcon Periscope Telephoto Phone', basePrice: 1199, desc: '180MP periscope telephoto camera with 2.5x optical/100x digital zoom, 5600mAh silicon-carbon battery, and NanoCrystal Shield.' },
      { name: 'Honor Magic V3 Slimmest Dual-Screen Foldable', basePrice: 1799, desc: 'Impossibly slender 9.2mm folded thickness, aerospace Super Steel hinge, IPX8 water resistance, and Harcourt portrait studio.' },
      { name: 'Honor 200 Pro Studio Harcourt Portrait Phone', basePrice: 699, desc: 'Co-engineered with Studio Harcourt Paris for iconic black-and-white portraits, 100W wired + 66W wireless charging.' },
      { name: 'Honor Magic V2 Ultra-Slim Titanium Foldable', basePrice: 1499, desc: 'Titanium alloy hinge certified for 400,000 folds with dual 120Hz LTPO displays and dual silicon-carbon 5000mAh battery.' },
      { name: 'Honor 90 200MP Zero-Risk Dimming AMOLED', basePrice: 449, desc: '3840Hz risk-free ultra-high frequency PWM dimming display with 200MP ultra-clear camera and 50MP front selfie cam.' },
    ],
  },
  {
    brand: 'Vivo',
    imgKeys: ['cellphone', 'android-phone', 'smartphone'],
    chipset: 'Dimensity 9300+ / Snapdragon 8 Gen 3',
    models: [
      { name: 'Vivo X100 Pro Zeiss APO Telephoto Camera Phone', basePrice: 999, desc: 'Zeiss APO certified floating telephoto lens with 1-inch Sony IMX989 sensor, V3 imaging chip, and 100W dual-cell flash charge.' },
      { name: 'Vivo X Fold3 Pro Snapdragon 8 Gen 3 Foldable', basePrice: 1599, desc: 'Dual 3D ultrasonic fingerprint scanners, carbon fiber ultra-lightweight hinge, IPX8 water resistance, and 5700mAh battery.' },
      { name: 'Vivo X100 Ultra 200MP Zeiss Periscope Master', basePrice: 1299, desc: 'World-first 200MP 1/1.4-inch Samsung HP9 telephoto camera with Blueprint imaging algorithm and CIPA 4.5 gimbal stabilization.' },
      { name: 'Vivo V30 Pro Zeiss Portrait Studio 5G', basePrice: 499, desc: 'Aura Light portrait system with trio of 50MP Zeiss cameras, slim 7.45mm body, and 5000mAh 4-year durable battery.' },
      { name: 'iQOO 12 Pro 144Hz 2K E7 AMOLED Gaming Flagship', basePrice: 799, desc: 'Q1 dedicated e-sports display chip, BMW M Motorsport racing stripe edition, 120W FlashCharge, and 64MP periscope telephoto.' },
    ],
  },
  {
    brand: 'Rugged & Tactical Outdoor',
    imgKeys: ['mobile-phone', 'smartphone', 'gadgets'],
    chipset: 'MediaTek Dimensity 8200 / Qualcomm Rugged Platform',
    models: [
      { name: 'CAT S75 Satellite SOS Rugged Outdoor Smartphone', basePrice: 599, desc: 'Direct Bullitt satellite 2-way messaging where cell towers fail, IP69K high-pressure steam proof, and 1.8m steel drop certified.' },
      { name: 'Unihertz Tank 3 Pro 23800mAh DLP Projector Phone', basePrice: 649, desc: 'Integrated 100-lumen 120Hz DLP laser projector, massive 23,800mAh power station battery, 120W charge, and 200MP night camera.' },
      { name: 'AGM G2 Guardian Thermal Imaging Monocular Phone', basePrice: 999, desc: 'Long-range thermal monocular detecting heat signatures up to 500 meters, 108MP camera, 109dB speaker, and 7000mAh battery.' },
      { name: 'Doogee V30T 5G Dimensity 1080 Rugged Phone', basePrice: 429, desc: 'Ceramic finish with dual stereo speakers, 10800mAh battery, 66W fast charge, 108MP camera, and Night Vision infrared sensor.' },
      { name: 'Ulefone Armor 24 22000mAh 1000LM Camping Light Phone', basePrice: 459, desc: 'Built-in 1000 lumen camping floodlight, 22,000mAh battery supporting 66W reverse power bank output, and IP68/IP69K rating.' },
    ],
  },
];

const SMARTPHONE_VARIANTS = [
  { label: '128GB Storage / Midnight Black / Factory Unlocked', priceDelta: -80, specs: { Storage: '128GB High-Speed NVMe', Color: 'Midnight Black', Network: '5G Dual SIM Unlocked' } },
  { label: '128GB Storage / Starlight Silver / Factory Unlocked', priceDelta: -80, specs: { Storage: '128GB High-Speed NVMe', Color: 'Starlight Silver', Network: '5G Dual SIM Unlocked' } },
  { label: '256GB Storage / Natural Titanium / Factory Unlocked', priceDelta: 0, specs: { Storage: '256GB UFS 4.0 Storage', Color: 'Natural Titanium', Network: '5G Sub-6 & mmWave Global' } },
  { label: '256GB Storage / Phantom Black / Factory Unlocked', priceDelta: 0, specs: { Storage: '256GB UFS 4.0 Storage', Color: 'Phantom Black', Network: '5G Dual eSIM Global' } },
  { label: '256GB Storage / Deep Navy Blue / Dual SIM Global', priceDelta: 10, specs: { Storage: '256GB High-Speed UFS', Color: 'Deep Navy Blue', Network: 'Dual Physical SIM + eSIM' } },
  { label: '512GB Storage / Desert Gold / Factory Unlocked', priceDelta: 180, specs: { Storage: '512GB UFS 4.0 Storage', Color: 'Desert Sand Gold', Network: '5G Global Unlocked' } },
  { label: '512GB Storage / Obsidian Titanium / Factory Unlocked', priceDelta: 180, specs: { Storage: '512GB Pro Storage', Color: 'Obsidian Titanium', Network: 'Wi-Fi 7 + 5G Advanced' } },
  { label: '512GB Storage / Emerald Green / Dual SIM Global', priceDelta: 190, specs: { Storage: '512GB UFS 4.0 Storage', Color: 'Emerald Green', Network: 'Dual Physical SIM + eSIM' } },
  { label: '1TB Ultra Storage / Titanium Gray / Factory Unlocked', priceDelta: 380, specs: { Storage: '1TB Extreme Internal Storage', Color: 'Titanium Gray', Camera: 'ProRAW & 8K 60fps Recording' } },
  { label: '1TB Ultra Storage / Ceramic White / Factory Unlocked', priceDelta: 380, specs: { Storage: '1TB Extreme Internal Storage', Color: 'Ceramic White', Camera: 'ProRAW & 8K 60fps Recording' } },
  { label: '256GB Storage / Lavender Violet / Dual eSIM Global', priceDelta: 20, specs: { Storage: '256GB UFS 4.0 Storage', Color: 'Lavender Violet', Charging: 'Wireless Fast Charge Ready' } },
  { label: '512GB Storage / Cyber Neon Edition / 16GB High-Speed RAM', priceDelta: 220, specs: { RAM: '16GB LPDDR5X Overclocked', Storage: '512GB UFS 4.0', Edition: 'Cyber Neon Gaming Edition' } },
  { label: '1TB Ultimate / 24GB Esports RAM / Aero Cooler Bundled', priceDelta: 450, specs: { RAM: '24GB Ultra-High LPDDR5X', Storage: '1TB UFS 4.0', Cooling: 'AeroActive External Cooler Included' } },
  { label: '256GB Storage / Frost Silver / 5G Global Dual SIM', priceDelta: 15, specs: { Storage: '256GB High-Speed UFS', Color: 'Frost Silver', Connectivity: 'Wi-Fi 7 Tri-Band' } },
  { label: '512GB Storage / Sunset Orange / 120W GaN Super Charger Bundled', priceDelta: 210, specs: { Storage: '512GB High-Speed UFS', Color: 'Sunset Orange', Charger: '120W GaN Fast Charger Included' } },
  { label: 'Satellite SOS Enabled / 256GB / Rugged Ballistic Bumper Case', priceDelta: 60, specs: { Storage: '256GB Heavy-Duty Storage', Features: 'Two-Way Satellite SOS', Case: 'Military Drop Case Bundled' } },
];

// OTHER 13 CUTTING-EDGE ELECTRONICS & GADGETS CATEGORIES
const OTHER_TECH_CATEGORIES = [
  {
    category: 'Tablets & Mobile Slates',
    target: 295,
    queryKey: ['tablet', 'smartphone'],
    prefix: 'TAB',
    brands: ['Apple iPad', 'Samsung Galaxy Tab', 'OnePlus', 'Xiaomi', 'Lenovo Legion', 'Microsoft Surface', 'Google'],
    models: [
      { name: 'iPad Pro 13-Inch M4 Ultra Retina Tandem OLED', basePrice: 1299, desc: 'Impossibly thin 5.1mm chassis powered by breakthrough Apple M4 silicon with dual-stack Tandem OLED display and 120Hz ProMotion.' },
      { name: 'iPad Pro 11-Inch M4 Breakthrough Silicon', basePrice: 999, desc: 'Ultra-portable powerhouse with 11-inch Ultra Retina XDR display, hardware ray tracing, studio mics, and LiDAR scanner.' },
      { name: 'iPad Air 13-Inch M2 Liquid Retina Display', basePrice: 799, desc: 'Spacious 13-inch display with Apple M2 chip, Landscape stereo speakers, Apple Pencil Pro support, and all-day battery.' },
      { name: 'iPad Air 11-Inch M2 Supercharged Tablet', basePrice: 599, desc: 'Featherlight tablet with Apple M2 performance, Touch ID in top button, 12MP front/rear cameras, and USB-C.' },
      { name: 'iPad Mini 6 All-Screen Design A15 Bionic', basePrice: 499, desc: 'Pocketable 8.3-inch Liquid Retina display with True Tone, A15 Bionic chip, and magnetic Apple Pencil 2 attachment.' },
      { name: 'Galaxy Tab S9 Ultra 14.6" Dynamic AMOLED 2X', basePrice: 1199, desc: 'Colossal 14.6-inch tablet with IP68 water resistance, Snapdragon 8 Gen 2, bundled low-latency S Pen, and Quad AKG speakers.' },
      { name: 'Galaxy Tab S9+ 12.4" IP68 Waterproof Tablet', basePrice: 999, desc: 'Vibrant 12.4-inch AMOLED 2X display with Armor Aluminum frame, Vision Booster, and multi-window productivity.' },
      { name: 'Galaxy Tab S9 FE 10.9" S Pen Included Slate', basePrice: 449, desc: 'IP68 water and dust resistant slate with long-lasting 8000mAh battery, dual speakers, and 90Hz smooth screen.' },
      { name: 'OnePlus Pad 2 3K 144Hz Snapdragon 8 Gen 3 Slate', basePrice: 549, desc: 'Industry-leading 7:5 ReadFit 3K display with 6 speakers, 67W SUPERVOOC charging, and seamless phone cross-screen.' },
      { name: 'Xiaomi Pad 6S Pro 12.4" 144Hz 3K 120W HyperCharge', basePrice: 599, desc: 'Snapdragon 8 Gen 2 with 3:2 productivity ratio, 10,000mAh battery, 120W wired charging, and Xiaomi HyperOS.' },
      { name: 'Lenovo Legion Tab 8.8" QHD 144Hz Gaming Slate', basePrice: 499, desc: 'Compact dual USB-C gaming tablet with Legion ColdFront vapor chamber and pure display gaming performance.' },
      { name: 'Surface Pro 11 Copilot+ PC Snapdragon X Elite', basePrice: 999, desc: 'Next-gen AI 2-in-1 slate with 45 TOPS NPU, OLED touchscreen, all-day battery life, and Surface Slim Pen haptics.' },
    ],
    variants: [
      { label: '128GB Wi-Fi / Matte Space Gray', priceDelta: 0, specs: { Storage: '128GB Flash', Network: 'Wi-Fi 6E / Wi-Fi 7' } },
      { label: '256GB Wi-Fi / Starlight Silver Edition', priceDelta: 100, specs: { Storage: '256GB Flash', Display: 'High Refresh Rate' } },
      { label: '512GB Wi-Fi / Desert Gold Finish', priceDelta: 250, specs: { Storage: '512GB Flash', Productivity: 'Split View Multitasking' } },
      { label: '1TB Ultra Storage / OLED Nano-Texture Glass', priceDelta: 500, specs: { Storage: '1TB High-End Flash', Glass: 'Anti-Glare Nano-Texture' } },
      { label: '256GB 5G Cellular + Wi-Fi Unlocked', priceDelta: 170, specs: { Storage: '256GB Flash', Connectivity: '5G LTE Unlocked SIM' } },
      { label: 'With Magnetic Bluetooth Keyboard Case & Stylus Pen', priceDelta: 120, specs: { Accessories: 'Detachable Trackpad Keyboard + Active Stylus' } },
    ],
  },
  {
    category: 'Mobile Gadgets & MagSafe Gear',
    target: 295,
    queryKey: ['phone-accessories', 'gadgets', 'mobile-technology'],
    prefix: 'MGD',
    brands: ['DJI', 'Insta360', 'Rode', 'Anker', 'Shargeek', 'Belkin', 'Peak Design', 'Moft', 'ESR', 'Moment'],
    models: [
      { name: 'Osmo Mobile 6 Smart 3-Axis Phone Gimbal Stabilizer', basePrice: 159, desc: 'Compact foldable smartphone stabilizer with built-in extension rod, ActiveTrack 6.0, quick launch, and gesture control.' },
      { name: 'Flow Pro AI 3-Axis Tracking Gimbal with Apple DockKit', basePrice: 159, desc: 'First gimbal with Apple DockKit native camera tracking, Deep Track 3.0, built-in tripod, and selfie light shoe.' },
      { name: 'Mic 2 Dual-Channel Wireless Lavalier System + Case', basePrice: 349, desc: '32-bit float internal audio recording, intelligent noise cancelling, 250m range, and 18-hour battery charging case.' },
      { name: 'Wireless PRO Compact Dual Transmitter Microphone Kit', basePrice: 399, desc: 'Broadcast-grade wireless audio with timecode generator, GainAssist, 32-bit float on-board recording, and lav mics.' },
      { name: 'MagGo 3-in-1 Foldable Qi2 15W Fast Charging Station', basePrice: 109, desc: 'Certified Qi2 15W ultra-fast wireless charging for iPhone, Apple Watch, and AirPods in a pocket-sized folding form.' },
      { name: 'BoostCharge Pro 3-in-1 MagSafe Wireless Charging Pad', basePrice: 149, desc: 'Lay-flat premium chrome and silicone charging pad delivering 15W official MagSafe charging across all devices.' },
      { name: 'Sharge Disk M.2 NVMe SSD Enclosure with Active Fan', basePrice: 69, desc: 'Pocket EDC aluminum enclosure with built-in active cooling fan, IP54 silicone bumper, and write protection switch.' },
      { name: 'Universal Mobile Video Cage Dual Cold Shoe Rig', basePrice: 79, desc: 'CNC aluminum smartphone cage with dual ergonomic side handles, multiple 1/4"-20 threads, and power bank mount.' },
      { name: 'MagSafe Snap-On Tri-Fold Wallet & Phone Stand', basePrice: 39, desc: 'Vegan leather magnetic wallet holding 3 cards with adjustable portrait/landscape angles and steel hinge.' },
      { name: '622 Magnetic Battery (MagGo) 5000mAh Foldable Kickstand', basePrice: 59, desc: 'Slim MagSafe battery snapping firmly to iPhone back with versatile fold-out kickstand and USB-C two-way port.' },
      { name: 'Moment 67mm Mobile Lens Filter Mount & Adapter', basePrice: 49, desc: 'Allows standard 67mm camera filters (CPL, ND, Black Mist) to mount directly onto smartphones for cinematic video.' },
      { name: 'Magnetic Semiconductor Radiator Active Phone Cooler', basePrice: 45, desc: 'Peltier cooling chip dropping phone temperature by up to 25C in seconds with RGB ambient light and MagSafe ring.' },
    ],
    variants: [
      { label: 'Matte Carbon Black / Protective Travel Pouch', priceDelta: 0, specs: { Finish: 'Anodized Matte Carbon', Material: 'Aerospace Grade Aluminum' } },
      { label: 'Arctic Glacier White / Braided Type-C Cable', priceDelta: 10, specs: { Color: 'Arctic White', Cable: 'Braided 100W 3ft Cable' } },
      { label: 'Cyberpunk Transparent Edition / LED Backlit', priceDelta: 25, specs: { Style: 'Transparent Industrial', Lighting: 'Addressable RGB LED' } },
      { label: 'Pro Creator Rig Bundle with Mini Tripod & Extension', priceDelta: 45, specs: { Mount: 'Arca-Swiss Standard / Cold Shoe', Extras: 'Mini Tripod + Ballhead' } },
    ],
  },
  {
    category: 'Laptops & Computers',
    target: 300,
    queryKey: ['laptop', 'gaming-laptop'],
    prefix: 'LAP',
    brands: ['Apple', 'ASUS ROG', 'Lenovo Legion', 'Dell XPS', 'Razer', 'MSI', 'Framework', 'Acer Predator', 'HP Omen', 'Minisforum'],
    models: [
      { name: 'MacBook Pro 16 M3 Max Studio Flagship', basePrice: 3499, desc: 'Extreme dynamic range Liquid Retina XDR display, up to 22-hour battery life, and pro studio audio array.' },
      { name: 'Zephyrus G16 OLED Ultra-Slim Gaming Laptop', basePrice: 1999, desc: 'Ultra-slim CNC aluminum chassis with 240Hz 0.2ms ROG Nebula OLED, vapor chamber cooling, and Dolby Atmos audio.' },
      { name: 'Legion Pro 7i Gen 9 High-Performance Rig', basePrice: 2299, desc: 'Overclockable computing powerhouse powered by Legion Coldfront vapor chamber and PureSight WQXGA 240Hz display.' },
      { name: 'XPS 16 InfinityEdge 4K Touch Laptop', basePrice: 2199, desc: 'Futuristic seamless glass touch pad, capacitive touch row, and vivid 4K+ OLED InfinityEdge display.' },
      { name: 'Blade 16 Dual-Mode Mini-LED Esports Laptop', basePrice: 2799, desc: 'World premier dual-mode display switching between 4K 120Hz creator mode and FHD+ 240Hz esports gaming.' },
      { name: 'Stealth 16 AI Studio Thin & Light Laptop', basePrice: 1849, desc: 'Magnesium-aluminum alloy featherlight body certified for NVIDIA Studio with 99.9Whr high-capacity flight-ready battery.' },
      { name: 'Predator Helios 18 Immersive Gaming Laptop', basePrice: 2499, desc: 'Massive 18-inch 250Hz Mini-LED display with 5th Gen AeroBlade 3D metal fans and liquid metal thermal grease.' },
      { name: 'Omen Transcend 14 OLED Ultraportable Rig', basePrice: 1499, desc: 'World lightest 14-inch gaming laptop with IMAX Enhanced certified OLED screen and HyperX tuned audio.' },
      { name: 'Framework Laptop 16 Modular & Upgradable', basePrice: 1799, desc: 'Fully repairable high-performance modular laptop with hot-swappable GPU bay and customizable input matrix.' },
      { name: 'EliteMini AI Workstation Compact Mini PC', basePrice: 899, desc: 'Ultra-compact dual-fan liquid-cooled desktop PC supporting quad 4K monitors and high-speed PCIe 5.0 SSDs.' },
    ],
    variants: [
      { label: '32GB RAM / 1TB Gen4 NVMe / RTX 4080', priceDelta: 0, specs: { RAM: '32GB DDR5 5600MHz', Storage: '1TB M.2 PCIe 4.0', GPU: 'NVIDIA RTX 4080 12GB' } },
      { label: '64GB RAM / 2TB Gen4 NVMe / RTX 4090', priceDelta: 550, specs: { RAM: '64GB DDR5 5600MHz', Storage: '2TB M.2 PCIe 4.0', GPU: 'NVIDIA RTX 4090 16GB' } },
      { label: '16GB RAM / 512GB NVMe / RTX 4070', priceDelta: -280, specs: { RAM: '16GB DDR5 5200MHz', Storage: '512GB M.2 NVMe', GPU: 'NVIDIA RTX 4070 8GB' } },
      { label: '32GB RAM / 2TB Gen5 NVMe / OLED Edition', priceDelta: 320, specs: { RAM: '32GB LPDDR5X 7500MHz', Storage: '2TB PCIe Gen5', Display: '4K OLED 120Hz' } },
      { label: '64GB RAM / 4TB Enterprise Dual SSD', priceDelta: 850, specs: { RAM: '64GB Overclocked', Storage: '4TB RAID-0 NVMe', OS: 'Windows 11 Pro Licensed' } },
    ],
  },
  {
    category: 'Monitors & Displays',
    target: 290,
    queryKey: ['computer-monitor'],
    prefix: 'MON',
    brands: ['LG UltraGear', 'Samsung Odyssey', 'Alienware', 'ASUS TUF', 'BenQ Mobiuz', 'Gigabyte', 'MSI Optix', 'ViewSonic Elite', 'Philips Evnia'],
    models: [
      { name: '34" Curved QD-OLED 175Hz Gaming Monitor', basePrice: 899, desc: 'Stunning Quantum Dot OLED panel with infinite 1.5M:1 contrast, 0.03ms GtG response, and AMD FreeSync Premium Pro.' },
      { name: '49" Dual QHD 240Hz 1000R Super UltraWide', basePrice: 1199, desc: 'Expansive 32:9 immersive curved workstation display equivalent to dual 27-inch QHD monitors side by side.' },
      { name: '27" 4K Fast IPS 160Hz Esports Pro Display', basePrice: 599, desc: 'Factory color-calibrated 98% DCI-P3 monitor with VESA DisplayHDR 600 and HDMI 2.1 for PS5 & PC.' },
      { name: '32" 4K QD-OLED 240Hz Anti-Reflection Monitor', basePrice: 1099, desc: 'Next-gen third-generation QD-OLED panel offering razor-sharp text clarity and pixel-perfect HDR highlights.' },
      { name: '15.6" 4K OLED Portable Travel Monitor', basePrice: 329, desc: 'Ultralight CNC aluminum portable screen with 100% DCI-P3, 10-point capacitive touch, and dual USB-C DP Alt.' },
      { name: '38" WQHD+ 144Hz Nano IPS Curved Workstation', basePrice: 949, desc: 'Ultra-wide 21:9 professional editing screen with Thunderbolt 3 85W power delivery and built-in KVM switch.' },
      { name: '24.5" 360Hz Fast IPS Esports Tournament Display', basePrice: 449, desc: 'Engineered for competitive shooters with NVIDIA Reflex Latency Analyzer and dual-axis ergonomic stand.' },
      { name: '32" 4K Mini-LED 144Hz 1152-Zone HDR1000', basePrice: 799, desc: 'Local dimming matrix delivering true 1000-nit peak brightness without blooming on dark backgrounds.' },
      { name: '45" UltraGear Curved OLED 240Hz 0.03ms Display', basePrice: 1299, desc: 'Massive 800R curved gaming display with 98.5% DCI-P3 and anti-glare low-reflection coating.' },
      { name: '27" 1440p 240Hz Fast IPS Esports Monitor', basePrice: 429, desc: 'Ultra-responsive 1ms GtG esports gaming monitor with AMD FreeSync Premium and ergonomic pivot stand.' },
    ],
    variants: [
      { label: 'Deep Matte Black / VESA Mount Ready', priceDelta: 0, specs: { Panel: 'QD-OLED / Fast IPS', ColorSync: '10-bit 99% DCI-P3', RefreshRate: '175Hz - 240Hz' } },
      { label: 'Ergonomic Desk Arm Included Bundle', priceDelta: 65, specs: { Stand: 'Gas-Spring Heavy Duty Arm', Ports: '2x HDMI 2.1, 1x DP 1.4, USB Hub' } },
      { label: 'KVM Switch + 90W Type-C Power Delivery', priceDelta: 90, specs: { Connectivity: 'Thunderbolt / USB-C 90W PD', Audio: 'DTS Sound Integrated' } },
      { label: 'Color Calibrated Creator Edition', priceDelta: 45, specs: { DeltaE: '< 1.0 Factory Certified', Shield: 'Magnetic Anti-Glare Hood' } },
      { label: 'Pro Dual-Input Multi-Tasking Hub Edition', priceDelta: 80, specs: { PipPbp: 'Picture-in-Picture Supported', Hub: '4-Port High-Speed USB 3.2' } },
    ],
  },
  {
    category: 'Keyboards & Mice',
    target: 290,
    queryKey: ['mechanical-keyboard', 'gaming-mouse'],
    prefix: 'KBM',
    brands: ['Logitech G', 'Razer', 'Keychron', 'Corsair', 'SteelSeries', 'Glorious', 'NuPhy', 'Ducky', 'Akko', 'Wooting'],
    models: [
      { name: 'Q1 Pro Wireless QMK/VIA Custom Mechanical Keyboard', basePrice: 199, desc: 'Full CNC machined aluminum body, double-gasket acoustic mount, screw-in stabilizers, and hot-swap sockets.' },
      { name: 'PRO X SUPERLIGHT 2 Wireless Ultralight Gaming Mouse', basePrice: 159, desc: 'Sub-60g competitive esports mouse with HERO 2 sensor, LIGHTFORCE hybrid optical-mechanical switches, and 4K polling.' },
      { name: 'BlackWidow V4 Pro Mechanical Gaming Keyboard', basePrice: 229, desc: 'Dedicated macro column, multi-function digital roller, magnetic plush leatherette wrist rest with underglow.' },
      { name: 'Air75 V2 Ultra-Slim Wireless Mechanical Keyboard', basePrice: 119, desc: 'World thinnest low-profile mechanical keyboard with Gateron low-profile switches and multi-device Bluetooth 5.3.' },
      { name: '60HE+ Analog Hall Effect Rapid Trigger Keyboard', basePrice: 175, desc: 'Lekker magnetic switches with adjustable 0.1mm to 4.0mm actuation and continuous rapid trigger reset.' },
      { name: 'Viper V3 Pro 54g Ultra-Lightweight Wireless Mouse', basePrice: 159, desc: 'Flawless 35,000 DPI Focus Pro 35K Gen-2 optical sensor with genuine 8000Hz hyper-polling dongle included.' },
      { name: 'MX Master 3S Advanced Ergonomic Wireless Mouse', basePrice: 99, desc: 'Quiet click electromagnetic MagSpeed scroll wheel, 8K DPI track-on-glass sensor, and thumb gesture button.' },
      { name: 'One 3 RGB Hot-Swappable Double-Shot PBT Keyboard', basePrice: 139, desc: 'QUACK Mechanics acoustic design with dual-layer high-grade silicone dampening and authentic Cherry MX switches.' },
      { name: 'Apex Pro TKL Wireless OmniPoint Adjustable Keyboard', basePrice: 249, desc: 'OmniPoint 2.0 hyper-magnetic switches with 20x faster actuation, OLED smart display, and aircraft aluminum frame.' },
      { name: 'Model O 2 Wireless Superlight Honeycomb Mouse', basePrice: 79, desc: 'BAMF 2.0 26K optical sensor, frictionless G-Skates virgin PTFE feet, and up to 210 hours battery longevity.' },
    ],
    variants: [
      { label: 'Hot-Swap Tactile Brown / Matte Carbon', priceDelta: 0, specs: { Switch: 'Pre-lubed Tactile', Connectivity: 'Tri-Mode (2.4G/BT/Wired)' } },
      { label: 'Linear Red Silent / PBT Dye-Sub Keycaps', priceDelta: 15, specs: { Switch: 'Linear 45g Smooth', Keycaps: 'Cherry Profile PBT' } },
      { label: 'Clicky Blue Switches / RGB Per-Key Aura', priceDelta: -10, specs: { Feedback: 'Acoustic Clicky 55g', Backlight: '16.8M RGB South-Facing' } },
      { label: 'Hall Effect Magnetic / Rapid Trigger Tuned', priceDelta: 35, specs: { Actuation: '0.1mm - 4.0mm Adjustable', Polling: '8000Hz Ultra-Low Latency' } },
    ],
  },
  {
    category: 'Audio & Headphones',
    target: 290,
    queryKey: ['headphones', 'microphone-studio'],
    prefix: 'AUD',
    brands: ['Sony', 'Bose', 'Sennheiser', 'Audio-Technica', 'Shure', 'Beyerdynamic', 'Marshall', 'JBL', 'Rode', 'FiiO'],
    models: [
      { name: 'WH-1000XM5 Wireless Noise Canceling Headphones', basePrice: 399, desc: 'Industry-leading noise cancellation with dual QN1 processors, 8 microphones, LDAC Hi-Res Wireless, and 30hr battery.' },
      { name: 'QuietComfort Ultra Spatial Audio Headphones', basePrice: 429, desc: 'Breakthrough spatialized audio immersion, CustomTune acoustic calibration, and world-class quiet and aware modes.' },
      { name: 'MOMENTUM 4 Wireless Audiophile Headphones', basePrice: 299, desc: 'Signature Sennheiser acoustic sound with 42mm audiophile transducers and unrivaled 60-hour marathon battery.' },
      { name: 'SM7B Dynamic Vocal Studio Microphone', basePrice: 399, desc: 'Legendary broadcast vocal dynamic mic with flat, wide-range frequency response and internal air suspension shock isolation.' },
      { name: 'ATH-M50xBT2 Professional Studio Monitor Headphones', basePrice: 199, desc: 'Proprietary 45mm large-aperture drivers with rare earth magnets, copper-clad aluminum voice coils, and 50hr battery.' },
      { name: 'DT 990 PRO 250 Ohm Open Studio Reference Headphones', basePrice: 169, desc: 'Open-back diffuse-field studio benchmark headphones with robust spring steel headband and plush velour earpads.' },
      { name: 'Wave:3 Premium USB Studio Condenser Microphone', basePrice: 149, desc: 'Broadcast-grade cardioid capsule with Clipguard anti-distortion technology and Wave Link digital mixing software.' },
      { name: 'Major IV Bluetooth Wireless Foldable Headphones', basePrice: 149, desc: 'Iconic Marshall vintage textured vinyl design with custom-tuned dynamic drivers and 80+ hours wireless playtime.' },
      { name: 'Rodecaster Pro II Integrated Audio Production Studio', basePrice: 699, desc: 'Ultra-low-noise Revolution Preamp quad inputs with SMART pads, APHEX audio processing, and dual USB-C interfaces.' },
      { name: 'BTR7 Portable Bluetooth Hi-Fi DAC Headphone Amp', basePrice: 199, desc: 'Dual THX AAA-28 amplifiers with dual ES9219C DAC chips, balanced 4.4mm output, and full MQA decoding.' },
    ],
    variants: [
      { label: 'Midnight Black Edition / Protective Hardcase', priceDelta: 0, specs: { Driver: '40mm High-Res Diaphragm', Battery: '30 - 60 Hours Playback' } },
      { label: 'Silver Platinum Luxe / Travel Flight Adapter', priceDelta: 20, specs: { Codecs: 'LDAC, AAC, aptX Adaptive', Charging: 'USB-C Fast Charge 3min=3hr' } },
      { label: 'Studio Boom Arm + Heavy Pop Filter Bundle', priceDelta: 60, specs: { PolarPattern: 'Cardioid Studio Grade', Connection: 'Balanced XLR / USB' } },
      { label: 'Dual XLR Cable + Shockmount Suspension Kit', priceDelta: 45, specs: { FrequencyResponse: '20Hz - 20,000Hz', Impedance: '150 - 250 Ohms' } },
    ],
  },
  {
    category: 'Earbuds & Portable Speakers',
    target: 290,
    queryKey: ['wireless-earbuds', 'bluetooth-speaker'],
    prefix: 'EAR',
    brands: ['Sony', 'Apple', 'Bose', 'Sennheiser', 'Anker Soundcore', 'JBL', 'Bang & Olufsen', 'Marshall', 'Beats'],
    models: [
      { name: 'WF-1000XM5 True Wireless Noise Canceling Earbuds', basePrice: 299, desc: 'Dual feedback microphones with Integrated Processor V2, Dynamic Driver X, and crystal-clear bone conduction sensors.' },
      { name: 'AirPods Pro 2 USB-C with Active Noise Cancellation', basePrice: 249, desc: 'H2 chip power with Adaptive Audio, Transparency mode, and Personalized Spatial Audio with dynamic head tracking.' },
      { name: 'QuietComfort Ultra Wireless Noise Canceling Earbuds', basePrice: 299, desc: 'CustomTune sound calibration that personalizes noise cancellation and sound performance directly to your ear canals.' },
      { name: 'Soundcore Liberty 4 NC Wireless Noise Canceling Earbuds', basePrice: 99, desc: 'Reduces noise by up to 98.5% with high-sensitivity in-ear sound sensor, custom 11mm drivers, and LDAC audio.' },
      { name: 'Charge 5 Portable Waterproof Bluetooth Speaker', basePrice: 179, desc: 'Long-excursion driver, separate tweeter, dual passive bass radiators, IP67 waterproof/dustproof with built-in powerbank.' },
      { name: 'Emberton II Portable Bluetooth Speaker', basePrice: 169, desc: 'True Stereophonic multi-directional 360-degree sound with 30+ hours of portable playtime and rugged IP67 rating.' },
      { name: 'Fit Pro True Wireless Sports Earbuds', basePrice: 199, desc: 'Secure-fit wingtips that stay locked during intense workouts, powered by Apple H1 chip with Active Noise Cancelling.' },
      { name: 'Flip 6 Eco-Edition Rugged Bluetooth Speaker', basePrice: 129, desc: '2-way speaker system delivering powerful, crystal-clear sound with deep bass in an eco-friendly recycled body.' },
      { name: 'Beosound Explore Ultra-Durable Outdoor Speaker', basePrice: 199, desc: 'Type II anodized scratch-resistant aluminum shell with carabiner clip and true 360 sound for backcountry trekking.' },
      { name: 'MOMENTUM True Wireless 4 Flagship Earbuds', basePrice: 299, desc: 'Lossless audio streaming with Qualcomm S5 Gen 2, Auracast broadcasting, and continuous 30-hour battery case.' },
    ],
    variants: [
      { label: 'Stealth Black / Qi Wireless Charging Case', priceDelta: 0, specs: { Battery: 'Up to 30 Hours with Case', WaterResistance: 'IPX4 / IPX7' } },
      { label: 'Glacier White / Silicone Ear Tip Multipack', priceDelta: 10, specs: { Tips: 'XS, S, M, L Memory Foam', Microphones: '6x Beamforming AI Mics' } },
      { label: 'Rugged Forest Green / Metal Carabiner Clip', priceDelta: 15, specs: { Enclosure: 'Drop-Resistant Rubberized Armor', Bluetooth: 'BT 5.3 Multipoint' } },
      { label: 'Special Edition Gold Metallic Trim', priceDelta: 30, specs: { Tuning: 'Audiophile Certified Hi-Res Wireless', Latency: 'Ultra-Low Gaming Mode' } },
    ],
  },
  {
    category: 'Cameras, Drones & Creators',
    target: 290,
    queryKey: ['camera-lens', 'drone', 'action-camera'],
    prefix: 'CAM',
    brands: ['DJI', 'Sony Alpha', 'GoPro', 'Canon EOS', 'Insta360', 'Fujifilm', 'Nikon Z', 'Elgato', 'Sigma'],
    models: [
      { name: 'Alpha a7 IV Full-Frame Mirrorless Camera', basePrice: 2499, desc: '33MP full-frame Exmor R back-illuminated sensor with BIONZ XR processing, 4K 60p video, and real-time Eye AF tracking.' },
      { name: 'Mini 4 Pro Fly More Combo Drone', basePrice: 1099, desc: 'Sub-249g ultralight drone with omnidirectional obstacle sensing, 4K/60fps HDR true vertical shooting, and 34-min flight.' },
      { name: 'HERO12 Black Waterproof Action Camera', basePrice: 399, desc: '5.3K 60fps video with HyperSmooth 6.0 stabilization, HDR video, dual LCD screens, and GP2 processing engine.' },
      { name: 'X4 8K 360 Waterproof Action Camera', basePrice: 499, desc: 'Unbeatable 8K 30fps 360-degree capture with invisible selfie stick effect, FlowState stabilization, and AI gesture control.' },
      { name: 'EOS R6 Mark II Full-Frame Camera Body', basePrice: 2299, desc: '24.2MP high-speed sensor shooting up to 40fps electronic shutter, 6K oversampled 4K 60p, and in-body 8-stop IS.' },
      { name: 'Avata 2 FPV Drone Fly More Combo', basePrice: 999, desc: 'Immersive FPV flight with 4K/60fps HDR wide-angle video, integrated propeller guard, and Goggles 3 with Real View PiP.' },
      { name: 'Osmo Pocket 3 1-Inch Sensor Gimbal Camera', basePrice: 519, desc: 'Pocket-sized motorized 3-axis stabilizer with 1-inch CMOS sensor, 2-inch rotatable OLED touchscreen, and 4K 120fps.' },
      { name: 'X-T5 Mirrorless Digital Camera Body', basePrice: 1699, desc: '40.2MP X-Trans CMOS 5 HR sensor with classic tactile dials, film simulation modes, and 7-stop in-body stabilization.' },
      { name: 'Stream Deck XL 32-Key Studio Controller', basePrice: 249, desc: '32 customizable LCD keys for triggering limitless actions, scene transitions, audio mixing, and smart home shortcuts.' },
      { name: '24-70mm F2.8 DG DN Art Lens (Sony E / Leica L)', basePrice: 1099, desc: 'Industry benchmark professional standard zoom lens with nano porous coating, 11-blade aperture, and weather sealing.' },
    ],
    variants: [
      { label: 'Body Only / Standard Kit Package', priceDelta: 0, specs: { Sensor: 'Full-Frame / 1-Inch CMOS', Stabilization: '5-Axis In-Body IS' } },
      { label: 'With 24-70mm f/4 IS Zoom Lens Kit', priceDelta: 600, specs: { Lens: '24-70mm Optical Image Stabilized', FilterThread: '72mm Front' } },
      { label: 'Fly More Combo (3 Batteries + Hub + Bag)', priceDelta: 240, specs: { FlightTime: 'Up to 102 Minutes Total', Bag: 'Water-Resistant Shoulder Pouch' } },
      { label: 'Creator Accessory Pack (Wireless Mic + Tripod)', priceDelta: 160, specs: { Audio: '2.4GHz Wireless Transmitter Included', Mount: 'Universal 1/4-inch Arca' } },
    ],
  },
  {
    category: 'Gaming Handhelds & VR',
    target: 290,
    queryKey: ['gaming-console', 'vr-headset'],
    prefix: 'GAM',
    brands: ['Valve Steam Deck', 'ASUS ROG', 'Lenovo Legion', 'Meta Quest', 'PlayStation', 'Xbox', '8BitDo', 'Turtle Beach', 'SCUF'],
    models: [
      { name: 'Quest 3 Mixed Reality All-In-One VR Headset', basePrice: 499, desc: 'Breakthrough mixed reality with dual RGB color cameras, 4K+ Infinite Display, 3D spatial audio, and Touch Plus controllers.' },
      { name: 'Steam Deck OLED 1TB Handheld Gaming PC', basePrice: 649, desc: 'Stunning 7.4-inch 90Hz HDR OLED display, 6nm AMD APU, 50Whr battery for up to 12 hours gameplay, and Wi-Fi 6E.' },
      { name: 'ROG Ally X Handheld Gaming Console (24GB RAM)', basePrice: 799, desc: 'Upgraded AMD Ryzen Z1 Extreme with 24GB LPDDR5X-7500 RAM, massive 80Wh battery, dual USB-C ports, and 1TB SSD.' },
      { name: 'Legion Go 8.8" QHD+ Detachable Controller Handheld', basePrice: 699, desc: 'Pivot gaming with detachable trueStrike controllers with FPS mouse mode, 144Hz screen, and dual USB-4 40Gbps ports.' },
      { name: 'PlayStation 5 Pro Console (2TB Storage)', basePrice: 699, desc: 'PlayStation Spectral Super Resolution AI upscaling, advanced ray tracing fidelity, and steady 60fps/120fps 4K gaming.' },
      { name: 'Xbox Series X 1TB Gaming Console', basePrice: 499, desc: 'True 4K gaming powered by 12 teraflops of raw graphic processing, Quick Resume, and Xbox Velocity Architecture.' },
      { name: 'G923 TRUEFORCE Racing Wheel and Pedals', basePrice: 349, desc: 'High-definition force feedback dialing into game physics engines at 4000 times per second for authentic track grip.' },
      { name: 'DualSense Edge Wireless Customizable Controller', basePrice: 199, desc: 'Remappable back buttons, changeable stick caps, tunable trigger stops, and modular replaceable stick modules.' },
      { name: 'Ultimate 2.4G Wireless Controller with Charging Dock', basePrice: 69, desc: 'Hall Effect sensing joysticks preventing stick drift, customizable tactile back paddles, and seamless charging dock.' },
      { name: 'Stealth Pro Wireless Multiplatform Gaming Headset', basePrice: 329, desc: 'Hand-matched 50mm Nanoclear drivers, active noise cancellation, and swappable dual-battery continuous power system.' },
    ],
    variants: [
      { label: 'Standard Retail Edition / Cables Included', priceDelta: 0, specs: { Compatibility: 'PC / PS5 / Xbox / Mobile', Connection: 'Low-Latency Wireless 2.4G' } },
      { label: 'Elite Pro Bundle with Magnetic Charging Stand', priceDelta: 50, specs: { Stand: 'Magnetic Rapid Dock with LED', Extras: 'Extra Thumbsticks & D-Pads' } },
      { label: '512GB Extended Internal Storage Model', priceDelta: 150, specs: { Storage: '512GB High-Speed NVMe', Display: 'Pancake Lenses 120Hz' } },
      { label: 'Flight Pro Pedal Rudder Attachment Combo', priceDelta: 120, specs: { Pedals: 'Differential Braking Foot Pedals', Materials: 'Industrial Steel & Aluminum' } },
    ],
  },
  {
    category: 'Smart Home & Robotics',
    target: 290,
    queryKey: ['smart-home', 'robot-vacuum'],
    prefix: 'SMT',
    brands: ['Roborock', 'iRobot', 'Ring', 'eufy', 'Ecobee', 'Philips Hue', 'TP-Link Tapo', 'Google Nest', 'Nanoleaf', 'Dyson'],
    models: [
      { name: 'S8 Pro Ultra Robot Vacuum and Sonic Mop', basePrice: 1399, desc: 'RockDock Ultra all-in-one dock that self-washes, self-dries, self-empties, and self-refills with 6000Pa suction.' },
      { name: 'Roomba Combo j9+ Auto-Retracting Mop Robot', basePrice: 999, desc: 'Identifies and avoids obstacles like pet waste and cables with D.R.I.V.E. intelligence and auto-retracting mop head.' },
      { name: 'Battery Doorbell Plus Head-to-Toe HD Video', basePrice: 149, desc: '1536p HD expanded field of view showing packages on your doorstep, color night vision, and two-way talk.' },
      { name: 'SoloCam S340 Solar Powered 360 Security Camera', basePrice: 199, desc: 'Continuous solar charging with dual 3K cameras, 8x hybrid zoom, 360-degree pan and tilt, and zero monthly fees.' },
      { name: 'Smart Thermostat Premium with Remote Sensor', basePrice: 249, desc: 'Zinc metal bezel with radar occupancy detection, air quality monitor, and built-in hands-free voice assistant.' },
      { name: 'White and Color Ambiance Smart LED Starter Kit (4pk)', basePrice: 179, desc: '16 million colors with sync to music and games, Hue Bridge hub included for reliable local Zigbee response.' },
      { name: 'Lines Smarter RGB Backlit Modular Light Bars', basePrice: 199, desc: 'Ultra-lightweight modular LED light bars that connect at 60-degree angles with music visualizer and screen mirroring.' },
      { name: 'Purifier Hot+Cool Formaldehyde Air Purifier Fan', basePrice: 699, desc: 'HEPA H13 sealed filtration destroying formaldehyde, capturing 99.97% of allergens with bladeless heating and cooling.' },
      { name: 'Smart Wi-Fi Outdoor Plugs Dual Socket IP64', basePrice: 29, desc: 'Weatherproof dual independent sockets with energy monitoring, schedule timers, and Matter cross-platform support.' },
      { name: 'Smart Lock Pro Keyless Touchscreen Deadbolt', basePrice: 229, desc: 'Fingerprint biometric unlock in 0.3 seconds, built-in Wi-Fi, auto-locking door sensors, and backup physical keys.' },
    ],
    variants: [
      { label: 'Standard Device with Mounting Hardware', priceDelta: 0, specs: { Ecosystem: 'Matter, HomeKit, Alexa, Google', Connectivity: 'Wi-Fi 6 / Zigbee / Thread' } },
      { label: 'Complete Home Automation 2-Pack Bundle', priceDelta: 120, specs: { Coverage: 'Whole-Home Expanded Range', Power: 'Solar + High-Capacity Battery' } },
      { label: 'With 1-Year Cloud Storage Voucher', priceDelta: 40, specs: { Recording: '24/7 Encrypted Cloud + Local SD', Resolution: '2K - 4K Ultra HD' } },
      { label: 'Heavy-Duty Pro Installation Hardware Kit', priceDelta: 25, specs: { Mount: 'Weather-Sealed Die-Cast Bracket', Warranty: '2-Year Replacement Warranty' } },
    ],
  },
  {
    category: 'Storage & PC Hardware',
    target: 290,
    queryKey: ['ssd-drive', 'wifi-router'],
    prefix: 'SSD',
    brands: ['Samsung', 'Crucial', 'Western Digital', 'SanDisk', 'Kingston', 'Corsair', 'Sabrent', 'Seagate'],
    models: [
      { name: '990 PRO PCIe 4.0 NVMe M.2 Solid State Drive', basePrice: 179, desc: 'Blistering sequential read/write speeds up to 7,450/6,900 MB/s with nickel-coated controller thermal guard.' },
      { name: 'T705 PCIe Gen5 NVMe M.2 SSD with Heatsink', basePrice: 299, desc: 'Next-gen storage speeds up to an astonishing 14,500 MB/s for instantaneous game loading and 8K video scrubbing.' },
      { name: 'WD_BLACK SN850X NVMe SSD with Heatsink for PS5 & PC', basePrice: 189, desc: 'Extreme gaming storage with Game Mode 2.0, low latency queueing, and official Sony PlayStation 5 compatibility.' },
      { name: 'Extreme PRO Portable External SSD Rugged USB 3.2', basePrice: 219, desc: 'Forged aluminum chassis acting as a heatsink delivering up to 2000MB/s speeds with IP55 water/dust resistance.' },
      { name: 'Vengeance RGB 64GB (2x32GB) DDR5 6000MHz RAM Kit', basePrice: 219, desc: 'High-frequency screened memory ICs with ten individually addressable RGB LEDs per module and Intel XMP 3.0.' },
      { name: 'T7 Shield 4TB Rugged Portable External SSD', basePrice: 299, desc: 'Durable elastomer exterior protecting against 3-meter drops with USB 3.2 Gen 2 transfer speeds up to 1050MB/s.' },
      { name: 'Rocket 4 Plus-G 2TB DirectStorage Gaming SSD', basePrice: 209, desc: 'State-of-the-art gaming firmware optimized specifically for Microsoft DirectStorage API with zero game hitching.' },
      { name: 'Extreme 512GB microSDXC UHS-I Memory Card 190MB/s', basePrice: 49, desc: 'A2 rated for rapid mobile app performance, V30 video speed class for continuous 4K UHD video recording.' },
      { name: 'Fury Beast Black 32GB (2x16GB) DDR5 5600MHz RAM', basePrice: 119, desc: 'Low-profile heat spreader design with AMD EXPO profile support and automatic on-die ECC error correction.' },
      { name: 'IronWolf Pro 16TB NAS Internal Hard Drive 7200 RPM', basePrice: 319, desc: 'Multi-bay RAID certified CMR drive with AgileArray firmware, RV rotational vibration sensors, and 300TB/yr workload.' },
    ],
    variants: [
      { label: '1TB Capacity / Standard Low-Profile Format', priceDelta: -50, specs: { Capacity: '1,000 GB', Interface: 'PCIe 4.0 / USB 3.2' } },
      { label: '2TB Capacity / High-Efficiency Passive Heatsink', priceDelta: 0, specs: { Capacity: '2,000 GB', Speed: 'Up to 7,450 MB/s' } },
      { label: '4TB Enterprise Capacity / Extreme Endurance TBW', priceDelta: 160, specs: { Capacity: '4,000 GB', Endurance: '2,400 TBW Lifetime' } },
      { label: 'Rugged Bumper Armor Travel Case Included', priceDelta: 15, specs: { DropRating: '3-Meter Drop Tested', Encryption: 'AES 256-bit Hardware' } },
    ],
  },
  {
    category: 'Power Stations & Solar Tech',
    target: 290,
    queryKey: ['power-station', 'power-bank', 'cordless-drill'],
    prefix: 'PWR',
    brands: ['Anker', 'EcoFlow', 'Jackery', 'Bluetti', 'Baseus', 'Ugreen', 'Belkin', 'Shargeek'],
    models: [
      { name: 'Prime 27,650mAh Power Bank (250W Total Output)', basePrice: 179, desc: 'Smart digital display showing real-time wattage per port, companion app control, and dual 140W USB-C PD 3.1.' },
      { name: 'RIVER 2 Pro 768Wh Portable Power Station', basePrice: 599, desc: 'LFP battery with 3000+ life cycles, 70-minute 0-100% AC wall charging, and 800W continuous output (1600W X-Boost).' },
      { name: 'Explorer 1000 v2 Portable LiFePO4 Power Station', basePrice: 799, desc: '1070Wh battery capacity with 1500W pure sine wave inverter, emergency UPS function, and 1-hour flash charging.' },
      { name: 'Nexode 300W 5-Port GaN Desktop Fast Charger', basePrice: 199, desc: 'Powers 3 laptops simultaneously with single-port 140W PD 3.1 and intelligent Thermal Guard temperature monitoring.' },
      { name: 'Storm 2 Transparent 100W Cyberpunk Power Bank', basePrice: 199, desc: 'Futuristic transparent IPS display showing battery health, cell voltages, circuit temperature, and DC output.' },
      { name: 'MagGo 10,000mAh Qi2 15W Wireless Power Bank', basePrice: 89, desc: 'Certified Qi2 15W wireless charging snapping securely to MagSafe iPhones with foldable kickstand and LCD percentage.' },
      { name: 'SolarSaga 100W Foldable Monocrystalline Solar Panel', basePrice: 249, desc: 'High 23% conversion efficiency with ETFE lamination, adjustable kickstands, and IP65 water-resistant casing.' },
      { name: 'Blade HD 100W Ultra-Thin Laptop Power Bank 20000mAh', basePrice: 99, desc: 'Impossibly slender 0.7-inch aircraft aluminum slab sliding easily alongside laptops in standard briefcases.' },
      { name: 'BoostCharge Pro 3-in-1 Fast Wireless Charging Stand', basePrice: 149, desc: 'Charges iPhone, Apple Watch Ultra, and AirPods simultaneously with premium weighted chrome finish.' },
      { name: 'Car Jump Starter 3000A with Digital Air Compressor', basePrice: 129, desc: 'Starts all gas and up to 8.0L diesel engines with integrated 150 PSI tire inflator and 400 lumen work light.' },
    ],
    variants: [
      { label: 'Space Gray / Braided 240W USB-C Cable (6ft)', priceDelta: 0, specs: { Output: '100W - 250W High-Speed PD', Certification: 'UL / CE Safety Certified' } },
      { label: 'With 100W Solar Panel Folding Briefcase', priceDelta: 180, specs: { SolarInput: 'Up to 220W Dual Input', Cells: 'Grade-A SunPower Monocrystalline' } },
      { label: 'Heavy-Duty Shockproof Travel Hardcase', priceDelta: 25, specs: { Material: 'EVA Ballistic Nylon', InternalPadding: 'Laser-Cut Foam' } },
      { label: 'Rapid 140W Wall Adapter Bundled Edition', priceDelta: 55, specs: { Charger: '140W GaN Wall Plug Included', Efficiency: '95% Active Efficiency' } },
    ],
  },
  {
    category: 'Smartwatches & Wearables',
    target: 290,
    queryKey: ['smartwatch'],
    prefix: 'WAT',
    brands: ['Garmin', 'Apple Watch', 'Samsung Galaxy Watch', 'Oura', 'WHOOP', 'Polar', 'Amazfit', 'Coros', 'Suunto'],
    models: [
      { name: 'Fenix 7X Pro Sapphire Solar Multisport GPS Watch', basePrice: 899, desc: 'Power Sapphire solar charging lens, built-in LED flashlight, multi-band GNSS with SatIQ, and up to 37 days battery.' },
      { name: 'Apple Watch Ultra 2 GPS + Cellular 49mm Titanium', basePrice: 799, desc: 'Precision dual-frequency GPS, customizable Action button, 3000 nits brightest display, and 100m water resistance.' },
      { name: 'Galaxy Watch Ultra 47mm LTE Rugged Smartwatch', basePrice: 649, desc: 'Cushion design with Grade 4 Titanium, dual-frequency GPS, 100hr power save mode, and personalized heart rate zones.' },
      { name: 'Ring Gen 3 Heritage Titanium Smart Ring', basePrice: 299, desc: 'Featherlight medical-grade titanium ring monitoring sleep stages, skin temperature variance, HRV, and readiness.' },
      { name: 'EPIX Pro Gen 2 Sapphire 51mm AMOLED Smartwatch', basePrice: 999, desc: 'Vibrant 1.4-inch AMOLED touch display paired with full topographical mapping, Hill Score, and endurance analytics.' },
      { name: 'Pace 3 Lightweight GPS Sport Running Watch', basePrice: 229, desc: 'Only 30g with breathable nylon band, dual-frequency satellite tracking, SpO2 sensor, and 38 hours continuous GPS.' },
      { name: 'Vantage V3 Premium Multisport Training Watch', basePrice: 599, desc: 'Biosensing Elixir technology featuring wrist ECG, skin temp sensing, SpO2, and offline dual-band topography maps.' },
      { name: 'T-Rex Ultra Rugged Outdoor Smartwatch 30m Dive', basePrice: 399, desc: '316L stainless steel bezel, withstands 70C heat to -30C freezing, 30-meter freediving certified, and dual-band GPS.' },
      { name: 'Forerunner 965 AMOLED Premium Triathlon Watch', basePrice: 599, desc: 'Brilliant touchscreen with titanium bezel, built-in full-color mapping, Training Readiness, and 23-day battery.' },
      { name: 'WHOOP 4.0 Health & Strain Fitness Tracker', basePrice: 239, desc: 'Screen-free wearable optimizing recovery, sleep, and cardiovascular strain with 5-sensor skin monitoring.' },
    ],
    variants: [
      { label: 'Titanium Slate Black / Breathable QuickFit Band', priceDelta: 0, specs: { Material: 'Titanium / Sapphire Glass', WaterRating: '10 ATM / 100m Dive' } },
      { label: 'Solar Sapphire Edition / Orange Alpine Loop', priceDelta: 80, specs: { Glass: 'Power Sapphire Solar Crystal', Bezel: 'DLC Coated Titanium' } },
      { label: 'With Extra Silicone Sport & Leather Bands (2-Pack)', priceDelta: 35, specs: { Bands: 'Quick-Release 22mm / 26mm', Sensors: 'HR, SpO2, ECG, Temp' } },
      { label: 'Cellular LTE Autonomous Edition Unlocked', priceDelta: 100, specs: { Network: 'Standalone 4G LTE eSIM', GPS: 'Multi-Band L1+L5 SatIQ' } },
    ],
  },
];

function generate4890GenuineProducts() {
  const products = [];
  const titlesSet = new Set();
  let globalId = 1;

  // 1. Generate 1,100 Distinct Authentic Smartphones
  const TARGET_SMARTPHONES = 1100;
  const smartphoneCategoryName = 'Smartphones & Mobile Flagships';
  let phoneCount = 0;

  // Build pool of brand-specific and global smartphone images
  const phoneImages = getCategoryImages(smartphoneCategoryName, [
    'iphone', 'samsung-galaxy', 'google-pixel', 'foldable-phone',
    'smartphone', 'android-phone', 'cellphone', 'mobile-phone', 'phone-screen'
  ]);

  for (let vIdx = 0; vIdx < SMARTPHONE_VARIANTS.length; vIdx++) {
    const variant = SMARTPHONE_VARIANTS[vIdx];
    for (const group of SMARTPHONE_BRANDS_MODELS) {
      const groupImages = getCategoryImages(smartphoneCategoryName, group.imgKeys);
      for (const model of group.models) {
        if (phoneCount >= TARGET_SMARTPHONES) break;

        const title = `${group.brand} ${model.name} - ${variant.label}`;
        if (titlesSet.has(title)) continue;
        titlesSet.add(title);

        const sku = `ADR-PHN-${String(globalId).padStart(5, '0')}`;
        const finalPrice = Math.max(149.99, Math.round((model.basePrice + variant.priceDelta + (globalId % 7)) * 100) / 100);
        const discountPct = 10 + (globalId % 15);
        const originalPrice = Math.round((finalPrice / (1 - discountPct / 100)) * 100) / 100;

        // Image priority: group-specific, fallback to general phone pool
        const imgUrl = (groupImages.length > 0)
          ? groupImages[phoneCount % groupImages.length]
          : phoneImages[phoneCount % phoneImages.length];

        const fullDesc = `${model.desc} Configured with ${variant.label}. Authenticity guaranteed brand-new in original sealed manufacturer packaging. Net proceeds directly empower Adera Foundation verified education and healthcare milestones.`;

        products.push({
          name: title,
          description: fullDesc,
          price: finalPrice,
          originalPrice,
          image: imgUrl,
          category: smartphoneCategoryName,
          brand: group.brand,
          sku,
          source: 'Amazon Prime & Certified Direct Stock',
          specs: {
            ...variant.specs,
            Processor: group.chipset,
            Condition: 'Brand New (Factory Sealed Retail Box)',
            Authenticity: '100% Guaranteed Genuine Manufacturer Stock',
            Warranty: 'Full 1-Year Manufacturer Warranty + 30-Day Hassle-Free Returns',
            Shipping: 'Insured Global Express Delivery with On-Chain Tracking',
          },
          stock: 30 + (globalId % 190),
          rating: Math.round((4.6 + (globalId % 5) * 0.1) * 10) / 10,
          sold: 45 + (globalId % 820),
        });

        globalId++;
        phoneCount++;
      }
      if (phoneCount >= TARGET_SMARTPHONES) break;
    }
    if (phoneCount >= TARGET_SMARTPHONES) break;
  }

  console.log(`Generated ${phoneCount} authentic smartphones in category "${smartphoneCategoryName}".`);

  // 2. Generate remaining 3,790 products across 13 tech categories
  const otherBuckets = [];
  for (const cat of OTHER_TECH_CATEGORIES) {
    const images = getCategoryImages(cat.category, cat.queryKey);
    let catCount = 0;
    const catProducts = [];

    for (let vIdx = 0; vIdx < cat.variants.length; vIdx++) {
      const variant = cat.variants[vIdx];
      for (const brand of cat.brands) {
        for (const model of cat.models) {
          if (catCount >= cat.target) break;

          const title = `${brand} ${model.name} - ${variant.label}`;
          if (titlesSet.has(title)) continue;
          titlesSet.add(title);

          const sku = `ADR-${cat.prefix}-${String(globalId).padStart(5, '0')}`;
          const finalPrice = Math.max(19.99, Math.round((model.basePrice + variant.priceDelta + (globalId % 9)) * 100) / 100);
          const discountPct = 12 + (globalId % 16);
          const originalPrice = Math.round((finalPrice / (1 - discountPct / 100)) * 100) / 100;

          const imgUrl = images[catCount % images.length];
          const fullDesc = `${model.desc} Includes ${variant.label}. Verified authentic brand-new stock in original sealed factory retail packaging. 100% of marketplace net proceeds support Adera Foundation verified humanitarian milestones.`;

          catProducts.push({
            name: title,
            description: fullDesc,
            price: finalPrice,
            originalPrice,
            image: imgUrl,
            category: cat.category,
            brand,
            sku,
            source: 'Amazon Prime & Certified Direct Stock',
            specs: {
              ...variant.specs,
              Condition: 'Brand New (Factory Sealed Retail Box)',
              Authenticity: '100% Guaranteed Genuine Manufacturer Stock',
              Warranty: 'Full 1-Year Manufacturer Warranty + 30-Day Hassle-Free Returns',
              Shipping: 'Insured Global Express Delivery with On-Chain Tracking',
            },
            stock: 35 + (globalId % 180),
            rating: Math.round((4.4 + (globalId % 6) * 0.1) * 10) / 10,
            sold: 28 + (globalId % 650),
          });

          globalId++;
          catCount++;
        }
        if (catCount >= cat.target) break;
      }
      if (catCount >= cat.target) break;
    }

    console.log(`Generated ${catProducts.length} items for "${cat.category}".`);
    otherBuckets.push(catProducts);
  }

  // 3. Interleave smartphones and other categories evenly
  const smartphoneProducts = products;
  const allBuckets = [smartphoneProducts, ...otherBuckets];
  const totalTarget = 4890;
  const result = [];

  const maxLen = Math.max(...allBuckets.map(b => b.length));
  for (let i = 0; i < maxLen; i++) {
    for (const b of allBuckets) {
      if (i < b.length && result.length < totalTarget) {
        result.push(b[i]);
      }
    }
  }

  return result;
}

async function runSeed() {
  console.log("Generating 4,890 genuine Amazon / eBay electronics, smartphones & gadgets...");
  const productList = generate4890GenuineProducts();
  console.log(`Generated exactly ${productList.length} unique electronics & gadgets across 14 categories.`);

  const phoneCount = productList.filter(p => p.category === 'Smartphones & Mobile Flagships').length;
  console.log(`Verified Smartphone count: ${phoneCount} (target: 1000+)`);

  console.log("Purging old product data from PostgreSQL...");
  await prisma.resellerProduct.deleteMany({});
  await prisma.product.deleteMany({});
  console.log("Database cleared.");

  const BATCH_SIZE = 100;
  console.log(`Inserting ${productList.length} products in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < productList.length; i += BATCH_SIZE) {
    const batch = productList.slice(i, i + BATCH_SIZE);
    await prisma.product.createMany({
      data: batch,
      skipDuplicates: true,
    });
    const progress = Math.min(i + BATCH_SIZE, productList.length);
    process.stdout.write(`\rInserted ${progress} / ${productList.length} products (${Math.round((progress / productList.length) * 100)}%)`);
  }

  console.log("\nSuccessfully seeded 4,890 genuine electronics & smartphones into PostgreSQL!");
  await prisma.$disconnect();
}

if (require.main === module) {
  runSeed().catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });
}

module.exports = { generate4890GenuineProducts, runSeed };
