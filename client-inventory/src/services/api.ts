import type { User } from "@/components/table/UserColumns";
import type { Inventory } from "@/components/table/InventoryColumns";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { toast } from "sonner";

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

export async function fetchInventories(): Promise<Inventory[]> {
  try {
    const { data } = await axios.get<Inventory[]>(`${apiUrl}/api/v1/inventories`);
    return data;
  } catch (error) {
    console.error("Error loading inventories:", error);
    throw new Error("Loading error");
  }
}


export async function registerUser(email: string, password: string) {
  const { data } = await axios.post(`${apiUrl}/api/v1/auth/web/register`, {
    email,
    password,
  });

  useAuthStore.getState().setUser(data);

  return data.user;
}

export async function loginUser(email: string, password: string) {
  const { data } = await axios.post(`${apiUrl}/api/v1/auth/web/login`, {
    email,
    password,
  });

  useAuthStore.getState().setUser(data);

  return data;
}

export async function getProfile() {
  const user = useAuthStore.getState().user;

  const { data } = await axios.get(`${apiUrl}/api/v1/user/profile`,{
    headers: {
      Authorization: `Bearer ${user?.token}`,
      "Content-Type": "application/json",
    },
  });

  useAuthStore.getState().setUser(data);

  return data;
}

export async function processUsersBatch(ids: string[], action: string) {
  const user = useAuthStore.getState().user;

  const res = await axios.patch(
  `${apiUrl}/api/v1/admin/users/batch`,
    {
      ids,
      action,
    },
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json",
      },
    }
  );

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

    const { error, ...user } = event.data;

    if (user && Object.keys(user).length !== 0) {
      useAuthStore.getState().setUser(user);
      navigate("/");
    } else {
      toast.error(error);
    }

    window.removeEventListener("message", handleMessage);
  };

  window.addEventListener("message", handleMessage);
}
