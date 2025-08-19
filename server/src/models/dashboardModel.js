import prisma from "../config/db.js";
import { subDays } from 'date-fns';

export async function getDashboardStats() {
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

  return {
    stats: {
      totalInventories,
      inventoriesLastDay,
      totalUsers
    },
    latestInventories,
    topInventories
  };
}
