import type { User } from "@/components/table/Columns";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

export async function fetchUsers(): Promise<User[]> {
  const user = useAuthStore.getState().user;

  try {
    const { data } = await axios.get<User[]>(`${apiUrl}/api/v1/admin/users`, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json",
      },
    });

    return data;
  } catch (error) {
    console.error("Error loading users:", error);
    throw new Error("Loading error");
  }
}

export async function registerUser(email: string, password: string) {
  const { data } = await axios.post(`${apiUrl}/api/v1/auth/web/register`, {
    email,
    password,
  });

  useAuthStore.getState().setUser(data.user);

  return data.user;
}

export async function loginUser(email: string, password: string) {
  const res = await axios.post(`${apiUrl}/api/v1/auth/web/login`, {
    email,
    password,
  });

  useAuthStore.getState().setUser(res.data.user);

  return res.data;
}

export function handleSSOLogin(provider: string, navigate: (path: string) => void) {
  window.open(
    `${apiUrl}/api/v1/auth/${provider}`,
    "login",
    "width=500,height=600"
  );

  const handleMessage = (event: MessageEvent) => {
    if (event.origin !== apiUrl) return;

    const { token, ...user } = event.data;

    if (token && user) {
      user.token = token
      useAuthStore.getState().setUser(user);
      navigate("/");
    }

    window.removeEventListener("message", handleMessage);
  };

  window.addEventListener("message", handleMessage);
}
