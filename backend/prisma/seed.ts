import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { calculateEnvironmentalImpact } from '../src/services/impactCalculator.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting EcoLoop database seeding...');

  // Clean existing tables
  await prisma.impactRecord.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.materialRequest.deleteMany();
  await prisma.savedListing.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.materialListing.deleteMany();
  await prisma.buyerPreference.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('ecoloop123', 10);

  // 1. Create Demo Businesses
  console.log('Creating demo businesses...');

  const sellerUser = await prisma.user.create({
    data: {
      email: 'seller@ecoloop.com',
      password: passwordHash,
      businessName: 'GreenPack Innovations Pvt Ltd',
      contactPerson: 'Amitav Sen',
      phone: '+91 98301 23456',
      city: 'Kolkata',
      address: 'Plot 14, Sector V, Salt Lake, Kolkata, West Bengal',
      category: 'Packaging',
      bio: 'Leading packaging and carton manufacturer with surplus cardboard offcuts and clean packaging waste.',
      isVerified: true,
      preferences: {
        create: {
          preferredCategories: 'Paper/Cardboard,Packaging materials,Wood',
          preferredCities: 'Kolkata,Howrah',
          maxBudget: 50,
          typicalQuantity: 1000,
        },
      },
    },
  });

  const buyerUser = await prisma.user.create({
    data: {
      email: 'buyer@ecoloop.com',
      password: passwordHash,
      businessName: 'Bengal EcoRecycle Solutions',
      contactPerson: 'Rhea Mukherjee',
      phone: '+91 98312 98765',
      city: 'Howrah',
      address: 'Dona Paula Industrial Estate, Howrah, West Bengal',
      category: 'Recycling',
      bio: 'State-of-the-art recycling facility reprocessing plastics, paper pulp, and industrial residues into high-grade pellets.',
      isVerified: true,
      preferences: {
        create: {
          preferredCategories: 'Paper/Cardboard,Plastic,Glass,Industrial scrap',
          preferredCities: 'Howrah,Kolkata,Siliguri',
          maxBudget: 60,
          typicalQuantity: 1500,
        },
      },
    },
  });

  const assamBioUser = await prisma.user.create({
    data: {
      email: 'assam.organics@ecoloop.com',
      password: passwordHash,
      businessName: 'Brahmaputra Organics & Bio-Compost',
      contactPerson: 'Pranjal Barua',
      phone: '+91 94350 45678',
      city: 'Guwahati',
      address: 'VIP Road, Six Mile, Guwahati, Assam',
      category: 'Food & Beverage',
      bio: 'Converting food processing leftovers and spent grains into rich bio-fertilizers and mushroom substrates.',
      isVerified: true,
      preferences: {
        create: {
          preferredCategories: 'Food waste,Wood',
          preferredCities: 'Guwahati,Siliguri',
          maxBudget: 15,
          typicalQuantity: 800,
        },
      },
    },
  });

  const siliguriWoodUser = await prisma.user.create({
    data: {
      email: 'timber@ecoloop.com',
      password: passwordHash,
      businessName: 'Siliguri Reclaimed Timber & Pallets',
      contactPerson: 'Sanjay Roy',
      phone: '+91 97330 11223',
      city: 'Siliguri',
      address: 'Sevoke Road, Mile 2, Siliguri, West Bengal',
      category: 'Manufacturing',
      bio: 'Specialists in pallet recycling, heavy wooden crating reuse, and biomass briquettes.',
      isVerified: true,
      preferences: {
        create: {
          preferredCategories: 'Wood,Packaging materials,Furniture',
          preferredCities: 'Siliguri,Guwahati,Kolkata',
          maxBudget: 350,
          typicalQuantity: 200,
        },
      },
    },
  });

  const kolkataTextilesUser = await prisma.user.create({
    data: {
      email: 'textiles@ecoloop.com',
      password: passwordHash,
      businessName: 'Eastern Textile Mills Ltd',
      contactPerson: 'Deepak Poddar',
      phone: '+91 98305 66778',
      city: 'Kolkata',
      address: 'Taratala Road, Industrial Area, Kolkata, West Bengal',
      category: 'Textiles',
      bio: 'Integrated textile manufacturing unit producing circular cotton yarn and upcycled woven goods.',
      isVerified: true,
      preferences: {
        create: {
          preferredCategories: 'Textile,Packaging materials',
          preferredCities: 'Kolkata,Howrah',
          maxBudget: 40,
          typicalQuantity: 2000,
        },
      },
    },
  });

  const howrahMetalUser = await prisma.user.create({
    data: {
      email: 'metals@ecoloop.com',
      password: passwordHash,
      businessName: 'Howrah Alloy & Scrap Recyclers',
      contactPerson: 'Subhashish Ghosh',
      phone: '+91 98311 55443',
      city: 'Howrah',
      address: 'Jalan Industrial Complex, NH6, Howrah, West Bengal',
      category: 'Manufacturing',
      bio: 'Foundry-grade scrap processing and induction furnace supply specialists.',
      isVerified: true,
      preferences: {
        create: {
          preferredCategories: 'Metal,Industrial scrap,Construction materials',
          preferredCities: 'Howrah,Kolkata',
          maxBudget: 150,
          typicalQuantity: 3000,
        },
      },
    },
  });

  console.log('Creating material listings...');

  // 2. Create 14 Seed Material Listings
  const listingsData = [
    {
      sellerId: sellerUser.id,
      category: 'Paper/Cardboard',
      title: 'Clean Corrugated Cardboard (Baled & B-Flute)',
      description: 'Pre-consumer corrugated board trimmings and unprinted cartons. Baled with wire into 250 kg cubes. Low moisture (<8%), zero contamination, ready for direct hydrapulper repulping.',
      quantity: 1200,
      unit: 'kg',
      pricePerUnit: 14.5,
      condition: 'Clean / High Grade',
      locationCity: 'Kolkata',
      locationAddress: 'Sector V Warehouse, Salt Lake, Kolkata',
      availability: 'Immediate',
      minOrderQuantity: 250,
      imageUrl: '/images/cat-cardboard.jpg',
    },
    {
      sellerId: buyerUser.id,
      category: 'Plastic',
      title: 'HDPE Plastic Regrind & Shredded Drums',
      description: 'Post-industrial high-density polyethylene regrind from clean detergent drums. Hot-washed, degreased, and flakes size 6-10 mm. Ideal for blow molding, irrigation pipes, or crates.',
      quantity: 3500,
      unit: 'kg',
      pricePerUnit: 42.0,
      condition: 'Recyclable / Unsorted',
      locationCity: 'Howrah',
      locationAddress: 'Dona Paula Industrial Estate, Howrah',
      availability: 'Immediate',
      minOrderQuantity: 500,
      imageUrl: '/images/cat-plastic.jpg',
    },
    {
      sellerId: sellerUser.id,
      category: 'Glass',
      title: 'Amber & Clear Glass Bottles (Sterilized 650ml)',
      description: 'Sterilized and sorted commercial beverage glass bottles. Packed in heavy plastic crates of 24 bottles each. Zero chips or fractures, ideal for bottling beverages, sauces, or craft products.',
      quantity: 2800,
      unit: 'pieces',
      pricePerUnit: 4.8,
      condition: 'Clean / High Grade',
      locationCity: 'Kolkata',
      locationAddress: 'Tangra Industrial Hub, Kolkata',
      availability: 'Immediate',
      minOrderQuantity: 240,
      imageUrl: '/images/cat-glass.jpg',
    },
    {
      sellerId: kolkataTextilesUser.id,
      category: 'Textile',
      title: 'Pure Cotton Fabric Trimmings & Comber Noils',
      description: '100% combed cotton offcuts from apparel export manufacturing. Segregated by color (natural white and denim blue). Perfect for recycled cotton yarn spinning or paper manufacturing.',
      quantity: 1800,
      unit: 'kg',
      pricePerUnit: 28.0,
      condition: 'Surplus / Unused',
      locationCity: 'Kolkata',
      locationAddress: 'Taratala Industrial Area, Kolkata',
      availability: 'Within 1 week',
      minOrderQuantity: 300,
      imageUrl: '/images/cat-textile.jpg',
    },
    {
      sellerId: siliguriWoodUser.id,
      category: 'Wood',
      title: 'Heavy-Duty Euro Wood Pallets (ISPM-15 Certified)',
      description: 'Standard 1200x800mm 4-way entry pine & hardwood shipping pallets. Heat-treated and stamped. Minor cosmetic scuffs, structurally inspected for 1.5-ton load capacity.',
      quantity: 160,
      unit: 'pallets',
      pricePerUnit: 320.0,
      condition: 'Minor Defects',
      locationCity: 'Siliguri',
      locationAddress: 'Sevoke Road Yard, Siliguri',
      availability: 'Immediate',
      minOrderQuantity: 20,
      imageUrl: '/images/cat-wood.jpg',
    },
    {
      sellerId: buyerUser.id,
      category: 'Packaging materials',
      title: 'Used 210L Open-Top Plastic Drums & Carboys',
      description: 'Triple-rinsed food-grade blue HDPE barrels with locking rings and lids. Excellent for chemical storage, rainwater harvesting, or industrial transport.',
      quantity: 220,
      unit: 'pieces',
      pricePerUnit: 240.0,
      condition: 'Surplus / Unused',
      locationCity: 'Howrah',
      locationAddress: 'Howrah Freight Terminal, Howrah',
      availability: 'Immediate',
      minOrderQuantity: 10,
      imageUrl: '/images/cat-packaging.jpg',
    },
    {
      sellerId: assamBioUser.id,
      category: 'Food waste',
      title: 'Spent Coffee Grounds & Organic Spent Grains',
      description: 'High-nitrogen organic processing residue from regional breweries and coffee roasters. Stored in hygienic containers. Excellent feedstock for vermicomposting, biogas, or black soldier fly larvae.',
      quantity: 950,
      unit: 'kg',
      pricePerUnit: 3.5,
      condition: 'Clean / High Grade',
      locationCity: 'Guwahati',
      locationAddress: 'Six Mile Depot, Guwahati',
      availability: 'Recurring Monthly',
      minOrderQuantity: 100,
      imageUrl: '/images/cat-food-waste.jpg',
    },
    {
      sellerId: howrahMetalUser.id,
      category: 'Metal',
      title: 'Structural Steel Offcuts & Deformed Rebar Endings',
      description: 'Fe-500D grade rebar pieces (lengths 1.5m to 3.5m) and beam trimmings. Surface rust only; zero paint or chemical coating. High yield strength suitable for re-rolling or structural fabrication.',
      quantity: 4500,
      unit: 'kg',
      pricePerUnit: 38.0,
      condition: 'Surplus / Unused',
      locationCity: 'Howrah',
      locationAddress: 'Jalan Industrial Estate, NH6, Howrah',
      availability: 'Immediate',
      minOrderQuantity: 500,
      imageUrl: '/images/cat-metal.jpg',
    },
    {
      sellerId: sellerUser.id,
      category: 'Construction materials',
      title: 'Reclaimed Red Clay Bricks & Concrete Aggregate',
      description: 'Traditional wire-cut clay bricks recovered from commercial interior remodelling. Cleaned mortar edges, high compressive strength. Also includes crushed stone base course.',
      quantity: 6000,
      unit: 'kg',
      pricePerUnit: 2.4,
      condition: 'Recyclable / Unsorted',
      locationCity: 'Kolkata',
      locationAddress: 'New Town Eco Park Outskirts, Kolkata',
      availability: 'Immediate',
      minOrderQuantity: 1000,
      imageUrl: '/images/cat-construction.jpg',
    },
    {
      sellerId: howrahMetalUser.id,
      category: 'Industrial scrap',
      title: 'CNC Aluminum Turnings & 6061 Alloy Scrap',
      description: 'Clean CNC machining chips and billets of 6061 and 7075 aircraft aluminum. Centrifuged to extract cutting oils (<1% oil residue). Melts with high recovery rate.',
      quantity: 1100,
      unit: 'kg',
      pricePerUnit: 145.0,
      condition: 'Clean / High Grade',
      locationCity: 'Kolkata',
      locationAddress: 'Kasba Industrial Estate, Kolkata',
      availability: 'Within 1 week',
      minOrderQuantity: 200,
      imageUrl: '/images/cat-industrial-scrap.jpg',
    },
    {
      sellerId: sellerUser.id,
      category: 'Furniture',
      title: 'Modular Corporate Office Desks & Ergonomic Partitions',
      description: 'Surplus corporate workstation clusters including modesty panels, wire management trays, and acoustic fabric dividers. Light oak finish, scratch-resistant laminate.',
      quantity: 35,
      unit: 'pieces',
      pricePerUnit: 1400.0,
      condition: 'Surplus / Unused',
      locationCity: 'Kolkata',
      locationAddress: 'Sector V IT Corridor, Salt Lake, Kolkata',
      availability: 'Immediate',
      minOrderQuantity: 4,
      imageUrl: '/images/cat-furniture.jpg',
    },
    {
      sellerId: siliguriWoodUser.id,
      category: 'Business equipment',
      title: 'Heavy-Duty Rubber Conveyor Belts (4-Ply Steel Cord)',
      description: 'Decommissioned quarry and tea garden transport belting. Thickness 12mm, width 800mm. Exceptionally tough vulcanized rubber, popular for farm flooring and livestock lining.',
      quantity: 18,
      unit: 'pieces',
      pricePerUnit: 2800.0,
      condition: 'Minor Defects',
      locationCity: 'Siliguri',
      locationAddress: 'Burdwan Road Depot, Siliguri',
      availability: 'Immediate',
      minOrderQuantity: 2,
      imageUrl: '/images/cat-business-equipment.jpg',
    },
    {
      sellerId: sellerUser.id,
      category: 'Packaging materials',
      title: 'Industrial Heavy Duty Stretch Film & Bubble Rolls',
      description: 'Clean excess rolls of 23-micron stretch film and 10mm bubble wrap leftover from custom export crating. Kept in climate-controlled warehouse.',
      quantity: 450,
      unit: 'kg',
      pricePerUnit: 36.0,
      condition: 'Surplus / Unused',
      locationCity: 'Kolkata',
      locationAddress: 'Salt Lake Sector V, Kolkata',
      availability: 'Immediate',
      minOrderQuantity: 50,
      imageUrl: '/images/cat-packaging.jpg',
    },
    {
      sellerId: assamBioUser.id,
      category: 'Wood',
      title: 'Tea Estate Pruning Wood Chips & Sawdust',
      description: 'Biomass residue from organic tea estates in Upper Assam. Chipped to 25mm size, sun-dried. Perfect for industrial boilers, biomass pelleting, or landscaping mulch.',
      quantity: 5000,
      unit: 'kg',
      pricePerUnit: 4.2,
      condition: 'Clean / High Grade',
      locationCity: 'Guwahati',
      locationAddress: 'Beltola Industrial Hub, Guwahati',
      availability: 'Recurring Monthly',
      minOrderQuantity: 1000,
      imageUrl: '/images/cat-sawdust.jpg',
    },
  ];

  const createdListings = [];
  for (const item of listingsData) {
    const { imageUrl, ...data } = item;
    const listing = await prisma.materialListing.create({
      data: {
        ...data,
        images: {
          create: [{ url: imageUrl, isPrimary: true }],
        },
      },
    });
    createdListings.push(listing);
  }

  // 3. Create Sample Buyer Requests & Negotiations
  console.log('Creating sample requests & conversations...');

  // Request 1: Bengal EcoRecycle requests Cardboard from GreenPack
  const cardboardListing = createdListings[0];
  const req1 = await prisma.materialRequest.create({
    data: {
      materialId: cardboardListing.id,
      buyerId: buyerUser.id,
      sellerId: sellerUser.id,
      quantity: 800,
      offeredPrice: 14.0,
      pickupMethod: 'EcoLoop Logistics',
      message: 'We can lift 800 kg immediately with monthly recurring pickups if quality meets hydrapulping specs.',
      status: 'ACCEPTED',
    },
  });

  // Conversation 1
  const conv1 = await prisma.conversation.create({
    data: {
      requestId: req1.id,
      participant1Id: buyerUser.id,
      participant2Id: sellerUser.id,
      lastMessage: 'Deal accepted! Order generated for pickup on Friday.',
      lastMessageAt: new Date(Date.now() - 3600000 * 24),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv1.id,
        senderId: buyerUser.id,
        content: 'Hi Amitav, can you do ₹13.80/kg if we take 800 kg every two weeks?',
        isNegotiation: true,
        proposedPrice: 13.8,
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 48),
      },
      {
        conversationId: conv1.id,
        senderId: sellerUser.id,
        content: 'Hello Rhea! We can meet at ₹14.00/kg since the moisture content is strictly below 8%. EcoLoop logistics can dispatch our fleet.',
        isNegotiation: true,
        proposedPrice: 14.0,
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 36),
      },
      {
        conversationId: conv1.id,
        senderId: buyerUser.id,
        content: 'Agreed at ₹14.00/kg. Confirming request.',
        isNegotiation: false,
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 25),
      },
      {
        conversationId: conv1.id,
        senderId: sellerUser.id,
        content: 'Deal accepted! Order generated for pickup on Friday.',
        isNegotiation: false,
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 24),
      },
    ],
  });

  // Request 2: Pending request for HDPE Plastic
  const plasticListing = createdListings[1];
  await prisma.materialRequest.create({
    data: {
      materialId: plasticListing.id,
      buyerId: kolkataTextilesUser.id,
      sellerId: buyerUser.id,
      quantity: 1000,
      offeredPrice: 40.0,
      pickupMethod: 'Buyer pickup',
      message: 'Looking to purchase 1000 kg HDPE regrind for packaging spools. Can arrange our own truck.',
      status: 'PENDING',
    },
  });

  // Request 3: Negotiating request for Glass Bottles
  const glassListing = createdListings[2];
  const req3 = await prisma.materialRequest.create({
    data: {
      materialId: glassListing.id,
      buyerId: assamBioUser.id,
      sellerId: sellerUser.id,
      quantity: 500,
      offeredPrice: 4.2,
      pickupMethod: 'EcoLoop Logistics',
      message: 'Interested in 500 bottles for kombucha trial bottling in Guwahati.',
      status: 'NEGOTIATING',
      counterPrice: 4.5,
      counterNotes: 'We can supply at ₹4.50 with bubble packaging included.',
    },
  });

  // 4. Create Sample Completed Orders & Environmental Impact Data
  console.log('Creating completed transactions & impact records...');

  // Order 1: Completed & Paid for Cardboard
  const baseAmt1 = 800 * 14.0;
  const platformFee1 = Math.round(baseAmt1 * 0.03 * 100) / 100;
  const logisticsFee1 = 450;
  const totalAmt1 = baseAmt1 + platformFee1 + logisticsFee1;

  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ECL-2026-1042',
      requestId: req1.id,
      materialId: cardboardListing.id,
      buyerId: buyerUser.id,
      sellerId: sellerUser.id,
      quantity: 800,
      unitPrice: 14.0,
      baseAmount: baseAmt1,
      platformFee: platformFee1,
      logisticsFee: logisticsFee1,
      totalAmount: totalAmt1,
      pickupMethod: 'EcoLoop Logistics',
      shippingAddress: buyerUser.address,
      paymentStatus: 'PAID',
      deliveryStatus: 'DELIVERED',
      createdAt: new Date(Date.now() - 3600000 * 24 * 5),
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order1.id,
      amount: totalAmt1,
      paymentMethod: 'UPI',
      transactionRef: 'TXN-UPI-98421039',
      status: 'SUCCESS',
      paidAt: new Date(Date.now() - 3600000 * 24 * 5),
    },
  });

  const impact1 = calculateEnvironmentalImpact('Paper/Cardboard', 800);
  await prisma.impactRecord.create({
    data: {
      orderId: order1.id,
      materialCategory: 'Paper/Cardboard',
      quantityKg: 800,
      co2SavedKg: impact1.co2SavedKg,
      landfillDivertedKg: impact1.landfillDivertedKg,
      waterSavedLiters: impact1.waterSavedLiters,
      treesEquivalent: impact1.treesEquivalent,
      transactionValue: totalAmt1,
      recordedAt: new Date(Date.now() - 3600000 * 24 * 5),
    },
  });

  // Order 2: Prior completed order for Wood Pallets
  const woodListing = createdListings[4];
  const baseAmt2 = 40 * 320;
  const platformFee2 = Math.round(baseAmt2 * 0.03 * 100) / 100;
  const totalAmt2 = baseAmt2 + platformFee2;

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ECL-2026-0892',
      materialId: woodListing.id,
      buyerId: sellerUser.id,
      sellerId: siliguriWoodUser.id,
      quantity: 40,
      unitPrice: 320.0,
      baseAmount: baseAmt2,
      platformFee: platformFee2,
      logisticsFee: 0,
      totalAmount: totalAmt2,
      pickupMethod: 'Seller delivery',
      shippingAddress: sellerUser.address,
      paymentStatus: 'PAID',
      deliveryStatus: 'DELIVERED',
      createdAt: new Date(Date.now() - 3600000 * 24 * 18),
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order2.id,
      amount: totalAmt2,
      paymentMethod: 'NETBANKING',
      transactionRef: 'TXN-NET-55198273',
      status: 'SUCCESS',
      paidAt: new Date(Date.now() - 3600000 * 24 * 18),
    },
  });

  // 40 pallets * 25 kg = 1000 kg wood
  const impact2 = calculateEnvironmentalImpact('Wood', 1000);
  await prisma.impactRecord.create({
    data: {
      orderId: order2.id,
      materialCategory: 'Wood',
      quantityKg: 1000,
      co2SavedKg: impact2.co2SavedKg,
      landfillDivertedKg: impact2.landfillDivertedKg,
      waterSavedLiters: impact2.waterSavedLiters,
      treesEquivalent: impact2.treesEquivalent,
      transactionValue: totalAmt2,
      recordedAt: new Date(Date.now() - 3600000 * 24 * 18),
    },
  });

  // Historical impact records to populate charts
  const historicalSeed = [
    { cat: 'Plastic', kg: 4500, val: 189000, daysAgo: 45 },
    { cat: 'Metal', kg: 3200, val: 121600, daysAgo: 60 },
    { cat: 'Textile', kg: 2100, val: 58800, daysAgo: 75 },
    { cat: 'Paper/Cardboard', kg: 5400, val: 78300, daysAgo: 90 },
    { cat: 'Industrial scrap', kg: 1500, val: 217500, daysAgo: 110 },
  ];

  for (const h of historicalSeed) {
    const imp = calculateEnvironmentalImpact(h.cat, h.kg);
    await prisma.impactRecord.create({
      data: {
        materialCategory: h.cat,
        quantityKg: h.kg,
        co2SavedKg: imp.co2SavedKg,
        landfillDivertedKg: imp.landfillDivertedKg,
        waterSavedLiters: imp.waterSavedLiters,
        treesEquivalent: imp.treesEquivalent,
        transactionValue: h.val,
        recordedAt: new Date(Date.now() - 3600000 * 24 * h.daysAgo),
      },
    });
  }

  // 5. Notifications
  console.log('Creating demo notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: sellerUser.id,
        title: 'New Purchase Request',
        message: 'Bengal EcoRecycle Solutions sent a request for 800 kg of Clean Corrugated Cardboard.',
        type: 'REQUEST',
        link: '/seller/requests',
        isRead: false,
      },
      {
        userId: sellerUser.id,
        title: 'Payment Received',
        message: 'Payment of ₹12,002 received for Order #ECL-2026-1042.',
        type: 'PAYMENT',
        link: `/orders/${order1.id}`,
        isRead: true,
      },
      {
        userId: buyerUser.id,
        title: 'Smart AI Match Found!',
        message: 'High match (94% compatibility): Clean Corrugated Cardboard listed in Kolkata.',
        type: 'SYSTEM',
        link: `/materials/${cardboardListing.id}`,
        isRead: false,
      },
    ],
  });

  console.log('✅ EcoLoop database seeded successfully!');
  console.log('------------------------------------------------');
  console.log('Demo Seller Credentials:');
  console.log('  Email:    seller@ecoloop.com');
  console.log('  Password: ecoloop123');
  console.log('Demo Buyer Credentials:');
  console.log('  Email:    buyer@ecoloop.com');
  console.log('  Password: ecoloop123');
  console.log('------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
