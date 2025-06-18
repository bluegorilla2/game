import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertChatMessageSchema, insertTradeOfferSchema, insertMarketListingSchema } from "@shared/schema";

interface GameWebSocket extends WebSocket {
  userId?: number;
  sessionId?: number;
  username?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time multiplayer
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const connectedClients = new Map<number, GameWebSocket>();

  // Broadcast to all clients in a session
  function broadcastToSession(sessionId: number, message: any, excludeUserId?: number) {
    Array.from(connectedClients.values()).forEach(client => {
      if (client.sessionId === sessionId && 
          client.readyState === WebSocket.OPEN && 
          client.userId !== excludeUserId) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // WebSocket connection handling
  wss.on('connection', (ws: GameWebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'join':
            const { username, sessionName } = message;
            
            // Get or create user
            let user = await storage.getUserByUsername(username);
            if (!user) {
              user = await storage.createUser({ username, avatar: null });
            }
            
            // Get or create session
            const session = await storage.getOrCreateSession(sessionName || 'Alpha-7');
            
            // Update user online status
            await storage.updateUserOnlineStatus(user.id, true);
            
            // Get or create player state
            let playerState = await storage.getPlayerState(user.id, session.id);
            if (!playerState) {
              playerState = await storage.createPlayerState(user.id, session.id);
            }
            
            // Store connection info
            ws.userId = user.id;
            ws.sessionId = session.id;
            ws.username = username;
            connectedClients.set(user.id, ws);
            
            // Send initial data to client
            ws.send(JSON.stringify({
              type: 'joined',
              user,
              session,
              playerState,
              onlinePlayers: await storage.getSessionPlayers(session.id),
              chatMessages: await storage.getChatMessages(session.id),
              marketListings: await storage.getMarketListings(session.id),
              recentActivities: await storage.getRecentActivities(session.id)
            }));
            
            // Notify others
            broadcastToSession(session.id, {
              type: 'player_joined',
              user,
              onlinePlayers: await storage.getSessionPlayers(session.id)
            }, user.id);
            
            break;

          case 'chat_message':
            if (!ws.userId || !ws.sessionId) break;
            
            const chatMessage = await storage.createChatMessage({
              userId: ws.userId,
              sessionId: ws.sessionId,
              message: message.content
            });
            
            const messageWithUser = {
              ...chatMessage,
              user: await storage.getUser(ws.userId)
            };
            
            broadcastToSession(ws.sessionId, {
              type: 'new_chat_message',
              message: messageWithUser
            });
            
            break;

          case 'game_action':
            if (!ws.userId || !ws.sessionId) break;
            
            const { action, data } = message;
            const currentState = await storage.getPlayerState(ws.userId, ws.sessionId);
            if (!currentState) break;
            
            let updatedState = currentState;
            let activity = null;
            
            switch (action) {
              case 'click_money':
                updatedState = await storage.updatePlayerState(ws.userId, ws.sessionId, {
                  money: currentState.money + currentState.clickPower
                });
                break;
                
              case 'upgrade_click':
                const upgradeCost = Math.floor(10 * Math.pow(1.5, currentState.clickPower - 1));
                if (currentState.money >= upgradeCost) {
                  updatedState = await storage.updatePlayerState(ws.userId, ws.sessionId, {
                    money: currentState.money - upgradeCost,
                    clickPower: currentState.clickPower + 1
                  });
                }
                break;
                
              case 'buy_material':
                const materialPrices: Record<string, number> = {
                  hydrogen: 3, oxygen: 4, carbon: 4, iron: 60, gold: 300
                };
                const materialPrice = materialPrices[data.material] || 0;
                
                if (currentState.money >= materialPrice) {
                  const newMaterials = { ...currentState.materials as any };
                  newMaterials[data.material] = (newMaterials[data.material] || 0) + 1;
                  
                  updatedState = await storage.updatePlayerState(ws.userId, ws.sessionId, {
                    money: currentState.money - materialPrice,
                    materials: newMaterials
                  });
                }
                break;
                
              case 'craft_item':
                // Handle crafting logic
                const { selectedMaterials } = data;
                const canCraft = Object.entries(selectedMaterials).every(([mat, amt]: [string, any]) => 
                  (currentState.materials as any)[mat] >= amt
                );
                
                if (canCraft) {
                  const newMaterials = { ...currentState.materials as any };
                  Object.entries(selectedMaterials).forEach(([mat, amt]: [string, any]) => {
                    newMaterials[mat] -= amt;
                  });
                  
                  const itemKey = Object.entries(selectedMaterials)
                    .sort()
                    .map(([k, v]) => `${k}:${v}`)
                    .join(',');
                  
                  const newCraftedItems = { ...currentState.craftedItems as any };
                  newCraftedItems[itemKey] = (newCraftedItems[itemKey] || 0) + 1;
                  
                  const newDiscoveredItems = { ...currentState.discoveredItems as any };
                  if (!newDiscoveredItems[itemKey]) {
                    newDiscoveredItems[itemKey] = {
                      name: data.itemName,
                      value: data.itemValue,
                      materials: selectedMaterials,
                      discovered: new Date()
                    };
                    
                    activity = await storage.createGameActivity({
                      userId: ws.userId,
                      sessionId: ws.sessionId,
                      type: 'discovery',
                      description: `discovered ${data.itemName}`
                    });
                  }
                  
                  updatedState = await storage.updatePlayerState(ws.userId, ws.sessionId, {
                    materials: newMaterials,
                    craftedItems: newCraftedItems,
                    discoveredItems: newDiscoveredItems,
                    totalDiscoveries: Object.keys(newDiscoveredItems).length
                  });
                }
                break;
                
              case 'sell_to_market':
                const { itemKey, itemName, itemValue, materials, price } = data;
                const craftedItems = currentState.craftedItems as any;
                
                if (craftedItems[itemKey] && craftedItems[itemKey] > 0) {
                  const newCraftedItems = { ...craftedItems };
                  newCraftedItems[itemKey] -= 1;
                  
                  updatedState = await storage.updatePlayerState(ws.userId, ws.sessionId, {
                    craftedItems: newCraftedItems
                  });
                  
                  const listing = await storage.createMarketListing({
                    sellerId: ws.userId,
                    sessionId: ws.sessionId,
                    itemKey,
                    itemName,
                    itemValue,
                    price,
                    materials
                  });
                  
                  const marketListings = await storage.getMarketListings(ws.sessionId);
                  broadcastToSession(ws.sessionId, {
                    type: 'market_update',
                    marketListings
                  });
                  
                  activity = await storage.createGameActivity({
                    userId: ws.userId,
                    sessionId: ws.sessionId,
                    type: 'sale',
                    description: `listed ${itemName} for $${price}`
                  });
                }
                break;
            }
            
            // Send updated state to player
            ws.send(JSON.stringify({
              type: 'state_update',
              playerState: updatedState
            }));
            
            // Broadcast activity if created
            if (activity) {
              const activityWithUser = {
                ...activity,
                user: await storage.getUser(ws.userId)
              };
              
              broadcastToSession(ws.sessionId, {
                type: 'new_activity',
                activity: activityWithUser
              });
            }
            
            break;

          case 'trade_offer':
            if (!ws.userId || !ws.sessionId) break;
            
            const tradeOffer = await storage.createTradeOffer({
              fromUserId: ws.userId,
              toUserId: message.toUserId,
              sessionId: ws.sessionId,
              offerItems: message.offerItems,
              requestItems: message.requestItems,
              status: 'pending'
            });
            
            // Notify the target user
            const targetClient = connectedClients.get(message.toUserId);
            if (targetClient && targetClient.readyState === WebSocket.OPEN) {
              targetClient.send(JSON.stringify({
                type: 'trade_offer_received',
                offer: tradeOffer,
                fromUser: await storage.getUser(ws.userId)
              }));
            }
            
            break;

          case 'buy_from_market':
            if (!ws.userId || !ws.sessionId) break;
            
            const { listingId } = message;
            const currentPlayerState = await storage.getPlayerState(ws.userId, ws.sessionId);
            if (!currentPlayerState) break;
            
            const listings = await storage.getMarketListings(ws.sessionId);
            const listing = listings.find(l => l.id === listingId);
            
            if (listing && currentPlayerState.money >= listing.price) {
              // Update buyer's state
              const newCraftedItems = { ...currentPlayerState.craftedItems as any };
              newCraftedItems[listing.itemKey] = (newCraftedItems[listing.itemKey] || 0) + 1;
              
              await storage.updatePlayerState(ws.userId, ws.sessionId, {
                money: currentPlayerState.money - listing.price,
                craftedItems: newCraftedItems
              });
              
              // Update seller's money
              const sellerState = await storage.getPlayerState(listing.sellerId, ws.sessionId);
              if (sellerState) {
                await storage.updatePlayerState(listing.sellerId, ws.sessionId, {
                  money: sellerState.money + listing.price
                });
                
                // Notify seller
                const sellerClient = connectedClients.get(listing.sellerId);
                if (sellerClient && sellerClient.readyState === WebSocket.OPEN) {
                  sellerClient.send(JSON.stringify({
                    type: 'item_sold',
                    itemName: listing.itemName,
                    price: listing.price,
                    buyer: await storage.getUser(ws.userId)
                  }));
                }
              }
              
              // Remove listing
              await storage.deleteMarketListing(listingId);
              
              // Broadcast market update
              const updatedListings = await storage.getMarketListings(ws.sessionId);
              broadcastToSession(ws.sessionId, {
                type: 'market_update',
                marketListings: updatedListings
              });
              
              // Create activity
              await storage.createGameActivity({
                userId: ws.userId,
                sessionId: ws.sessionId,
                type: 'purchase',
                description: `bought ${listing.itemName} for $${listing.price}`
              });
            }
            
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', async () => {
      if (ws.userId && ws.sessionId) {
        await storage.updateUserOnlineStatus(ws.userId, false);
        connectedClients.delete(ws.userId);
        
        // Notify others
        broadcastToSession(ws.sessionId, {
          type: 'player_left',
          userId: ws.userId,
          onlinePlayers: await storage.getSessionPlayers(ws.sessionId)
        });
      }
    });
  });

  return httpServer;
}
