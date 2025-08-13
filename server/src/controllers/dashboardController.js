import prisma from "../config/db.js";
import { subDays } from 'date-fns';

export async function getDashboardData (req, res) {
  try {
    const [
      totalInventories,
      inventoriesLastDay,
      totalUsers,
      latestInventories,
      topInventories
    ] = await prisma.$transaction([
      prisma.inventory.count(),

      prisma.inventory.count({
        where: {
          createdAt: {
            gte: subDays(new Date(), 1)
          }
        }
      }),

      prisma.user.count(),

      prisma.inventory.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          owner: {
            select: {
              id: true,
              fullName: true,
              avatar: true
            }
          }
        }
      }),

      prisma.inventory.findMany({
        take: 5,
        orderBy: {
          item: {
            _count: 'desc'
          }
        },
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          _count: {
            select: { item: true }
          }
        }
      })
    ]);

    res.json({
      stats: {
        totalInventories,
        inventoriesLastDay,
        totalUsers
      },
      latestInventories,
      topInventories
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
