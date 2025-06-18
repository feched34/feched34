import { participants, type Participant, type InsertParticipant } from "@shared/schema";

export interface IStorage {
  getParticipant(id: number): Promise<Participant | undefined>;
  getParticipantsByRoom(roomId: string): Promise<Participant[]>;
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  updateParticipantConnection(id: number, isConnected: boolean): Promise<void>;
  updateParticipantMute(id: number, isMuted: boolean): Promise<void>;
  removeParticipant(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private participants: Map<number, Participant>;
  currentId: number;

  constructor() {
    this.participants = new Map();
    this.currentId = 1;
  }

  async getParticipant(id: number): Promise<Participant | undefined> {
    return this.participants.get(id);
  }

  async getParticipantsByRoom(roomId: string): Promise<Participant[]> {
    return Array.from(this.participants.values()).filter(
      (participant) => participant.roomId === roomId && participant.isConnected,
    );
  }

  async createParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const id = this.currentId++;
    const participant: Participant = {
      ...insertParticipant,
      id,
      isConnected: true,
      isMuted: false,
      joinedAt: new Date(),
    };
    this.participants.set(id, participant);
    return participant;
  }

  async updateParticipantConnection(id: number, isConnected: boolean): Promise<void> {
    const participant = this.participants.get(id);
    if (participant) {
      participant.isConnected = isConnected;
      this.participants.set(id, participant);
    }
  }

  async updateParticipantMute(id: number, isMuted: boolean): Promise<void> {
    const participant = this.participants.get(id);
    if (participant) {
      participant.isMuted = isMuted;
      this.participants.set(id, participant);
    }
  }

  async removeParticipant(id: number): Promise<void> {
    this.participants.delete(id);
  }
}

export const storage = new MemStorage();
