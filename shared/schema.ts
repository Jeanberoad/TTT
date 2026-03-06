import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const configurations = pgTable("configurations", {
  id: serial("id").primaryKey(),
  wifiName: text("wifi_name").default(""),
  subtitle: text("subtitle").default(""),
  supportText: text("support_text").default(""),
  footerText: text("footer_text").default(""),
  footerTextRight: text("footer_text_right").default(""),
  ticketsPerPage: integer("tickets_per_page").default(12),
  baseHost: text("base_host").default(""),
  logoUrl: text("logo_url").default(""),
  template: text("template").default("modern"),
  qrStyle: text("qr_style").default("classic"),
  primaryColor: text("primary_color").default("#0ea5e9"),
  textColor: text("text_color").default("#0f172a"),
  backgroundColor: text("background_color").default("#ffffff"),
  borderRadius: integer("border_radius").default(16),
  borderWidth: integer("border_width").default(2),
  fontSize: integer("font_size").default(14),
  ticketWidth: integer("ticket_width").default(350),
  ticketHeight: integer("ticket_height").default(240),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConfigurationSchema = createInsertSchema(configurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Configuration = typeof configurations.$inferSelect;
export type InsertConfiguration = typeof configurations.$inferInsert;
export type UpdateConfigurationRequest = z.infer<typeof insertConfigurationSchema>;
