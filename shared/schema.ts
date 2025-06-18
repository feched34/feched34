import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  nickname: text("nickname").notNull(),
  roomId: text("room_id").notNull(),
  isConnected: boolean("is_connected").notNull().default(true),
  isMuted: boolean("is_muted").notNull().default(false),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const insertParticipantSchema = createInsertSchema(participants).pick({
  nickname: true,
  roomId: true,
});

export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participants.$inferSelect;

export interface LiveKitTokenRequest {
  nickname: string;
  roomName: string;
}

export interface LiveKitTokenResponse {
  token: string;
  wsUrl: string;
}
