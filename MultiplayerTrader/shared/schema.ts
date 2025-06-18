import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  avatar: text("avatar"),
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen").defaultNow(),
});

export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  maxPlayers: integer("max_players").default(20),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playerStates = pgTable("player_states", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sessionId: integer("session_id").references(() => gameSessions.id).notNull(),
  money: integer("money").default(10),
  clickPower: integer("click_power").default(1),
  materials: jsonb("materials").default({}),
  unlockedMaterials: jsonb("unlocked_materials").default(["hydrogen", "carbon", "oxygen"]),
  discoveredItems: jsonb("discovered_items").default({}),
  craftedItems: jsonb("crafted_items").default({}),
  totalDiscoveries: integer("total_discoveries").default(0),
});

export const marketListings = pgTable("market_listings", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").references(() => users.id).notNull(),
  sessionId: integer("session_id").references(() => gameSessions.id).notNull(),
  itemKey: text("item_key").notNull(),
  itemName: text("item_name").notNull(),
  itemValue: integer("item_value").notNull(),
  price: integer("price").notNull(),
  materials: jsonb("materials").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tradeOffers = pgTable("trade_offers", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").references(() => users.id).notNull(),
  toUserId: integer("to_user_id").references(() => users.id).notNull(),
  sessionId: integer("session_id").references(() => gameSessions.id).notNull(),
  offerItems: jsonb("offer_items").notNull(),
  requestItems: jsonb("request_items").notNull(),
  status: text("status").default("pending"), // pending, accepted, declined, completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sessionId: integer("session_id").references(() => gameSessions.id).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameActivities = pgTable("game_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sessionId: integer("session_id").references(() => gameSessions.id).notNull(),
  type: text("type").notNull(), // discovery, sale, trade, etc.
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  avatar: true,
});

export const insertPlayerStateSchema = createInsertSchema(playerStates).omit({
  id: true,
});

export const insertMarketListingSchema = createInsertSchema(marketListings).omit({
  id: true,
  createdAt: true,
});

export const insertTradeOfferSchema = createInsertSchema(tradeOffers).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertGameActivitySchema = createInsertSchema(gameActivities).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameSession = typeof gameSessions.$inferSelect;
export type PlayerState = typeof playerStates.$inferSelect;
export type MarketListing = typeof marketListings.$inferSelect;
export type TradeOffer = typeof tradeOffers.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type GameActivity = typeof gameActivities.$inferSelect;
