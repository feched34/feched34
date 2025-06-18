import {
  Room,
  RoomEvent,
  RemoteParticipant,
  LocalParticipant,
  Track,
  createLocalAudioTrack,
} from 'livekit-client';

export interface VoiceChatOptions {
  token: string;
  wsUrl: string;
  onParticipantConnected?: (participant: RemoteParticipant) => void;
  onParticipantDisconnected?: (participant: RemoteParticipant) => void;
  onTrackMuted?: (track: Track, participant?: RemoteParticipant) => void;
  onTrackUnmuted?: (track: Track, participant?: RemoteParticipant) => void;
  onConnectionStateChanged?: (state: string) => void;
  onError?: (error: Error) => void;
}

export class VoiceChatService {
  private room: Room;
  private audioTrack: Track | null = null;

  constructor() {
    this.room = new Room();
  }

  async connect(options: VoiceChatOptions): Promise<void> {
    try {
      // Set up event listeners
      this.room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
        console.log('Participant connected:', participant.identity);
        options.onParticipantConnected?.(participant);
      });

      this.room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
        console.log('Participant disconnected:', participant.identity);
        options.onParticipantDisconnected?.(participant);
      });

      this.room.on(RoomEvent.TrackMuted, (track: Track, participant?: RemoteParticipant) => {
        console.log('Track muted:', track.kind, participant?.identity);
        options.onTrackMuted?.(track, participant);
      });

      this.room.on(RoomEvent.TrackUnmuted, (track: Track, participant?: RemoteParticipant) => {
        console.log('Track unmuted:', track.kind, participant?.identity);
        options.onTrackUnmuted?.(track, participant);
      });

      this.room.on(RoomEvent.ConnectionStateChanged, (state) => {
        console.log('Connection state changed:', state);
        options.onConnectionStateChanged?.(state.toString());
      });

      this.room.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from room');
      });

      // Connect to room
      await this.room.connect(options.wsUrl, options.token);

      // Create and publish audio track
      this.audioTrack = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });

      await this.room.localParticipant.publishTrack(this.audioTrack);

      console.log('Connected to voice chat room');
    } catch (error) {
      console.error('Failed to connect to voice chat:', error);
      options.onError?.(error as Error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.audioTrack) {
      this.audioTrack.stop();
      this.audioTrack = null;
    }
    await this.room.disconnect();
  }

  async toggleMute(): Promise<boolean> {
    if (!this.audioTrack) return false;

    const isMuted = this.audioTrack.isMuted;
    await this.audioTrack.setMuted(!isMuted);
    return !isMuted;
  }

  getParticipants(): Array<LocalParticipant | RemoteParticipant> {
    return [this.room.localParticipant, ...Array.from(this.room.remoteParticipants.values())];
  }

  getConnectionState(): string {
    return this.room.state.toString();
  }

  isMuted(): boolean {
    return this.audioTrack?.isMuted ?? false;
  }
}
