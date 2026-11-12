import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

export const materialsRouter = Router();

// GET all materials with filters and search
materialsRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      city,
      condition,
      minPrice,
      maxPrice,
      sort = 'newest',
      status = 'ACTIVE',
    } = req.query;

    const where: any = {
      status: String(status),
    };

    if (category && category !== 'All') {
      where.category = String(category);
    }

    if (city && city !== 'All') {
      where.locationCity = { contains: String(city) };
    }

    if (condition && condition !== 'All') {
      where.condition = String(condition);
    }

    if (minPrice || maxPrice) {
      where.pricePerUnit = {};
      if (minPrice) where.pricePerUnit.gte = parseFloat(String(minPrice));
      if (maxPrice) where.pricePerUnit.lte = parseFloat(String(maxPrice));
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { category: { contains: q } },
        { locationCity: { contains: q } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { pricePerUnit: 'asc' };
    if (sort === 'price_desc') orderBy = { pricePerUnit: 'desc' };
    if (sort === 'quantity_desc') orderBy = { quantity: 'desc' };

    const listings = await prisma.materialListing.findMany({
      where,
      orderBy,
      include: {
        images: true,
        seller: {
          select: {
            id: true,
            businessName: true,
            city: true,
            category: true,
            isVerified: true,
          },
        },
      },
    });

    res.json({
      listings,
      total: listings.length,
    });
  } catch (error) {
    console.error('Fetch materials error:', error);
    res.status(500).json({ error: 'Failed to fetch material listings.' });
  }
});

// GET seller's own listings
materialsRouter.get('/seller/my-listings', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listings = await prisma.materialListing.findMany({
      where: { sellerId: req.user!.id },
      include: {
        images: true,
        _count: {
          select: {
            requests: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ listings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your listings.' });
  }
});

// GET single material details
materialsRouter.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listing = await prisma.materialListing.findUnique({
      where: { id: req.params.id },
      include: {
        images: true,
        seller: {
          select: {
            id: true,
            businessName: true,
            city: true,
            category: true,
            address: true,
            bio: true,
            isVerified: true,
            createdAt: true,
            _count: {
              select: { listings: true, sellerOrders: true },
            },
          },
        },
      },
    });

    if (!listing) {
      res.status(404).json({ error: 'Material listing not found.' });
      return;
    }

    // Also fetch 3 related materials in the same or complementary category
    const related = await prisma.materialListing.findMany({
      where: {
        category: listing.category,
        id: { not: listing.id },
        status: 'ACTIVE',
      },
      take: 3,
      include: { images: true },
    });

    res.json({
      listing,
      related,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch material details.' });
  }
});

// POST create a listing
materialsRouter.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      category,
      title,
      description,
      quantity,
      unit,
      pricePerUnit,
      condition,
      locationCity,
      locationAddress,
      availability,
      minOrderQuantity,
      images,
      companyName,
    } = req.body;

    if (companyName && typeof companyName === 'string' && companyName.trim()) {
      try {
        await prisma.user.update({
          where: { id: req.user!.id },
          data: { businessName: companyName.trim() },
        });
      } catch {}
    }

    if (!category || !title || !description || !quantity || !unit || pricePerUnit === undefined || !condition || !locationCity) {
      res.status(400).json({ error: 'Please provide all required listing information.' });
      return;
    }

    const listing = await prisma.materialListing.create({
      data: {
        sellerId: req.user!.id,
        category: category.trim(),
        title: title.trim(),
        description: description.trim(),
        quantity: parseFloat(quantity),
        unit: unit.trim(),
        pricePerUnit: parseFloat(pricePerUnit),
        condition: condition.trim(),
        locationCity: locationCity.trim(),
        locationAddress: locationAddress ? locationAddress.trim() : `${locationCity.trim()}, India`,
        availability: availability ? availability.trim() : 'Immediate',
        minOrderQuantity: minOrderQuantity ? parseFloat(minOrderQuantity) : 1,
        status: 'ACTIVE',
        images: {
          create: Array.isArray(images) && images.length > 0
            ? images.map((img: string | { url: string; isPrimary?: boolean }, index: number) => ({
                url: typeof img === 'string' ? img : img.url,
                isPrimary: index === 0,
              }))
            : [{
                url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
                isPrimary: true,
              }],
        },
      },
      include: {
        images: true,
      },
    });

    // Notify seller of successful listing
    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: 'Listing Published!',
        message: `Your listing "${listing.title}" is now active on the EcoLoop marketplace.`,
        type: 'SYSTEM',
        link: `/materials/${listing.id}`,
      },
    });

    res.status(201).json({
      message: 'Waste listing created successfully and published to marketplace.',
      listing,
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Failed to create material listing.' });
  }
});

// PUT update listing (owner only)
materialsRouter.put('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.materialListing.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Listing not found.' });
      return;
    }

    if (existing.sellerId !== req.user!.id) {
      res.status(403).json({ error: 'Only the business that listed this item can edit it.' });
      return;
    }

    const {
      category,
      title,
      description,
      quantity,
      unit,
      pricePerUnit,
      condition,
      locationCity,
      locationAddress,
      availability,
      minOrderQuantity,
      status,
      companyName,
      images,
      imageUrl,
    } = req.body;

    if (companyName && typeof companyName === 'string' && companyName.trim()) {
      try {
        await prisma.user.update({
          where: { id: existing.sellerId },
          data: { businessName: companyName.trim() },
        });
      } catch {}
    }

    if (images && Array.isArray(images) && images.length > 0) {
      await prisma.listingImage.deleteMany({ where: { listingId: req.params.id } });
      await prisma.listingImage.createMany({
        data: images.map((img: string | { url: string }, index: number) => ({
          listingId: req.params.id,
          url: typeof img === 'string' ? img : img.url,
          isPrimary: index === 0,
        })),
      });
    } else if (imageUrl && typeof imageUrl === 'string') {
      await prisma.listingImage.deleteMany({ where: { listingId: req.params.id } });
      await prisma.listingImage.create({
        data: {
          listingId: req.params.id,
          url: imageUrl,
          isPrimary: true,
        },
      });
    }

    const updated = await prisma.materialListing.update({
      where: { id: req.params.id },
      data: {
        category: category ?? existing.category,
        title: title ?? existing.title,
        description: description ?? existing.description,
        quantity: quantity !== undefined ? parseFloat(quantity) : existing.quantity,
        unit: unit ?? existing.unit,
        pricePerUnit: pricePerUnit !== undefined ? parseFloat(pricePerUnit) : existing.pricePerUnit,
        condition: condition ?? existing.condition,
        locationCity: locationCity ?? existing.locationCity,
        locationAddress: locationAddress ?? existing.locationAddress,
        availability: availability ?? existing.availability,
        minOrderQuantity: minOrderQuantity !== undefined ? parseFloat(minOrderQuantity) : existing.minOrderQuantity,
        status: status ?? existing.status,
      },
      include: {
        images: true,
        seller: {
          select: {
            id: true,
            businessName: true,
            city: true,
            category: true,
            isVerified: true,
          },
        },
      },
    });

    res.json({ message: 'Listing updated successfully.', listing: updated });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Failed to update listing.' });
  }
});

// DELETE listing
materialsRouter.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.materialListing.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Listing not found.' });
      return;
    }

    if (existing.sellerId !== req.user!.id) {
      res.status(403).json({ error: 'You are not authorized to delete this listing.' });
      return;
    }

    await prisma.materialListing.delete({ where: { id: req.params.id } });
    res.json({ message: 'Listing removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete listing.' });
  }
});
