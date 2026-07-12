import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'sono-qui-secret-key-12345';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, profileData } = req.body;

    if (!email || !password || !role) {
      return res.status(404).json({ error: 'Email, password and role are required' });
    }

    if (!['WORKER', 'COMPANY', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and profile transactionally
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          role
        }
      });

      if (role === 'WORKER') {
        await tx.workerProfile.create({
          data: {
            userId: newUser.id,
            firstName: profileData?.firstName || 'Nuovo',
            lastName: profileData?.lastName || 'Candidato',
            city: profileData?.city || 'Roma',
            province: profileData?.province || 'RM',
            region: profileData?.region || 'Lazio',
            profession: profileData?.profession || 'Impiegato',
            experienceYears: profileData?.experienceYears || 0,
            skills: profileData?.skills || 'Nessuna',
            availabilityStatus: 'VALUTO_OFFERTE',
            desiredContract: profileData?.desiredContract || 'TEMPO_INDETERMINATO'
          }
        });
      } else if (role === 'COMPANY') {
        await tx.companyProfile.create({
          data: {
            userId: newUser.id,
            companyName: profileData?.companyName || 'Nuova Azienda',
            industry: profileData?.industry || 'Altro',
            city: profileData?.city || 'Roma',
            contactPerson: profileData?.contactPerson || 'Referente'
          }
        });
      }

      return newUser;
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        workerProfile: true,
        companyProfile: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.role === 'WORKER' ? user.workerProfile : user.companyProfile
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const me = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        workerProfile: true,
        companyProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.role === 'WORKER' ? user.workerProfile : user.companyProfile
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const socialLoginSimulation = async (req: Request, res: Response) => {
  try {
    const { email, name, provider, role } = req.body; // provider: 'google' or 'apple'

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        workerProfile: true,
        companyProfile: true
      }
    });

    if (!user) {
      // Create user with simulated social password
      const passwordHash = await bcrypt.hash(`social-login-${provider}-${Math.random()}`, 10);
      const parts = name ? name.split(' ') : ['Nuovo', 'Utente'];
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ') || 'Utente';

      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            passwordHash,
            role
          }
        });

        if (role === 'WORKER') {
          await tx.workerProfile.create({
            data: {
              userId: newUser.id,
              firstName,
              lastName,
              city: 'Milano',
              province: 'MI',
              region: 'Lombardia',
              profession: 'Sviluppatore Web',
              experienceYears: 2,
              skills: 'HTML, CSS, JavaScript, React',
              availabilityStatus: 'DISPONIBILE_SUBITO',
              desiredContract: 'TEMPO_INDETERMINATO'
            }
          });
        } else if (role === 'COMPANY') {
          await tx.companyProfile.create({
            data: {
              userId: newUser.id,
              companyName: name || 'Nuova Azienda Social',
              industry: 'Tecnologia',
              city: 'Milano',
              contactPerson: name || 'Referente'
            }
          });
        }

        return tx.user.findUnique({
          where: { id: newUser.id },
          include: {
            workerProfile: true,
            companyProfile: true
          }
        }) as any;
      });
    }

    const token = jwt.sign(
      { id: user!.id, email: user!.email, role: user!.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user!.id,
        email: user!.email,
        role: user!.role,
        profile: user!.role === 'WORKER' ? user!.workerProfile : user!.companyProfile
      }
    });
  } catch (error: any) {
    console.error('Social login error:', error);
    res.status(500).json({ error: 'Internal server error during social login simulation' });
  }
};
