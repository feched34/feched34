import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertParticipantSchema, type LiveKitTokenRequest, type LiveKitTokenResponse } from "@shared/schema";
import { AccessToken } from "livekit-server-sdk";

interface ExtendedWebSocket extends WebSocket {
  roomId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time participant updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // LiveKit configuration
  const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
  const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
  const LIVEKIT_WS_URL = process.env.LIVEKIT_WS_URL;

  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_WS_URL) {
    console.error("Missing required LiveKit environment variables");
    console.error("LIVEKIT_API_KEY:", !!LIVEKIT_API_KEY);
    console.error("LIVEKIT_API_SECRET:", !!LIVEKIT_API_SECRET);
    console.error("LIVEKIT_WS_URL:", !!LIVEKIT_WS_URL);
  }

  // Generate LiveKit token
  app.post("/api/token", async (req, res) => {
    try {
      const { nickname, roomName }: LiveKitTokenRequest = req.body;

      if (!nickname || !roomName) {
        return res.status(400).json({ message: "Nickname and room name are required" });
      }

      // Create access token
      console.log(`Creating token for user: ${nickname}, room: ${roomName}`);
      const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
        identity: nickname,
        ttl: '1h',
      });

      token.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      });

      const jwt = await token.toJwt();
      console.log(`Generated token for ${nickname}: ${jwt.substring(0, 50)}...`);

      // Add participant to storage
      await storage.createParticipant({
        nickname,
        roomId: roomName,
      });

      // Broadcast participant update
      broadcastParticipantUpdate(roomName);

      const response: LiveKitTokenResponse = {
        token: jwt,
        wsUrl: LIVEKIT_WS_URL,
      };

      res.json(response);
    } catch (error) {
      console.error("Error generating token:", error);
      res.status(500).json({ message: "Failed to generate token" });
    }
  });

  // Get participants for a room
  app.get("/api/rooms/:roomId/participants", async (req, res) => {
    try {
      const { roomId } = req.params;
      const participants = await storage.getParticipantsByRoom(roomId);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });

  // Update participant mute status
  app.patch("/api/participants/:id/mute", async (req, res) => {
    try {
      const { id } = req.params;
      const { isMuted } = req.body;

      await storage.updateParticipantMute(parseInt(id), isMuted);

      const participant = await storage.getParticipant(parseInt(id));
      if (participant) {
        broadcastParticipantUpdate(participant.roomId);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating participant:", error);
      res.status(500).json({ message: "Failed to update participant" });
    }
  });

  // Remove participant
  app.delete("/api/participants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const participant = await storage.getParticipant(parseInt(id));
      
      if (participant) {
        await storage.removeParticipant(parseInt(id));
        broadcastParticipantUpdate(participant.roomId);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error removing participant:", error);
      res.status(500).json({ message: "Failed to remove participant" });
    }
  });

  // WebSocket connection handling
  wss.on('connection', (ws: ExtendedWebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', async (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'join_room') {
          // Handle room join
          ws.roomId = data.roomId;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Broadcast participant updates to WebSocket clients
  function broadcastParticipantUpdate(roomId: string) {
    wss.clients.forEach((client: ExtendedWebSocket) => {
      if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
        storage.getParticipantsByRoom(roomId).then(participants => {
          client.send(JSON.stringify({
            type: 'participants_update',
            participants
          }));
        });
      }
    });
  }

  return httpServer;
}
