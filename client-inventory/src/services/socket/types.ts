export interface User {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  salesforceAccountId?: string;
}

export interface Message {
  id: string;
  inventoryId: string;
  user: User;
  userId: string;
  text: string;
  createdAt: string;
}
