"use server";

import { db } from "@/db";
import { persons } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";

export type Person = typeof persons.$inferSelect;
export type InsertPerson = typeof persons.$inferInsert;

export async function getPersons() {
  return await db.select().from(persons).orderBy(desc(persons.appointmentDate));
}

export async function getPerson(id: string) {
  const result = await db.select().from(persons).where(eq(persons.id, id));
  return result[0];
}

export async function createPerson(data: Omit<InsertPerson, "id" | "createdAt" | "updatedAt">) {
  const id = uuidv4();
  
  // Format dates correctly for Drizzle insertion
  const payload = {
    id,
    ...data,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : null,
    appointmentDate: data.appointmentDate ? new Date(data.appointmentDate) : null,
  };

  await db.insert(persons).values(payload as any);
  revalidatePath("/");
  return id;
}

export async function updatePerson(id: string, data: Partial<Omit<InsertPerson, "id" | "createdAt" | "updatedAt">>) {
  const payload = {
    ...data,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : null,
    appointmentDate: data.appointmentDate ? new Date(data.appointmentDate) : null,
    updatedAt: new Date()
  };
  
  await db.update(persons).set(payload as any).where(eq(persons.id, id));
  revalidatePath("/");
  revalidatePath(`/person/${id}`);
}

export async function deletePerson(id: string) {
  await db.delete(persons).where(eq(persons.id, id));
  revalidatePath("/");
}

export async function importData(jsonData: Person[]) {
  for (const person of jsonData) {
    const payload = {
      ...person,
      dateOfBirth: person.dateOfBirth ? new Date(person.dateOfBirth).toISOString().split('T')[0] : null,
      appointmentDate: person.appointmentDate ? new Date(person.appointmentDate) : null,
      createdAt: person.createdAt ? new Date(person.createdAt) : new Date(),
      updatedAt: new Date()
    };
    
    const existing = await db.select().from(persons).where(eq(persons.id, person.id));
    if (existing.length > 0) {
      await db.update(persons).set(payload as any).where(eq(persons.id, person.id));
    } else {
      if (!payload.id) payload.id = uuidv4();
      await db.insert(persons).values(payload as any);
    }
  }
  revalidatePath("/");
}
