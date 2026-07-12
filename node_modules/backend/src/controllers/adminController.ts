import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStats = async (req: Request, res: Response) => {
  try {
    const workersCount = await prisma.workerProfile.count();
    const companiesCount = await prisma.companyProfile.count();
    const interviewsCount = await prisma.interviewRequest.count();
    const favoritesCount = await prisma.favorite.count();

    const workersByStatus = await prisma.workerProfile.groupBy({
      by: ['availabilityStatus'],
      _count: {
        availabilityStatus: true
      }
    });

    const activeInterviewsByStatus = await prisma.interviewRequest.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    res.json({
      totals: {
        workers: workersCount,
        companies: companiesCount,
        interviews: interviewsCount,
        favorites: favoritesCount
      },
      availabilityDistribution: workersByStatus.reduce((acc: any, curr) => {
        acc[curr.availabilityStatus] = curr._count.availabilityStatus;
        return acc;
      }, {}),
      interviewStatusDistribution: activeInterviewsByStatus.reduce((acc: any, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      }, {})
    });
  } catch (error: any) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({ error: 'Error fetching stats' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const workers = await prisma.workerProfile.findMany({
      include: {
        user: {
          select: { email: true, createdAt: true }
        }
      }
    });
    res.json(workers);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching users list' });
  }
};

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await prisma.companyProfile.findMany({
      include: {
        user: {
          select: { email: true, createdAt: true }
        }
      }
    });
    res.json(companies);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching companies list' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // User ID
    await prisma.user.delete({
      where: { id }
    });
    res.json({ success: true, message: 'User and all related profiles deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
};

export const sendSystemNotification = async (req: Request, res: Response) => {
  try {
    const { title, message, targetRole } = req.body; // targetRole: 'ALL', 'WORKER', 'COMPANY'

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const whereClause: any = {};
    if (targetRole && targetRole !== 'ALL') {
      whereClause.role = targetRole;
    }

    const users = await prisma.user.findMany({ where: whereClause });

    // Create notifications for all target users
    const notificationsData = users.map((user) => ({
      userId: user.id,
      title,
      message,
      type: 'MESSAGE'
    }));

    await prisma.notification.createMany({
      data: notificationsData
    });

    res.json({
      success: true,
      deliveredCount: users.length,
      message: `System notification sent to ${users.length} users successfully.`
    });
  } catch (error: any) {
    console.error('Error sending system notification:', error);
    res.status(500).json({ error: 'Error sending notification' });
  }
};
