import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ecoloop_super_secret_jwt_key_2026_circular_economy';

// Helper to set cookie & return token
function issueAuthResponse(res: Response, user: any, message: string) {
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.json({
    message,
    token,
    user: {
      id: user.id,
      email: user.email,
      businessName: user.businessName,
      contactPerson: user.contactPerson,
      phone: user.phone,
      city: user.city,
      address: user.address,
      category: user.category,
      bio: user.bio,
      isVerified: user.isVerified,
      role: user.role || 'BUYER',
    },
  });
}

authRouter.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessName, email, phone, password, confirmPassword, city, category, address, contactPerson, bio, role } = req.body;

    if (!businessName || !email || !password || !phone || !city || !category) {
      res.status(400).json({ error: 'Please fill in all required fields.' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      res.status(400).json({ error: 'A business with this email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role === 'SELLER' ? 'SELLER' : 'BUYER';

    const newUser = await prisma.user.create({
      data: {
        businessName: businessName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: hashedPassword,
        city: city.trim(),
        category: category.trim(),
        address: address ? address.trim() : null,
        contactPerson: contactPerson ? contactPerson.trim() : null,
        bio: bio ? bio.trim() : null,
        role: assignedRole,
        isVerified: true,
      },
    });

    // Create default buyer preferences
    await prisma.buyerPreference.create({
      data: {
        userId: newUser.id,
        preferredCategories: '',
        preferredCities: newUser.city,
      },
    });

    // Welcome notification
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        title: 'Welcome to EcoLoop!',
        message: 'Your business profile is live. Explore the marketplace or list your excess waste.',
        type: 'SYSTEM',
        link: '/marketplace',
      },
    });

    issueAuthResponse(res, newUser, 'Account registered successfully.');
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create business account.' });
  }
});

authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role, sessionId: bodySessionId } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Please enter both email and password.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const rawSessionId = bodySessionId || (req.headers['x-session-id'] as string) || '';
    const cleanSessionId = rawSessionId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 24) || ('sess_' + Math.random().toString(36).slice(2, 8));

    // Check if this is a demo login request
    const isDemoLogin =
      cleanEmail === 'purchase@greentechpolymers.in' ||
      cleanEmail === 'greenpack@ecoloop.com' ||
      cleanEmail === 'buyer@ecoloop.com' ||
      cleanEmail === 'seller@ecoloop.com' ||
      cleanEmail.includes('@demo.ecoloop.com') ||
      Boolean(req.body.isDemo);

    if (isDemoLogin) {
      const isSeller = cleanEmail.includes('greenpack') || cleanEmail.includes('seller') || role === 'SELLER';
      const isolatedDemoEmail = `demo_${isSeller ? 'seller' : 'buyer'}_${cleanSessionId}@ecoloop.com`;

      let user = await prisma.user.findUnique({
        where: { email: isolatedDemoEmail },
      });

      if (!user) {
        const hashedPassword = await bcrypt.hash(password || 'ecoloop123', 10);
        user = await prisma.user.create({
          data: {
            email: isolatedDemoEmail,
            password: hashedPassword,
            role: isSeller ? 'SELLER' : 'BUYER',
            businessName: isSeller ? 'GreenPack Innovations Pvt Ltd' : 'GreenTech Polymers & Recycling',
            contactPerson: isSeller ? 'Amitav Sen' : 'Siddharth Roy',
            phone: isSeller ? '+91 98301 23456' : '+91 98312 98765',
            city: isSeller ? 'Kolkata' : 'Howrah',
            address: isSeller ? 'Plot 14, Sector V, Salt Lake, Kolkata' : 'Dona Paula Industrial Estate, Howrah',
            category: isSeller ? 'Packaging' : 'Recycling',
            bio: isSeller
              ? 'Leading packaging and carton manufacturer with surplus cardboard offcuts.'
              : 'State-of-the-art recycling facility reprocessing plastics and industrial residues.',
            isVerified: true,
            preferences: {
              create: {
                preferredCategories: isSeller
                  ? 'Paper/Cardboard,Packaging materials,Wood'
                  : 'Paper/Cardboard,Plastic,Glass',
                preferredCities: isSeller ? 'Kolkata,Howrah' : 'Howrah,Kolkata',
              },
            },
          },
        });
      }

      issueAuthResponse(res, user, 'Demo session authenticated with unique per-user isolation.');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid business email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid business email or password.' });
      return;
    }

    issueAuthResponse(res, user, 'Logged in successfully.');
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to authenticate.' });
  }
});

authRouter.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Signed out successfully.' });
});

authRouter.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        preferences: true,
        _count: {
          select: {
            listings: true,
            buyerOrders: true,
            sellerOrders: true,
            sellerRequests: true,
            savedListings: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const { password, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});
