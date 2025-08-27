import { getDashboardStats } from "../models/dashboardModel.js";
import { mapAndSendError } from "../utils/http.js";

export async function getDashboardData (req, res) {
  try {
    const data = await getDashboardStats();
    res.json(data);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return mapAndSendError(res, error);
  }
};
