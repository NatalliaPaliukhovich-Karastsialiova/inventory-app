import type { User } from "@/types";
import type { Inventory, Item } from "@/types";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { toast } from "sonner";
import type { InventorySettingSchema } from "@/lib/inventory";
import type { ProfileSchema } from "@/lib/auth";
import i18n from "../i18n";

const apiUrl = import.meta.env.VITE_API_URL;
const cloudinaryUploadUrl = import.meta.env.VITE_CLOUDINARY_UPLOAD_URL;
const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

let isLoggingOutDueTo401 = false;

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const errorCode =
        error.response.data?.error || error.response.data?.message;
      const url: string = error.config?.url || "";
      const method: string = (error.config?.method || "").toLowerCase();
      const isAuthLogin =
        url.includes("/api/v1/auth/web/login") && method === "post";
      const isAuthRegister =
        url.includes("/api/v1/auth/web/register") && method === "post";
      const isAuthEndpoint = isAuthLogin || isAuthRegister;
      const hasToken = !!useAuthStore.getState().user?.token;

      if (
        error.response.status === 401 ||
        errorCode === "AUTH_UNAUTHORIZED" ||
        errorCode === "AUTH_AUTHORIZATION_REQUIRED" ||
        errorCode === "AUTH_INVALID_TOKEN" ||
        errorCode === "AUTH_INVALID_CREDENTIALS" ||
        errorCode === "AUTH_USER_NOT_FOUND" ||
        errorCode === "AUTH_USER_BLOCKED" ||
        errorCode === "AUTH_USER_NOT_REGISTERED_WITH_EMAIL_PASSWORD" ||
        errorCode === "AUTH_EMAIL_ALREADY_IN_USE"
      ) {
        if (!isAuthEndpoint && hasToken && !isLoggingOutDueTo401) {
          isLoggingOutDueTo401 = true;
          try {
            useAuthStore.getState().clearUser();
          } catch {}
          setTimeout(() => {
            window.location.href = "/";
            isLoggingOutDueTo401 = false;
            toast.info(i18n.t("common.sessionExpired"));
          }, 0);
        }
        return Promise.reject(error);
      }
      if (!isAuthEndpoint) {
        if (
          errorCode &&
          typeof errorCode === "string" &&
          i18n.exists(`errorCodes.${errorCode}`)
        ) {
          toast.error(i18n.t(`errorCodes.${errorCode}`));
        } else if (errorCode) {
          toast.error(errorCode);
        } else {
          toast.error(i18n.t("common.error"));
        }
      }
    } else if (error.request) {
      toast.error(i18n.t("errorCodes.COMMON_SERVER_ERROR"));
    } else {
      toast.error(i18n.t("common.error"));
    }
    return Promise.reject(error);
  }
);

export async function fetchUsers(): Promise<User[]> {
  const user = useAuthStore.getState().user;

  const { data } = await axios.get<User[]>(`${apiUrl}/api/v1/admin/users`, {
    headers: {
      Authorization: `Bearer ${user?.token}`,
      "Content-Type": "application/json"
    }
  });

  return data;
}

export async function registerUser(email: string, password: string, givenName?: string, familyName?: string) {
  const { data } = await axios.post(`${apiUrl}/api/v1/auth/web/register`, {
    email,
    password,
    givenName,
    familyName
  });

  useAuthStore.getState().setUser(data);

  return data.user;
}

export async function loginUser(email: string, password: string) {
  const { data } = await axios.post(`${apiUrl}/api/v1/auth/web/login`, {
    email,
    password
  });

  useAuthStore.getState().setUser(data);

  return data;
}

export async function getProfile() {
  const user = useAuthStore.getState().user;

  const { data } = await axios.get(`${apiUrl}/api/v1/user/profile`, {
    headers: {
      Authorization: `Bearer ${user?.token}`,
      "Content-Type": "application/json"
    }
  });

  useAuthStore.getState().setUser(data);

  return data;
}

export async function updateProfile(payload: ProfileSchema) {
  const user = useAuthStore.getState().user;

  const { data } = await axios.patch(
    `${apiUrl}/api/v1/user/profile`,
    { ...payload },
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json"
      }
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
      "Content-Type": "application/json"
    }
  });

  return data;
}

export async function processUsersBatch(ids: string[], action: string) {
  const user = useAuthStore.getState().user;

  const res = await axios.patch(
    `${apiUrl}/api/v1/admin/users/batch`,
    {
      ids,
      action
    },
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json"
      }
    }
  );

  return res.data;
}

export function handleSSOLogin(
  provider: string,
  navigate: (path: string) => void
) {
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
      toast.error(i18n.t(`errorCodes.${error}`));
    }

    window.removeEventListener("message", handleMessage);
  };

  window.addEventListener("message", handleMessage);
}

export async function fetchInventories(): Promise<Inventory[]> {
  const { data } = await axios.get<Inventory[]>(`${apiUrl}/api/v1/inventories`);
  return data;
}

export async function fetchItems(inventoryId: string): Promise<Item[]> {
  const { data } = await axios.get<Item[]>(
    `${apiUrl}/api/v1/inventories/${inventoryId}/items`
  );
  return data;
}

export async function fetchMyInventories(type: string): Promise<Inventory[]> {
  const user = useAuthStore.getState().user;
  const { data } = await axios.get<Inventory[]>(
    `${apiUrl}/api/v1/inventories/me?type=${type}`,
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json"
      }
    }
  );
  return data;
}

export async function fetchInventoryById(id: string): Promise<Inventory> {
  const user = useAuthStore.getState().user;
  let path = "external";
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (user?.token) {
    headers["Authorization"] = `Bearer ${user.token}`;
    path = "internal";
  }
  const { data } = await axios.get<Inventory>(
    `${apiUrl}/api/v1/inventories/${path}/${id}`,
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json"
      }
    }
  );
  return data;
}

export async function fetchItemById(id: string): Promise<Item> {
  const user = useAuthStore.getState().user;
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (user?.token) {
    headers.Authorization = `Bearer ${user.token}`;
  }
  const { data } = await axios.get<Item>(`${apiUrl}/api/v1/items/${id}`, {
    headers
  });
  return data;
}

export async function loadMessages(inventoryId: string) {
  const { data } = await axios.get(
    `${apiUrl}/api/v1/inventories/${inventoryId}/messages`
  );
  return data.reverse();
}

export async function updateInventory(
  id: string,
  payload: InventorySettingSchema
): Promise<Inventory> {
  const user = useAuthStore.getState().user;
  const { data } = await axios.patch<Inventory>(
    `${apiUrl}/api/v1/inventories/${id}`,
    { ...payload },
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json"
      }
    }
  );
  return data;
}

export async function createInventory(
  payload: InventorySettingSchema
): Promise<Inventory> {
  const user = useAuthStore.getState().user;
  const { data } = await axios.post<Inventory>(
    `${apiUrl}/api/v1/inventories`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json"
      }
    }
  );
  return data;
}

export async function deleteInventory(id: string) {
  const user = useAuthStore.getState().user;
  const { data } = await axios.delete(`${apiUrl}/api/v1/inventories/${id}`, {
    headers: {
      Authorization: `Bearer ${user?.token}`,
      "Content-Type": "application/json"
    }
  });
  return data;
}

export async function createItem(
  payload: any,
  inventoryId: string
): Promise<Inventory> {
  const user = useAuthStore.getState().user;
  const { data } = await axios.post<Inventory>(
    `${apiUrl}/api/v1/inventories/${inventoryId}/items`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json"
      }
    }
  );
  return data;
}

export async function updateItem(id: string, payload: any) {
  const user = useAuthStore.getState().user;
  const { data } = await axios.patch<Item>(
    `${apiUrl}/api/v1/items/${id}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json"
      }
    }
  );
  return data;
}

export async function deleteItem(id: string) {
  const user = useAuthStore.getState().user;
  const { data } = await axios.delete(`${apiUrl}/api/v1/items/${id}`, {
    headers: {
      Authorization: `Bearer ${user?.token}`,
      "Content-Type": "application/json"
    }
  });
  return data;
}

export async function batchDeleteItems(inventoryId: string, ids: string[]) {
  const user = useAuthStore.getState().user;
  const { data } = await axios.delete(
    `${apiUrl}/api/v1/inventories/${inventoryId}/items`,
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json"
      },
      data: { ids }
    }
  );
  return data;
}

export async function fetchInventoryStats(id: string) {
  const { data } = await axios.get(`${apiUrl}/api/v1/inventories/${id}/stats`);
  return data as {
    totalItems: number;
    perField: Array<
      | {
          fieldId: string;
          label: string;
          type: "number";
          stats: {
            count: number;
            avg: number | null;
            min: number | null;
            max: number | null;
          };
        }
      | {
          fieldId: string;
          label: string;
          type: "boolean";
          stats: { true: number; false: number };
        }
      | {
          fieldId: string;
          label: string;
          type: string;
          stats: { topValues: { value: string; count: number }[] };
        }
    >;
  };
}

export async function listTags(q: string) {
  const { data } = await axios.get(`${apiUrl}/api/v1/tags`, { params: { q } });
  return (data?.data ?? []) as Array<{ id: string; name: string }>;
}

export async function createTag(name: string) {
  const user = useAuthStore.getState().user;
  const { data } = await axios.post(
    `${apiUrl}/api/v1/tags`,
    { name },
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json"
      }
    }
  );
  return (data?.data ?? data) as { id: string; name: string };
}

export async function fetchTagCloud() {
  const { data } = await axios.get(`${apiUrl}/api/v1/tags/cloud`);
  return data as Array<{ id: string; name: string; count: number }>;
}

export async function likeItem(id: string) {
  const user = useAuthStore.getState().user;
  const { data } = await axios.post(
    `${apiUrl}/api/v1/items/${id}/like`,
    {},
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json"
      }
    }
  );
  return data as { likes: number; likedByMe: boolean };
}

export async function unlikeItem(id: string) {
  const user = useAuthStore.getState().user;
  const { data } = await axios.delete(`${apiUrl}/api/v1/items/${id}/like`, {
    headers: {
      Authorization: `Bearer ${user?.token}`,
      "Content-Type": "application/json"
    }
  });
  return data as { likes: number; likedByMe: boolean };
}

export async function loadDashboard() {
  const { data } = await axios.get(`${apiUrl}/api/v1/dashboard`);
  return data;
}

export async function loadCodeLists() {
  const { data } = await axios.get(`${apiUrl}/api/v1/config`);
  return data;
}

export async function searchAll(query: string) {
  const { data } = await axios.get(`${apiUrl}/api/v1/search`, {
    params: { q: query }
  });
  return data as {
    inventories: Array<{
      id: string;
      title: string;
      description?: string | null;
      category: string;
      imageUrl?: string | null;
      createdAt: string;
    }>;
    items: Array<{
      id: string;
      inventoryId: string;
      inventoryTitle: string;
      createdAt: string;
      customId?: string;
      likes?: number;
    }>;
  };
}

export async function uploadFile(file: File): Promise<string | null> {
  if (!cloudinaryUploadUrl || !cloudinaryUploadPreset) {
    console.error("Cloudinary environment variables are not set.");
    toast.error(i18n.t("itemForm.uploadFailed"));
    return null;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryUploadPreset);

    const res = await axios.post(cloudinaryUploadUrl, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    return res.data.secure_url || null;
  } catch (e: any) {
    console.error("Cloudinary upload failed:", e.response?.data || e.message);
    toast.error(i18n.t("itemForm.uploadFailed"));
    return null;
  }
}

export async function syncMeToSalesforce(payload: { accountName?: string; phone?: string; companyWebsite?: string }): Promise<{ accountId: string; contactId: string; user?: any }> {
  const user = useAuthStore.getState().user;
  const { data } = await axios.post(
    `${apiUrl}/api/v1/integrations/salesforce/sync-me`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json"
      }
    }
  );
  return data as { accountId: string; contactId: string; user?: any };
}

export async function createSupportTicket(payload: {
  summary: string;
  priority: "High" | "Average" | "Low";
  link: string;
  inventoryId?: string | null;
  adminEmails: string[];
}) {
  const user = useAuthStore.getState().user;
  const { data } = await axios.post(
    `${apiUrl}/api/v1/integrations/ticket`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json"
      }
    }
  );
  return data as { ok: boolean; path: string; id?: string | null };
}
