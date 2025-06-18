import { 
  users, 
  gameSessions, 
  playerStates, 
  marketListings, 
  tradeOffers, 
  chatMessages, 
  gameActivities,
  type User, 
  type InsertUser,
  type GameSession,
  type PlayerState,
  type MarketListing,
  type TradeOffer,
  type ChatMessage,
  type GameActivity
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserOnlineStatus(id: number, isOnline: boolean): Promise<void>;
  
  // Game session operations
  getOrCreateSession(name: string): Promise<GameSession>;
  getSessionPlayers(sessionId: number): Promise<User[]>;
  
  // Player state operations
  getPlayerState(userId: number, sessionId: number): Promise<PlayerState | undefined>;
  updatePlayerState(userId: number, sessionId: number, state: Partial<PlayerState>): Promise<PlayerState>;
  createPlayerState(userId: number, sessionId: number): Promise<PlayerState>;
  
  // Market operations
  getMarketListings(sessionId: number): Promise<(MarketListing & { seller: User })[]>;
  createMarketListing(listing: Omit<MarketListing, 'id' | 'createdAt'>): Promise<MarketListing>;
  deleteMarketListing(id: number): Promise<void>;
  
  // Trade operations
  createTradeOffer(offer: Omit<TradeOffer, 'id' | 'createdAt'>): Promise<TradeOffer>;
  getTradeOffersForUser(userId: number, sessionId: number): Promise<TradeOffer[]>;
  updateTradeOfferStatus(id: number, status: string): Promise<void>;
  
  // Chat operations
  getChatMessages(sessionId: number, limit?: number): Promise<(ChatMessage & { user: User })[]>;
  createChatMessage(message: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage>;
  
  // Activity operations
  createGameActivity(activity: Omit<GameActivity, 'id' | 'createdAt'>): Promise<GameActivity>;
  getRecentActivities(sessionId: number, limit?: number): Promise<(GameActivity & { user: User })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private sessions: Map<number, GameSession> = new Map();
  private playerStates: Map<string, PlayerState> = new Map();
  private marketListings: Map<number, MarketListing> = new Map();
  private tradeOffers: Map<number, TradeOffer> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  private activities: Map<number, GameActivity> = new Map();
  
  private currentUserId = 1;
  private currentSessionId = 1;
  private currentListingId = 1;
  private currentTradeId = 1;
  private currentMessageId = 1;
  private currentActivityId = 1;

  constructor() {
    // Create default session
    this.sessions.set(1, {
      id: 1,
      name: "Alpha-7",
      maxPlayers: 20,
      createdAt: new Date()
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      isOnline: true,
      lastSeen: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserOnlineStatus(id: number, isOnline: boolean): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.isOnline = isOnline;
      user.lastSeen = new Date();
    }
  }

  async getOrCreateSession(name: string): Promise<GameSession> {
    const existing = Array.from(this.sessions.values()).find(s => s.name === name);
    if (existing) return existing;
    
    const id = this.currentSessionId++;
    const session: GameSession = {
      id,
      name,
      maxPlayers: 20,
      createdAt: new Date()
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSessionPlayers(sessionId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => 
      this.playerStates.has(`${user.id}-${sessionId}`)
    );
  }

  private getPlayerStateKey(userId: number, sessionId: number): string {
    return `${userId}-${sessionId}`;
  }

  async getPlayerState(userId: number, sessionId: number): Promise<PlayerState | undefined> {
    return this.playerStates.get(this.getPlayerStateKey(userId, sessionId));
  }

  async createPlayerState(userId: number, sessionId: number): Promise<PlayerState> {
    const state: PlayerState = {
      id: Date.now(),
      userId,
      sessionId,
      money: 10,
      clickPower: 1,
      materials: {},
      unlockedMaterials: ["hydrogen", "carbon", "oxygen"],
      discoveredItems: {},
      craftedItems: {},
      totalDiscoveries: 0
    };
    this.playerStates.set(this.getPlayerStateKey(userId, sessionId), state);
    return state;
  }

  async updatePlayerState(userId: number, sessionId: number, updates: Partial<PlayerState>): Promise<PlayerState> {
    const key = this.getPlayerStateKey(userId, sessionId);
    const existing = this.playerStates.get(key);
    if (!existing) {
      throw new Error('Player state not found');
    }
    
    const updated = { ...existing, ...updates };
    this.playerStates.set(key, updated);
    return updated;
  }

  async getMarketListings(sessionId: number): Promise<(MarketListing & { seller: User })[]> {
    const listings = Array.from(this.marketListings.values())
      .filter(listing => listing.sessionId === sessionId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    
    return listings.map(listing => ({
      ...listing,
      seller: this.users.get(listing.sellerId)!
    }));
  }

  async createMarketListing(listing: Omit<MarketListing, 'id' | 'createdAt'>): Promise<MarketListing> {
    const id = this.currentListingId++;
    const newListing: MarketListing = {
      ...listing,
      id,
      createdAt: new Date()
    };
    this.marketListings.set(id, newListing);
    return newListing;
  }

  async deleteMarketListing(id: number): Promise<void> {
    this.marketListings.delete(id);
  }

  async createTradeOffer(offer: Omit<TradeOffer, 'id' | 'createdAt'>): Promise<TradeOffer> {
    const id = this.currentTradeId++;
    const newOffer: TradeOffer = {
      ...offer,
      id,
      createdAt: new Date()
    };
    this.tradeOffers.set(id, newOffer);
    return newOffer;
  }

  async getTradeOffersForUser(userId: number, sessionId: number): Promise<TradeOffer[]> {
    return Array.from(this.tradeOffers.values()).filter(offer => 
      offer.sessionId === sessionId && 
      (offer.fromUserId === userId || offer.toUserId === userId)
    );
  }

  async updateTradeOfferStatus(id: number, status: string): Promise<void> {
    const offer = this.tradeOffers.get(id);
    if (offer) {
      offer.status = status;
    }
  }

  async getChatMessages(sessionId: number, limit = 50): Promise<(ChatMessage & { user: User })[]> {
    const messages = Array.from(this.chatMessages.values())
      .filter(msg => msg.sessionId === sessionId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime())
      .slice(-limit);
    
    return messages.map(message => ({
      ...message,
      user: this.users.get(message.userId)!
    }));
  }

  async createChatMessage(message: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage> {
    const id = this.currentMessageId++;
    const newMessage: ChatMessage = {
      ...message,
      id,
      createdAt: new Date()
    };
    this.chatMessages.set(id, newMessage);
    return newMessage;
  }

  async createGameActivity(activity: Omit<GameActivity, 'id' | 'createdAt'>): Promise<GameActivity> {
    const id = this.currentActivityId++;
    const newActivity: GameActivity = {
      ...activity,
      id,
      createdAt: new Date()
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  async getRecentActivities(sessionId: number, limit = 20): Promise<(GameActivity & { user: User })[]> {
    const activities = Array.from(this.activities.values())
      .filter(activity => activity.sessionId === sessionId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
    
    return activities.map(activity => ({
      ...activity,
      user: this.users.get(activity.userId)!
    }));
  }
}

export const storage = new MemStorage();
