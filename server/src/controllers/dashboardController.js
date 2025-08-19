import { getDashboardStats } from "../models/dashboardModel.js";

export async function getDashboardData (req, res) {
  try {
    const data = await getDashboardStats();
    res.json(data);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'COMMON_SERVER_ERROR' });
  }
};
