"use strict";

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CATEGORY_IMAGES = {
  'Fair-Trade Coffee & Spices': [
    'photo-1514432324607-a09d9b4aefdd', // Coffee beans
    'photo-1495474472287-4d71bcdd2085', // Pour over coffee
    'photo-1511920170033-f8396924c348', // Coffee cup
    'photo-1559056199-641a0ac8b55e', // Coffee bag
    'photo-1509785307050-d4066910ec1e', // Roasted beans
    'photo-1506377247377-2a5b3b417ebb', // Spice bowls
    'photo-1532336414038-cf19250c5757', // Spices & herbs
    'photo-1596040033229-a9821ebd058d', // Pepper and spices
    'photo-1518832553480-cd0e625ed3e6', // Ground spices
    'photo-1544787219-7f47ccb76574', // Tea leaves
  ],
  'Handwoven Textiles & Apparel': [
    'photo-1528459801416-a9e53bbf4e17', // Woven fabric
    'photo-1606744888344-493238955de0', // Linen textiles
    'photo-1544816155-12df9643f363', // Knitted artisan throw
    'photo-1576995853123-5a10305d93c0', // Cotton apparel
    'photo-1556905055-8f358a7a47b2', // Canvas bag
    'photo-1584917865442-de89df76afd3', // Artisan bag
    'photo-1503342217505-b0a15ec3261c', // Hooded sweater
    'photo-1489987707025-afc232f7ea0f', // Linen shirt
    'photo-1523381210434-271e8be1f52b', // Cotton scarf
    'photo-1607344645866-009c320b5ab8', // Wool scarf
  ],
  'Artisan Pottery & Woodcraft': [
    'photo-1578749556568-bc2c40e68b61', // Pottery vase
    'photo-1565193566173-7a0ee3dbe261', // Ceramic bowl
    'photo-1610701596007-11502861dcfa', // Ceramic jug
    'photo-1590736969955-71cc94801759', // Wooden bowl
    'photo-1513519245088-0e12902e5a38', // Artisan crafts
    'photo-1584589167171-541ce45f1eea', // Clay tableware
    'photo-1596178065887-1198b6148b2b', // Olive wood spoon
    'photo-1582738411706-bfc8e691d1c2', // Woven basket
    'photo-1586023492125-27b2c045efd7', // Handcrafted decor
    'photo-1544816155-12df9643f363', // Clay mug
  ],
  'Solar & Clean Energy Gear': [
    'photo-1509391365360-2e959784a276', // Solar panels
    'photo-1508873696983-2df5703bc30f', // Portable lantern
    'photo-1609091839311-d5365f9ff1c5', // Tech power bank
    'photo-1544716278-ca5e3f4abd8c', // Emergency radio
    'photo-1518770660439-4636190af475', // Solar gadget
    'photo-1581092160607-ee22621dd758', // Portable energy
    'photo-1558618666-fcd25c85cd64', // Battery pack
    'photo-1622445262464-84b1b0722dd2', // Solar charger
    'photo-1583863788434-e58a36330cf0', // Clean energy
    'photo-1513694203232-719a280e022f', // Work light
  ],
  'Water Purification & Filters': [
    'photo-1548839140-29a749e1bc4e', // Clear water drop
    'photo-1523362628745-0c100150b504', // Water glass
    'photo-1584308666744-24d5c474f2ae', // Purifier filter
    'photo-1500382017468-9049fed747ef', // Clean spring water
    'photo-1527061011665-3652c757a4d4', // Pure filtration
    'photo-1541888946425-d0fbb186156f', // Water system
    'photo-1563245372-f21724e3856d', // Safe hydration
    'photo-1583454110551-21f2fa2afe61', // Water flask
    'photo-1517649763962-0c623266ddc0', // Clean stream
    'photo-1510312305653-8ed496efae75', // Field water gear
  ],
  'Sustainable Farming & Seeds': [
    'photo-1523348837708-15d4a09cfac2', // Green sprout
    'photo-1592417817098-8f3d69109853', // Organic seeds
    'photo-1585320806297-9794b3e4eeae', // Seedlings
    'photo-1574943320219-553eb213f72d', // Vegetable garden
    'photo-1464226184884-fa280b87c399', // Rich soil
    'photo-1591857177580-dc82b9ac4e1e', // Farming tools
    'photo-1500651230702-0e2d8a49d4ad', // Agricultural field
    'photo-1530836369250-ef72a3f5cda8', // Organic produce
    'photo-1492496913980-501348b61469', // Grain harvest
    'photo-1500937386664-56d1dfef3854', // Sustainable land
  ],
  'Emergency Relief & First Aid': [
    'photo-1603398938378-e54eab446dde', // First aid kit
    'photo-1584744982491-665216d95f8b', // Medical pouch
    'photo-1584017911766-d451b3d0e843', // Relief supplies
    'photo-1516549655169-df83a0774514', // Emergency triage
    'photo-1576091160399-112ba8d25d1d', // Health gear
    'photo-1584515979956-d9f6e5d09982', // Sterile bandages
    'photo-1532938911079-1b06ac7ceec7', // Trauma pack
    'photo-1584515933487-779824d29309', // Survival kit
    'photo-1583947215259-38e31be8751f', // Emergency pouch
    'photo-1584308666744-24d5c474f2ae', // Field medical
  ],
  'Natural Wellness & Botanicals': [
    'photo-1584308666744-24d5c474f2ae', // Apothecary oil
    'photo-1608571423902-eed4a5ad8108', // Natural soap
    'photo-1556228720-195a672e8a03', // Shea butter jar
    'photo-1546554137-f86b9593a222', // Honey jar
    'photo-1512290903422-ea4253977577', // Essential oils
    'photo-1570172619644-dfd03ed5d881', // Botanical skincare
    'photo-1598440947619-2c35fc9aa908', // Herbal extract
    'photo-1617897903246-719242758050', // Organic balm
    'photo-1519735777090-ec97164dc2a0', // Pure beeswax
    'photo-1540420773420-3366772f4999', // Natural remedies
  ],
};

// Generates 3,000 distinct, non-repeating, mission-aligned products
function generate3000RealisticProducts() {
  const products = [];
  const titlesSet = new Set();

  const categories = [
    {
      name: 'Fair-Trade Coffee & Spices',
      prefix: 'ADR-COF',
      regions: ['Yirgacheffe', 'Guji', 'Sidama', 'Harar', 'Limu', 'Jimma', 'Kaffa Rainforest', 'Bench Maji', 'Kochere', 'Aricha'],
      artisanTypes: ['Oromia Smallholder Co-op', 'Highland Women Farmers Alliance', 'Heritage Forest Collective', 'Direct Fair-Trade Guild'],
      items: [
        { type: 'Single-Origin Arabica Beans', desc: 'Hand-picked Grade 1 high-altitude coffee with floral jasmine notes and vibrant citrus sweetness.', basePrice: 18.5 },
        { type: 'Natural Sun-Dried Micro-Lot Coffee', desc: 'Slow-cured on raised African drying beds. Rich blueberry, cocoa nibs, and silky brown sugar finish.', basePrice: 22.0 },
        { type: 'Honey Washed Espresso Roast', desc: 'Meticulously pulped leaving mucilage intact for candied stone-fruit and caramel crema complexity.', basePrice: 19.5 },
        { type: 'Organic Whole Bean Reserve', desc: 'Grown under native shade canopies preserving migratory bird sanctuaries. Notes of black tea and peach.', basePrice: 24.0 },
        { type: 'Heritage Berbere Spice Blend', desc: 'Traditional sun-dried red chili blend stone-ground with korarima, garlic, ginger, and rue seed.', basePrice: 13.5 },
        { type: 'Wild Korarima Black Cardamom', desc: 'Wild-harvested forest pods with smoky menthol, warm pine, and nutmeg aromatics.', basePrice: 16.0 },
        { type: 'Single-Estate Green Cardamom Pods', desc: 'Whole plump green pods dried in low-heat solar dryers to seal fragrant essential oils.', basePrice: 15.0 },
        { type: 'Artisan Chai Spice Blend', desc: 'Crushed highland ginger, cinnamon bark, cloves, and black pepper for warming restorative brew.', basePrice: 12.5 },
        { type: 'Cold-Brew Coarse Ground Coffee', desc: 'Optimized nitrogen-flushed coarse grind for smooth, low-acid, velvety iced coffee extraction.', basePrice: 17.5 },
        { type: 'Decaf Mountain Water Process Coffee', desc: '100% chemical-free mountain water decaffeination retaining sweet molasses and toasted almond notes.', basePrice: 21.0 },
      ],
      modifiers: [
        { label: '250g Craft Valve Pouch', mult: 1.0 },
        { label: '500g Resealable Tin', mult: 1.8 },
        { label: '1kg Cooperative Bulk Bag', mult: 3.2 },
        { label: 'Sampler Gift Trio (3x100g)', mult: 1.4 },
        { label: 'Limited Harvest Cask Aged', mult: 1.6 },
      ],
    },
    {
      name: 'Handwoven Textiles & Apparel',
      prefix: 'ADR-TEX',
      regions: [
        'Addis Ababa Artisan Guild', 'Dorze Weaving Cooperative', 'Chencha Highland Studio',
        'Tibeb Heritage Loom', 'Rift Valley Eco-Textiles', 'Harari Traditional Weavers',
        'Gondar Embroidery Circle', 'Hawassa Cotton Collective', 'Tigray Highland Wool Studio',
        'Arba Minch Loom Cooperative'
      ],
      artisanTypes: ['Traditional Women Weavers', 'Hand-Spun Cotton Collective', 'Fair-Trade Highland Crafters', 'Village Loom Cooperative'],
      items: [
        { type: 'Handwoven Shemma Cotton Scarf', desc: 'Featherlight unbleached organic cotton woven on traditional pit looms with subtle geometric tibeb borders.', basePrice: 32.0 },
        { type: 'Highland Hand-Spun Wool Blanket', desc: 'Heavyweight organic mountain sheep wool spun on drop spindles for exceptional winter insulation.', basePrice: 85.0 },
        { type: 'Organic Cotton Fair-Trade Hoodie', desc: 'Heavyweight 400 GSM brushed organic fleece featuring embroidered direct-aid community emblem.', basePrice: 68.0 },
        { type: 'Habesha Kemis Embroidered Tunic', desc: 'Elegant traditional silhouette with hand-embroidered neckline celebrating centuries of textile heritage.', basePrice: 75.0 },
        { type: 'Indigo Dip-Dyed Cotton Wrap', desc: 'Dyed using natural plant-derived wild indigo vats with intentional ombre gradient and fringed hem.', basePrice: 44.0 },
        { type: 'Artisan Heavy Canvas Market Tote', desc: 'Reinforced saddle-stitched 16oz cotton duck canvas with genuine full-grain vegetable tanned handles.', basePrice: 28.0 },
        { type: 'Traditional Gabi 4-Layer Throw', desc: 'Four ultra-fine gauze layers stitched together creating cloud-like thermal comfort and breathable drape.', basePrice: 62.0 },
        { type: 'Handwoven Table Runner', desc: 'Textured natural ecru warp with rich earthy ochre and terracotta geometric inlay.', basePrice: 36.0 },
        { type: 'Loomed Linen Kitchen Apron', desc: 'Durable cross-back linen-cotton blend with deep utility pockets built for rugged kitchen and studio use.', basePrice: 34.0 },
        { type: 'Hand-Loomed Cushion Cover', desc: 'Thick slub-cotton weave with hidden brass zipper and textured rustic fringe detailing.', basePrice: 26.0 },
      ],
      modifiers: [
        { label: 'Standard Edition', mult: 1.0 },
        { label: 'Natural Ecru & Slate Trim', mult: 1.15 },
        { label: 'Indigo Dipped Heritage', mult: 1.25 },
        { label: 'Terracotta Earth Dye', mult: 1.2 },
        { label: 'Master Weaver Signature Series', mult: 1.45 },
      ],
    },
    {
      name: 'Artisan Pottery & Woodcraft',
      prefix: 'ADR-ART',
      regions: [
        'Wollo Clay Guild', 'Jimma Woodturning Atelier', 'Harar Basketry Circle',
        'Ambo Stoneware Studio', 'Bishoftu Kilns', 'Entoto Pottery Center',
        'Awassa Handcrafted Stoneware', 'Bahir Dar Woodcraft', 'Dire Dawa Ceramic Guild',
        'Bale Mountain Woodworkers'
      ],
      artisanTypes: ['Master Clay Sculptors', 'Sustainable Olive Wood Guild', 'Highland Bamboo Artisans', 'Terracotta Heritage Cooperative'],
      items: [
        { type: 'Handmade Clay Jebena Coffee Brewer', desc: 'Traditional spherical black clay vessel burnished with smooth river stones and pit-fired for rich coffee brewing.', basePrice: 38.0 },
        { type: 'Carved Olive Wood Serving Bowl', desc: 'Hand-carved from rescued fallen olive trees showcasing breathtaking grain swirls and natural oil durability.', basePrice: 48.0 },
        { type: 'Olive Wood Salad Server Set', desc: 'Pair of matched hand-shaped ergonomic salad tossing spoons treated with food-grade pure beeswax.', basePrice: 24.0 },
        { type: 'Woven Raffia & Bamboo Bread Basket', desc: 'Coiled natural sweetgrass and bamboo dyed with native bark extracts for tabletop storage.', basePrice: 22.0 },
        { type: 'Terracotta Fermentation & Water Vessel', desc: 'Porous unglazed natural earthenware promoting evaporative cooling and traditional storage.', basePrice: 35.0 },
        { type: 'Hand-Turned Wanza Wood Mug', desc: 'Carved from single block of dense Cordia wood with comfortable ear handle and natural sealant.', basePrice: 21.0 },
        { type: 'Soapstone Essential Oil Burner', desc: 'Solid hand-chiseled soapstone tea-light diffuser with intricate openwork ventilation.', basePrice: 27.0 },
        { type: 'Handwoven Grass Serving Platter', desc: 'Durable coiled basketry platter suitable for injera, fresh fruit, or wall art installation.', basePrice: 30.0 },
        { type: 'Carved Acacia Wood Cutting Board', desc: 'Reversible end-grain butcher block with deep juice groove and brass hanging loop.', basePrice: 42.0 },
        { type: 'Glazed Ceramic Coffee Cup Set (Pair)', desc: 'Wheel-thrown speckled stoneware with satin glaze inside and raw clay textured exterior.', basePrice: 29.0 },
      ],
      modifiers: [
        { label: 'Classic Pit-Fired Finish', mult: 1.0 },
        { label: 'Burnished Ebony Treatment', mult: 1.2 },
        { label: 'Natural Beeswax Polish', mult: 1.15 },
        { label: 'Large Family Centerpiece', mult: 1.4 },
        { label: 'Collector Edition Boxed', mult: 1.35 },
      ],
    },
    {
      name: 'Solar & Clean Energy Gear',
      prefix: 'ADR-SLR',
      regions: [
        'Rift Valley Solar Initiative', 'Off-Grid African Technology Hub', 'Green Power Cooperative',
        'Solaris Impact Labs', 'Oromia Clean Energy Station', 'Highland Solar Systems',
        'Danakil Renewable Energy Project', 'Dire Dawa Eco Power Unit', 'Addis Clean Tech Lab',
        'Blue Nile Sustainable Energy'
      ],
      artisanTypes: ['Clean Energy Social Enterprise', 'Certified Renewable Engineers', 'Humanitarian Hardware Lab'],
      items: [
        { type: 'Portable Solar Lantern (250 Lumens)', desc: 'Shatterproof frosted diffuser with 4 lighting modes, USB phone charging port, and built-in handle.', basePrice: 28.0 },
        { type: '40W Foldable ETFE Solar Panel', desc: 'High-conversion monocrystalline cells in rugged water-resistant canvas fold with dual USB-C PD outputs.', basePrice: 89.0 },
        { type: 'Hand-Crank Emergency Weather Radio', desc: 'AM/FM/NOAA broadcast receiver powered by solar, dynamo hand crank, or 4000mAh internal battery.', basePrice: 38.0 },
        { type: '20,000mAh Rugged Solar Power Bank', desc: 'Shockproof IP67 power station with integrated wireless charging pad and 18-LED emergency torch.', basePrice: 45.0 },
        { type: 'Off-Grid Solar Home Lighting Kit', desc: 'Includes 15W rooftop panel, central battery hub, and 3 daisy-chainable overhead LED bulbs with wall switches.', basePrice: 125.0 },
        { type: 'Rechargeable Solar Desk & Tent Fan', desc: 'Whisper-quiet brushless motor with 3 speeds, built-in ambient reading light, and hanging carabiner hook.', basePrice: 34.0 },
        { type: 'Solar Thermal Water Heating Coil', desc: 'High-efficiency black anodized heat exchanger designed for zero-emission outdoor sanitation.', basePrice: 65.0 },
        { type: 'Compact 10W Backpack Solar Charger', desc: 'Ultralight dual-panel charger that clips onto backpacks for charging electronics on the move.', basePrice: 36.0 },
        { type: 'Solar Rechargeable Headlamp (500LM)', desc: 'Dual-beam flood and spot lighting with tilt adjustment and micro-solar backing plate.', basePrice: 26.0 },
        { type: 'DC Solar Water Pump Controller Kit', desc: 'Brushless submersible pump controller for low-power garden drip irrigation and livestock wells.', basePrice: 110.0 },
      ],
      modifiers: [
        { label: 'Gen-2 High-Output', mult: 1.0 },
        { label: 'Heavy-Duty Field Spec', mult: 1.3 },
        { label: 'Ultra-Compact Travel Edition', mult: 0.9 },
        { label: 'Extended Battery Capacity Pack', mult: 1.4 },
        { label: 'Reinforced Weatherproof Armor', mult: 1.2 },
      ],
    },
    {
      name: 'Water Purification & Filters',
      prefix: 'ADR-WTR',
      regions: [
        'Blue Nile Safe Water Project', 'Highland Spring Defense', 'Clean Well Engineering Hub',
        'Pureflow Humanitarian Labs', 'Awash River Filtration Unit', 'Lake Tana Pureflow Station',
        'Rift Aquifer Initiative', 'Omo Valley Safe Water', 'Dire Dawa Water Purification Lab',
        'Somali Region Borehole Program'
      ],
      artisanTypes: ['Safe Water Social Initiative', 'Hydrological Relief Cooperative', 'Field Sanitation Engineers'],
      items: [
        { type: 'Gravity-Fed Ceramic Water Purifier (10L)', desc: 'Dual-container stainless steel gravity system with silver-impregnated 0.2 micron ceramic filters.', basePrice: 78.0 },
        { type: 'Emergency Survival Membrane Filter Straw', desc: 'Direct-sip hollow fiber filter eliminating 99.9999% of waterborne bacteria, parasites, and microplastics.', basePrice: 19.5 },
        { type: '20L Heavy-Duty Water Storage Bladder', desc: 'Food-grade BPA-free collapsible container with high-flow spigot and reinforced carrying straps.', basePrice: 24.0 },
        { type: 'Activated Coconut Carbon Filter Core', desc: 'Universal replacement cartridge reducing heavy metals, chlorine, volatile organics, and unpleasant odor.', basePrice: 16.0 },
        { type: 'Solar UV Water Disinfection Flask', desc: 'Stainless steel vacuum bottle with integrated 275nm UV-C LED cap for 90-second on-demand sterilization.', basePrice: 49.0 },
        { type: 'Backpacking Siphon Water Filter', desc: 'Lightweight squeeze-pump kit delivering 1.5 liters per minute of purified drinking water.', basePrice: 34.0 },
        { type: 'Fast-Acting Water Purification Tablets (100pk)', desc: 'Effervescent chlorine dioxide tablets treating up to 200 liters of contaminated emergency water.', basePrice: 14.0 },
        { type: 'Wellbore Sediment Pre-Filter Housing', desc: 'Washable 50-micron stainless steel mesh screen preventing silt intrusion into community filtration pumps.', basePrice: 39.0 },
        { type: 'Field TDS & Water Purity Digital Tester', desc: 'Precision digital meter for measuring total dissolved solids and verification of filtration performance.', basePrice: 18.0 },
        { type: 'Community Gravity Filter Station (25L)', desc: 'High-capacity dual ceramic and carbon core station providing daily clean water for schools and clinics.', basePrice: 115.0 },
      ],
      modifiers: [
        { label: 'Standard Single Unit', mult: 1.0 },
        { label: 'Double Replacement Cartridge Bundle', mult: 1.35 },
        { label: 'Expedition Survival Grade', mult: 1.25 },
        { label: 'Community Clinic Edition', mult: 1.6 },
        { label: 'Backpack Ultralight Kit', mult: 0.95 },
      ],
    },
    {
      name: 'Sustainable Farming & Seeds',
      prefix: 'ADR-AGR',
      regions: [
        'Bale Mountains Seed Sanctuary', 'Rift Valley Permaculture Institute', 'Highland Agronomy Cooperative',
        'Dryland Resilient Farm Project', 'Hararghe Heirloom Seed Guild', 'Wolaita Agroecology Center',
        'Sidama Organic Seed Bank', 'Gojjam Grain Growers Collective', 'Jimma Agroforestry Station',
        'Debre Zeit Agricultural Alliance'
      ],
      artisanTypes: ['Heirloom Seed Keepers Guild', 'Organic Smallholder Agronomists', 'Permaculture Seed Bank'],
      items: [
        { type: 'Heirloom Drought-Resistant Teff Seed (1kg)', desc: 'Ancestral gluten-free grain seeds bred over millennia for low-water resilience and rich mineral density.', basePrice: 18.0 },
        { type: 'Climate-Hardy Vegetable Seed Vault (25pk)', desc: 'Hermetically sealed non-GMO seeds including drought-tolerant kale, Ethiopian mustard, onions, and legumes.', basePrice: 28.0 },
        { type: 'Micro-Drip Irrigation Line Emitter Kit', desc: 'Water-saving low-pressure drip irrigation tubing with 50 adjustable drippers and universal hose adapter.', basePrice: 38.0 },
        { type: 'Digital Soil Moisture & pH Probe', desc: 'Dual-sensor agricultural probe with instant dial readout for conserving irrigation and optimizing soil fertility.', basePrice: 22.0 },
        { type: 'Hand-Forged Carbon Steel Garden Hoe', desc: 'Handcrafted by local blacksmiths using tempered leaf spring steel mounted on solid ash wood handle.', basePrice: 32.0 },
        { type: 'Biodegradable Seedling Starter Pots (50pk)', desc: 'Compressed organic coconut coir and peat cups allowing direct root transplanting without shock.', basePrice: 15.0 },
        { type: 'Cold-Pressed Organic Neem Pest Defense', desc: '100% pure botanical cold-pressed neem concentrate for organic pest deterrent and leaf health.', basePrice: 19.0 },
        { type: 'Nitrogen-Fixing Cover Crop Seed Mix', desc: 'Blend of crimson clover, hairy vetch, and field peas to naturally replenish depleted topsoil nitrogen.', basePrice: 21.0 },
        { type: 'Ergonomic Hand Seeder & Dispenser', desc: 'Adjustable 5-outlet seed dial preventing seed waste during precision vegetable bed sowing.', basePrice: 14.0 },
        { type: 'Burlap Root Aeration Grow Bags (5-Pack)', desc: 'Breathable heavy-duty woven fabric planters preventing root spiraling and increasing harvest yields.', basePrice: 24.0 },
      ],
      modifiers: [
        { label: 'Home Homestead Pack', mult: 1.0 },
        { label: 'Cooperative Farm Bulk Pack', mult: 2.2 },
        { label: 'Hermetic Mylar Seed Storage Tin', mult: 1.3 },
        { label: 'Heritage Preservation Strain', mult: 1.4 },
        { label: 'Starter Garden Kit', mult: 0.9 },
      ],
    },
    {
      name: 'Emergency Relief & First Aid',
      prefix: 'ADR-EMG',
      regions: [
        'Highland Search & Rescue Unit', 'Humanitarian First Response Hub', 'Disaster Resilience Alliance',
        'Field Medical Cooperative', 'Red Sea Relief Contingent', 'Rift Valley Emergency Medical Base',
        'Danakil Triage Outpost', 'Dire Dawa Rapid Response Center', 'Somali Border Emergency Post',
        'Addis Central Medical Supply Depot'
      ],
      artisanTypes: ['Certified Emergency Medical Technicians', 'Disaster Relief Specialists', 'Tactical Field Medics'],
      items: [
        { type: 'Compact IFAK Trauma Kit', desc: 'MOLLE rip-away pouch loaded with compression trauma bandage, chest seal, tourniquet, and sterile gauze.', basePrice: 48.0 },
        { type: '72-Hour Survival Ration & Hydration Pack', desc: 'High-calorie vitamin-fortified emergency nutrition bars and purified vacuum-sealed water pouches.', basePrice: 34.0 },
        { type: 'Thermal Reflective Bivy Survival Bag', desc: 'Reinforced heat-reflective Mylar shelter reflecting 90% of radiated body heat in extreme cold exposure.', basePrice: 18.0 },
        { type: 'Combat Tourniquet with Windlass Rod', desc: 'Single-handed rapid application arterial hemorrhage control device with writeable timestamp strap.', basePrice: 22.0 },
        { type: 'Sterile Burn Dressing & Gel Kit', desc: 'Soothing tea tree hydrogel infused dressings providing immediate thermal relief and infection barrier.', basePrice: 19.5 },
        { type: 'Multi-Tool Heavy-Duty Field Pliers', desc: 'Hardened stainless steel multi-tool with wire cutters, wood saw, serrated blade, and screwdriver bits.', basePrice: 36.0 },
        { type: 'High-Decibel Emergency Survival Whistle & Strobe', desc: '120dB pealess acoustic whistle integrated with water-resistant LED signaling beacon and lanyard.', basePrice: 12.0 },
        { type: 'Splint Roll for Fracture Stabilization', desc: 'Lightweight moldable aluminum-core padded splint adaptable for arm, wrist, or lower leg immobilization.', basePrice: 16.0 },
        { type: 'Waterproof First Aid Dry Bag (10L)', desc: 'Welded-seam 500D PVC roll-top bag keeping sensitive medical and communication gear completely dry.', basePrice: 24.0 },
        { type: 'Emergency Eye Wash & Wound Irrigation Flask', desc: 'Sterile isotonic saline solution with soft ergonomic eyecup for chemical splash and dust flushing.', basePrice: 15.0 },
      ],
      modifiers: [
        { label: 'Standard Field Issue', mult: 1.0 },
        { label: 'Professional Medic Pro Pack', mult: 1.5 },
        { label: 'Vehicle Readiness Kit', mult: 1.2 },
        { label: 'Compact Ultralight Pouch', mult: 0.85 },
        { label: 'Disaster Community Vault Edition', mult: 2.1 },
      ],
    },
    {
      name: 'Natural Wellness & Botanicals',
      prefix: 'ADR-WEL',
      regions: [
        'Kaffa Rainforest Biosphere', 'Bale Botanical Sanctuary', 'Simien Mountain Herbal Guild',
        'Rift Valley Honey Cooperative', 'Yayu Coffee Forest Biosphere', 'Wondo Genet Essential Oils Center',
        'Guji Wild Botanical Reserve', 'Illubabor Honey Producers', 'Sheka Forest Herbal Apothecary',
        'Harar Aromatic Botanicals'
      ],
      artisanTypes: ['Wild Forest Harvesters', 'Traditional Herbal Apothecary', 'Organic Botanical Distillers'],
      items: [
        { type: 'Raw Wild Forest Honey (500g Jar)', desc: 'Unfiltered, unpasteurized honey harvested from traditional tree-hung log hives in untouched cloud forests.', basePrice: 24.0 },
        { type: 'Pure Virgin Shea Butter (250g Tin)', desc: 'Grade-A unrefined cold-pressed botanical butter packed with vitamins A and E for deep cellular hydration.', basePrice: 18.0 },
        { type: 'Cold-Pressed Black Seed Oil (100ml)', desc: '100% pure Nigella Sativa oil containing high thymoquinone concentration for immune and digestive vitality.', basePrice: 22.0 },
        { type: 'Organic Moringa Oleifera Leaf Powder', desc: 'Nutrient-rich sun-dried moringa leaf superfood providing bioavailable plant protein, iron, and antioxidants.', basePrice: 16.0 },
        { type: 'Handmade Goat Milk & Honey Bar Soap', desc: 'Gentle cold-process artisan soap crafted with fresh pasture-raised goat milk, oats, and raw honey.', basePrice: 9.5 },
        { type: 'Wild Frankincense Resin (Boswellia)', desc: 'Pristine tears of natural Boswellia gum resin for calming, meditative incense and natural aromatherapy.', basePrice: 17.0 },
        { type: 'Botanical Essential Oil Roll-On (10ml)', desc: 'Therapeutic blend of eucalyptus, wild mint, and frankincense diluted in organic golden jojoba oil.', basePrice: 14.5 },
        { type: 'Herbal Mountain Calming Tea Infusion', desc: 'Loose-leaf blend of wild chamomile blossoms, lemon verbena, and hibiscus calyces for restful sleep.', basePrice: 13.0 },
        { type: 'Organic Beeswax Skin Salve & Lip Balm', desc: 'Healing balm formulated with pure mountain beeswax, calendula oil, and unrefined cocoa butter.', basePrice: 11.0 },
        { type: 'Dead Sea & Rift Mineral Bath Soak', desc: 'Natural coarse crystalline bath salts enriched with magnesium, potassium, and crushed botanicals.', basePrice: 19.0 },
      ],
      modifiers: [
        { label: 'Small Batch Reserve', mult: 1.0 },
        { label: 'Family Pantry Size', mult: 1.7 },
        { label: 'Artisan Glass Apothecary Jar', mult: 1.25 },
        { label: 'Aromatherapy Gift Collection', mult: 1.4 },
        { label: 'Refill Pouch Eco-Format', mult: 0.9 },
      ],
    },
  ];

  let idCounter = 1;

  // Distribute 3,000 products across 8 categories (~375 products per category)
  for (const cat of categories) {
    const images = CATEGORY_IMAGES[cat.name] || CATEGORY_IMAGES['Fair-Trade Coffee & Spices'];
    let catProductCount = 0;
    const targetPerCat = 375; // 8 * 375 = 3000

    // Combinatorial loops
    for (const region of cat.regions) {
      for (const item of cat.items) {
        for (const mod of cat.modifiers) {
          if (catProductCount >= targetPerCat) break;

          const title = `${region} ${item.type} — ${mod.label}`;
          if (titlesSet.has(title)) continue;
          titlesSet.add(title);

          const sku = `${cat.prefix}-${String(idCounter).padStart(5, '0')}`;
          const finalPrice = Math.round((item.basePrice * mod.mult + (idCounter % 5)) * 100) / 100;
          const originalPrice = Math.round((finalPrice * 1.22) * 100) / 100;
          const imgId = images[idCounter % images.length];
          const imgUrl = `https://images.unsplash.com/${imgId}?auto=format&fit=crop&w=800&q=80`;

          const artisan = cat.artisanTypes[idCounter % cat.artisanTypes.length];
          const fullDesc = `${item.desc} Handcrafted in partnership with ${artisan} in ${region}. 100% of store proceeds fund verified on-ground humanitarian projects.`;

          products.push({
            name: title,
            description: fullDesc,
            price: finalPrice,
            originalPrice,
            image: imgUrl,
            category: cat.name,
            brand: `Adera • ${artisan}`,
            sku,
            source: 'Adera Foundation Direct Trade',
            specs: {
              Origin: region,
              Producer: artisan,
              Grade: mod.label,
              FairTradeVerified: '100% Ethical Sourcing',
              DirectImpactCause: 'Humanitarian & Climate Resilience',
            },
            stock: 45 + (idCounter % 150),
            rating: Math.round((4.6 + (idCounter % 5) * 0.08) * 10) / 10,
            sold: 12 + (idCounter % 280),
          });

          idCounter++;
          catProductCount++;
        }
        if (catProductCount >= targetPerCat) break;
      }
      if (catProductCount >= targetPerCat) break;
    }
  }

  return products;
}

async function runSeed() {
  console.log("Generating 3,000 genuine, non-repeating, mission-aligned products...");
  const productList = generate3000RealisticProducts();
  console.log(`Generated ${productList.length} unique products.`);

  console.log("Clearing outdated generic demo products...");
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

  console.log("\nSuccessfully seeded 3,000 realistic products into PostgreSQL!");
  await prisma.$disconnect();
}

if (require.main === module) {
  runSeed().catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });
}

module.exports = { generate3000RealisticProducts, runSeed };
