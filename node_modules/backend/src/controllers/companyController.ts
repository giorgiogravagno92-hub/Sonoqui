import { Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const searchWorkers = async (req: any, res: Response) => {
  try {
    const {
      profession,
      city,
      province,
      region,
      availabilityStatus,
      experienceYearsMin,
      skills,
      hasLicense,
      hasCar,
      desiredContract,
      educationLevel,
      educationField
    } = req.query;

    const whereClause: any = {};

    if (profession) {
      whereClause.profession = { contains: String(profession) };
    }
    if (city) {
      whereClause.city = { contains: String(city) };
    }
    if (province) {
      whereClause.province = { equals: String(province).toUpperCase() };
    }
    if (region) {
      whereClause.region = { contains: String(region) };
    }
    if (availabilityStatus) {
      whereClause.availabilityStatus = { equals: String(availabilityStatus) };
    }
    if (experienceYearsMin) {
      whereClause.experienceYears = { gte: parseInt(String(experienceYearsMin)) };
    }
    if (hasLicense === 'true') {
      whereClause.hasLicense = true;
    }
    if (hasCar === 'true') {
      whereClause.hasCar = true;
    }
    if (desiredContract) {
      whereClause.desiredContract = { equals: String(desiredContract) };
    }
    if (educationLevel) {
      whereClause.educationLevel = { equals: String(educationLevel) };
    }
    if (educationField) {
      whereClause.educationField = { contains: String(educationField) };
    }

    let workers = await prisma.workerProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });

    // Client-side filtering for skills if specified (comma separated skills)
    if (skills) {
      const searchSkills = String(skills)
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      if (searchSkills.length > 0) {
        workers = workers.filter((worker) => {
          const workerSkills = worker.skills
            .toLowerCase()
            .split(',')
            .map((s) => s.trim());
          return searchSkills.some((skill) => workerSkills.includes(skill) || workerSkills.some(ws => ws.includes(skill)));
        });
      }
    }

    res.json(workers);
  } catch (error: any) {
    console.error('Error during candidate search:', error);
    res.status(500).json({ error: 'Error processing search' });
  }
};

export const getProfile = async (req: any, res: Response) => {
  try {
    const profile = await prisma.companyProfile.findUnique({
      where: { userId: req.user.id }
    });
    if (!profile) {
      return res.status(404).json({ error: 'Company profile not found' });
    }
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const { companyName, industry, city, contactPerson, contactPhone, logoUrl } = req.body;
    const profile = await prisma.companyProfile.update({
      where: { userId: req.user.id },
      data: {
        companyName,
        industry,
        city,
        contactPerson,
        contactPhone,
        logoUrl
      }
    });
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: 'Error updating profile' });
  }
};

export const getWorkerDetails = async (req: any, res: Response) => {
  try {
    const { id } = req.params; // worker profile ID

    const worker = await prisma.workerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Get company profile to customize notification
    const company = await prisma.companyProfile.findUnique({
      where: { userId: req.user.id }
    });

    const companyName = company ? company.companyName : "Un'azienda";

    // Simulate push notification by saving it to the worker's database notifications table
    await prisma.notification.create({
      data: {
        userId: worker.userId,
        title: 'Profilo Visualizzato',
        message: `${companyName} ha appena visualizzato il tuo profilo.`,
        type: 'PROFILE_VIEW'
      }
    });

    res.json(worker);
  } catch (error: any) {
    console.error('Error fetching worker details:', error);
    res.status(500).json({ error: 'Error fetching details' });
  }
};

export const toggleFavorite = async (req: any, res: Response) => {
  try {
    const { workerId } = req.body;

    const company = await prisma.companyProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!company) {
      return res.status(404).json({ error: 'Company profile not found' });
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        companyId_workerId: {
          companyId: company.id,
          workerId
        }
      }
    });

    if (existingFavorite) {
      // Remove favorite
      await prisma.favorite.delete({
        where: { id: existingFavorite.id }
      });
      res.json({ favorited: false });
    } else {
      // Add favorite
      await prisma.favorite.create({
        data: {
          companyId: company.id,
          workerId
        }
      });
      res.json({ favorited: true });
    }
  } catch (error: any) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: 'Error toggling favorite' });
  }
};

export const getFavorites = async (req: any, res: Response) => {
  try {
    const company = await prisma.companyProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!company) {
      return res.status(404).json({ error: 'Company profile not found' });
    }

    const favorites = await prisma.favorite.findMany({
      where: { companyId: company.id },
      include: {
        worker: true
      }
    });

    res.json(favorites.map(f => f.worker));
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching favorites' });
  }
};

export const requestInterview = async (req: any, res: Response) => {
  try {
    const { workerId, message, date } = req.body;

    const company = await prisma.companyProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!company) {
      return res.status(404).json({ error: 'Company profile not found' });
    }

    const worker = await prisma.workerProfile.findUnique({
      where: { id: workerId }
    });

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const interviewRequest = await prisma.interviewRequest.create({
      data: {
        companyId: company.id,
        workerId,
        message,
        interviewDate: date,
        status: 'PENDING'
      }
    });

    // Notify the worker
    await prisma.notification.create({
      data: {
        userId: worker.userId,
        title: 'Richiesta di Colloquio',
        message: `${company.companyName} ti ha inviato una richiesta di colloquio per il giorno ${date}.`,
        type: 'INTERVIEW_REQUEST'
      }
    });

    res.json({ success: true, request: interviewRequest });
  } catch (error: any) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({ error: 'Error creating interview request' });
  }
};
