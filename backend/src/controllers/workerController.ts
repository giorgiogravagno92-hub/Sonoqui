import { Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProfile = async (req: any, res: Response) => {
  try {
    const profile = await prisma.workerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Worker profile not found' });
    }

    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      photoUrl,
      city,
      province,
      region,
      profession,
      specialization,
      experienceYears,
      educationLevel,
      educationField,
      skills,
      certifications,
      hasLicense,
      hasCar,
      availabilityStatus,
      maxDistanceKm,
      desiredContract,
      desiredSalary,
      cvPdfUrl,
      videoPresentationUrl
    } = req.body;

    const profile = await prisma.workerProfile.update({
      where: { userId: req.user.id },
      data: {
        firstName,
        lastName,
        photoUrl,
        city,
        province,
        region,
        profession,
        specialization,
        experienceYears: Number(experienceYears),
        educationLevel,
        educationField,
        skills,
        certifications,
        hasLicense: Boolean(hasLicense),
        hasCar: Boolean(hasCar),
        availabilityStatus,
        maxDistanceKm: Number(maxDistanceKm),
        desiredContract,
        desiredSalary,
        cvPdfUrl,
        videoPresentationUrl
      }
    });

    res.json(profile);
  } catch (error: any) {
    console.error('Error updating worker profile:', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
};

export const toggleAvailability = async (req: any, res: Response) => {
  try {
    const { status, profession, city, maxDistanceKm, availabilityDetails } = req.body;

    if (!['DISPONIBILE_SUBITO', 'VALUTO_OFFERTE', 'NON_DISPONIBILE'].includes(status)) {
      return res.status(400).json({ error: 'Invalid availability status' });
    }

    const profile = await prisma.workerProfile.update({
      where: { userId: req.user.id },
      data: {
        availabilityStatus: status,
        ...(status !== 'NON_DISPONIBILE' ? {
          profession,
          city,
          maxDistanceKm: maxDistanceKm ? Number(maxDistanceKm) : undefined,
          availabilityDetails
        } : {})
      }
    });

    res.json({
      success: true,
      availabilityStatus: profile.availabilityStatus,
      profile
    });
  } catch (error: any) {
    console.error('Error toggling availability:', error);
    res.status(500).json({ error: 'Error toggling availability status' });
  }
};

export const getNotifications = async (req: any, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: 'Error retrieving notifications' });
  }
};

export const markNotificationRead = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.update({
      where: { id, userId: req.user.id },
      data: { read: true }
    });
    res.json(notification);
  } catch (error: any) {
    res.status(500).json({ error: 'Error updating notification status' });
  }
};

export const getInterviewRequests = async (req: any, res: Response) => {
  try {
    const profile = await prisma.workerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Worker profile not found' });
    }

    const requests = await prisma.interviewRequest.findMany({
      where: { workerId: profile.id },
      include: {
        company: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching interview requests' });
  }
};

export const respondToInterviewRequest = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "ACCEPTED" or "DECLINED"

    if (!['ACCEPTED', 'DECLINED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid response status' });
    }

    const profile = await prisma.workerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Worker profile not found' });
    }

    const updatedRequest = await prisma.interviewRequest.update({
      where: { id, workerId: profile.id },
      data: { status }
    });

    res.json(updatedRequest);
  } catch (error: any) {
    res.status(500).json({ error: 'Error responding to interview request' });
  }
};
