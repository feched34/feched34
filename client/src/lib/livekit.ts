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
  Track,
} from 'livekit-client';

export interface VoiceChatOptions {
  token: string;
  wsUrl: string;
  onParticipantConnected?: (participant: RemoteParticipant) => void;
  onParticipantDisconnected?: (participant: RemoteParticipant) => void;
  onTrackMuted?: (publication: TrackPublication, participant: Participant) => void;
  onTrackUnmuted?: (publication: TrackPublication, participant: Participant) => void;
  onConnectionStateChanged?: (state: string) => void;
  onError?: (error: Error) => void;
}

export class VoiceChatService {
  private room: Room;
  private audioTrack: LocalAudioTrack | null = null;

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

      this.room.on(RoomEvent.TrackMuted, (publication: TrackPublication, participant: Participant) => {
        console.log('Track muted:', publication.kind, participant.identity);
        options.onTrackMuted?.(publication, participant);
      });

      this.room.on(RoomEvent.TrackUnmuted, (publication: TrackPublication, participant: Participant) => {
        console.log('Track unmuted:', publication.kind, participant.identity);
        options.onTrackUnmuted?.(publication, participant);
      });

      this.room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        console.log('Connection state changed:', state);
        options.onConnectionStateChanged?.(state.toString());
      });

      this.room.on(RoomEvent.RoomMetadataChanged, (metadata) => {
        console.log('Room metadata changed:', metadata);
      });

      this.room.on(RoomEvent.LocalTrackPublished, (publication) => {
        console.log('Local track published:', publication.kind, publication.source);
      });

      this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        console.log('Track subscribed:', track.kind, 'from', participant.identity);
        if (track.kind === 'audio') {
          console.log('Audio track subscribed, enabling audio playback');
          track.attach();
        }
      });

      this.room.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from room');
      });

      console.log('Connecting to LiveKit with URL:', options.wsUrl);
      console.log('Token length:', options.token.length);
      
      // Connect to room
      await this.room.connect(options.wsUrl, options.token);
      console.log('LiveKit room connected successfully');

      // Create and publish audio track manually
      console.log('Creating local audio track...');
      this.audioTrack = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });
      console.log('Audio track created:', this.audioTrack);

      // Publish the audio track
      console.log('Publishing audio track...');
      await this.room.localParticipant.publishTrack(this.audioTrack);
      console.log('Audio track published successfully');

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
    const localParticipant = this.room.localParticipant;
    const currentlyEnabled = localParticipant.isMicrophoneEnabled;
    
    await localParticipant.setMicrophoneEnabled(!currentlyEnabled);
    return currentlyEnabled; // Return the new muted state (inverted)
  }

  getParticipants(): Array<LocalParticipant | RemoteParticipant> {
    return [this.room.localParticipant, ...Array.from(this.room.remoteParticipants.values())];
  }

  getConnectionState(): string {
    return this.room.state.toString();
  }

  isMuted(): boolean {
    return !this.room.localParticipant.isMicrophoneEnabled;
  }
}
