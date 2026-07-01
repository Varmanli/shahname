export type ContactMessageStatus = "new" | "read" | "archived";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
  updatedAt: string;
};

export type ContactMessageInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};
