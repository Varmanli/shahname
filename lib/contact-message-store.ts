import { randomUUID } from "node:crypto";

import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/server/db";
import { contactMessages } from "@/lib/server/db/schema";
import type {
  ContactMessage,
  ContactMessageInput,
} from "@/types/contact-message";

export async function readContactMessages(): Promise<ContactMessage[]> {
  return db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt));
}

export async function writeContactMessages(messages: ContactMessage[]) {
  await db.transaction(async (tx) => {
    await tx.delete(contactMessages);
    if (messages.length) {
      await tx.insert(contactMessages).values(messages);
    }
  });
}

export async function createContactMessage(input: ContactMessageInput) {
  const now = new Date().toISOString();
  const [message] = await db
    .insert(contactMessages)
    .values({
      ...input,
      id: randomUUID(),
      status: "new",
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return message;
}

export async function updateContactMessage(
  id: string,
  patch: Partial<Pick<ContactMessage, "status">>,
) {
  const [message] = await db
    .update(contactMessages)
    .set({
      ...(patch.status ? { status: patch.status } : {}),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(contactMessages.id, id))
    .returning();

  return message ?? null;
}

export async function deleteContactMessage(id: string) {
  const deleted = await db
    .delete(contactMessages)
    .where(eq(contactMessages.id, id))
    .returning();

  return deleted.length > 0;
}
