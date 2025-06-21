import {
  Room,
  RoomEvent,
  RemoteParticipant,
  LocalParticipant,
  LocalAudioTrack,
  createLocalAudioTrack,
  ConnectionState,
  TrackPublication,
  Participant,
  RemoteTrackPublication,
  RemoteTrack,
  Track,
  RemoteAudioTrack,
} from 'livekit-client';

export interface VoiceChatOptions {
  token: string;
  wsUrl: string;
  onParticipantConnected?: (participant: RemoteParticipant) => void;
  onParticipantDisconnected?: (participant: RemoteParticipant) => void;
  onConnectionStateChanged?: (state: string) => void;
  onError?: (error: Error) => void;
}

export class VoiceChatService {
  private room: Room;
  private audioTrack: LocalAudioTrack | null = null;
  private localParticipant: LocalParticipant | null = null;

  constructor() {
    this.room = new Room({
        adaptiveStream: true,
        dynacast: true,
    });
  }

  async connect(options: VoiceChatOptions): Promise<void> {
    try {
        console.log("Setting up room event listeners...");
        if (options.onParticipantConnected) {
            this.room.on(RoomEvent.ParticipantConnected, options.onParticipantConnected);
        }
        if (options.onParticipantDisconnected) {
            this.room.on(RoomEvent.ParticipantDisconnected, options.onParticipantDisconnected);
        }
      this.room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        console.log("Room connection state changed to:", state);
        options.onConnectionStateChanged?.(state.toString());
        if (state === ConnectionState.Connected) {
            this.localParticipant = this.room.localParticipant;
            console.log("Local participant set:", this.localParticipant?.identity);
        }
      });
      this.room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
          if (track.kind === Track.Kind.Audio) {
            track.attach();
          }
      });

      console.log("Connecting to room with URL:", options.wsUrl);
      await this.room.connect(options.wsUrl, options.token);
      this.localParticipant = this.room.localParticipant;
      console.log("Connected to room. Local participant:", this.localParticipant?.identity);
    } catch (error) {
      console.error('Failed to connect to voice chat:', error);
      options.onError?.(error as Error);
      throw error;
    }
  }
  
  async publishAudio(): Promise<void> {
      try {
        if (!this.localParticipant) {
          console.log("Local participant is null, waiting for it to be set...");
          // Kısa bir süre bekle ve tekrar dene
          await new Promise(resolve => setTimeout(resolve, 100));
          if (!this.localParticipant) {
            console.error("Cannot publish audio: localParticipant is still null after waiting");
            return;
          }
        }
        
        console.log("Creating local audio track...");
        this.audioTrack = await createLocalAudioTrack({
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
        });
        
        console.log("Publishing audio track...");
        await this.localParticipant.publishTrack(this.audioTrack);
        console.log("Audio track published successfully");
      } catch (error) {
          console.error("Failed to publish audio:", error);
          throw error;
      }
  }

  async disconnect(): Promise<void> {
    if (this.audioTrack) {
        this.audioTrack.stop();
        this.localParticipant?.unpublishTrack(this.audioTrack);
        this.audioTrack = null;
    }
    await this.room.disconnect();
    this.localParticipant = null;
  }

  async setMicrophoneEnabled(enabled: boolean): Promise<void> {
    if(this.localParticipant){
      await this.localParticipant.setMicrophoneEnabled(enabled);
    }
  }

  setAllParticipantsMuted(muted: boolean): void {
      this.room.remoteParticipants.forEach(p => {
          p.trackPublications.forEach((t: RemoteTrackPublication) => {
              if(t.track && t.kind === Track.Kind.Audio) {
                const audioTrack = t.track as RemoteAudioTrack;
                audioTrack.setVolume(muted ? 0 : 1);
              }
          });
      });
  }

  setParticipantVolume(participantSid: string, volume: number): void {
      const participant = this.room.getParticipantByIdentity(participantSid);
      if(participant && participant instanceof RemoteParticipant) {
          participant.trackPublications.forEach((t: RemoteTrackPublication) => {
            if (t.track && t.kind === Track.Kind.Audio) {
                const audioTrack = t.track as RemoteAudioTrack;
                audioTrack.setVolume(volume / 100);
            }
          });
      }
  }

  getParticipants(): Array<LocalParticipant | RemoteParticipant> {
    const participants: Array<LocalParticipant | RemoteParticipant> = [];
    
    // Local participant'ı ekle
    if (this.localParticipant) {
      participants.push(this.localParticipant);
    } else if (this.room.localParticipant) {
      // Eğer localParticipant henüz set edilmemişse, room'dan al
      participants.push(this.room.localParticipant);
    }
    
    // Remote participant'ları ekle
    participants.push(...Array.from(this.room.remoteParticipants.values()));
    
    console.log('getParticipants called:', {
      localParticipant: this.localParticipant?.identity || 'null',
      roomLocalParticipant: this.room.localParticipant?.identity || 'null',
      remoteParticipantsCount: this.room.remoteParticipants.size,
      totalParticipants: participants.length
    });
    
    return participants;
  }

  isMuted(): boolean {
    return this.localParticipant?.isMicrophoneEnabled === false;
  }
}
