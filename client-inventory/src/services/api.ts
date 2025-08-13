import type { User } from "@/components/table/UserColumns";
import type { Inventory } from "@/components/table/InventoryColumns";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { toast } from "sonner";
import type { InventorySettingSchema } from "@/lib/inventory";
import type { ProfileSchema } from "@/lib/auth";
import type { Item } from "@/components/table/ItemColumns";

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

export async function updateProfile(payload : ProfileSchema) {
  const user = useAuthStore.getState().user;

  const { data } = await axios.patch(`${apiUrl}/api/v1/user/profile`,
    {...payload},
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json",
      },
    }
  );

  useAuthStore.getState().setUser(data);
  return data;
}

export async function searchUsers(query: string) {
  const user = useAuthStore.getState().user;

  const { data } = await axios.get(`${apiUrl}/api/v1/user/search`, {
    params: { q: query },
    headers: {
      Authorization: `Bearer ${user?.token}`,
      "Content-Type": "application/json",
    },
  });

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

export async function fetchInventories(): Promise<Inventory[]> {
  try {
    const { data } = await axios.get<Inventory[]>(`${apiUrl}/api/v1/inventories`);
    return data;
  } catch (error) {
    console.error("Error loading inventories:", error);
    throw new Error("Loading error");
  }
}

export async function fetchItems(inventoryId: string): Promise<Item[]> {
  try {
    const { data } = await axios.get<Item[]>(`${apiUrl}/api/v1/inventories/${inventoryId}/items`);
    return data;
  } catch (error) {
    console.error("Error loading inventories:", error);
    throw new Error("Loading error");
  }
}

export async function fetchMyInventories(type: string): Promise<Inventory[]> {
  try {
    const user = useAuthStore.getState().user;
    const { data } = await axios.get<Inventory[]>(`${apiUrl}/api/v1/inventories/me?type=${type}`,{
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error) {
    console.error("Error loading inventories:", error);
    throw new Error("Loading error");
  }
}

export async function fetchInventoryById(id: string): Promise<Inventory> {
  try {
    const user = useAuthStore.getState().user;
    let path = "external"
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (user?.token) {
      headers["Authorization"] = `Bearer ${user.token}`;
      path = "internal"
    }
    const { data } = await axios.get<Inventory>(`${apiUrl}/api/v1/inventories/${path}/${id}`,{
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error) {
    console.error("Error loading inventory:", error);
    throw new Error("Loading error");
  }
}

export async function fetchItemById(id: string): Promise<Item> {
  try {
    const { data } = await axios.get<Item>(`${apiUrl}/api/v1/items/${id}`);
    return data;
  } catch (error) {
    console.error("Error loading item:", error);
    throw new Error("Loading error");
  }
}

export async function loadMessages(inventoryId: string) {
  const { data } = await axios.get(`${apiUrl}/api/v1/inventories/${inventoryId}/messages`)
  return data.reverse()
}

export async function updateInventory(id: string, payload: InventorySettingSchema): Promise<Inventory> {
  try {
    const user = useAuthStore.getState().user;
    const { data } = await axios.patch<Inventory>(`${apiUrl}/api/v1/inventories/${id}`,
      {...payload},
      {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json",
      },
    }
    );
    return data;
  } catch (error) {
    console.error("Error updating inventories:", error);
    throw new Error("Loading error");
  }
}

export async function createInventory(payload: InventorySettingSchema): Promise<Inventory> {
  try {
    const user = useAuthStore.getState().user;
    const { data } = await axios.post<Inventory>(`${apiUrl}/api/v1/inventories`,
      payload,
      {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json",
      },
    }
    );
    return data;
  } catch (error) {
    console.error("Error creating inventories:", error);
    throw new Error("Loading error");
  }
}

export async function createItem(payload: any, inventoryId: string): Promise<Inventory> {
  try {
    const user = useAuthStore.getState().user;
    const { data } = await axios.post<Inventory>(`${apiUrl}/api/v1/inventories/${inventoryId}/items`,
      payload,
      {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json",
      },
    }
    );
    return data;
  } catch (error) {
    console.error("Error creating item:", error);
    throw new Error("Loading error");
  }
}

export async function updateItem(id: string, payload: any) {
  try{
    const user = useAuthStore.getState().user;
    const { data } = await axios.patch<Item>(`${apiUrl}/api/v1/items/${id}`,
      payload,
      {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error) {
    console.error("Error updating item:", error);
    throw new Error("Loading error");
  }
}

export async function loadDashboard() {
  const { data } = await axios.get(`${apiUrl}/api/v1/dashboard`)
  return data
}
