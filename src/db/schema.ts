import { pgTable, text, timestamp, date } from "drizzle-orm/pg-core";

export const persons = pgTable("persons", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  idNumber: text("id_number").notNull(),
  mhrsPassword: text("mhrs_password"),
  eDevletPassword: text("e_devlet_password"),
  eNabizPassword: text("e_nabiz_password"),
  dateOfBirth: date("date_of_birth"),
  notes: text("notes"),
  appointmentDate: timestamp("appointment_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});