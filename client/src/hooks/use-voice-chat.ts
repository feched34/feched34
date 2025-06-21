import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { VoiceChatService } from '@/lib/livekit';
import { apiRequest } from '@/lib/queryClient';
import type { LiveKitTokenResponse, Participant } from '@shared/schema';
import { RemoteParticipant, LocalParticipant, ParticipantEvent, Track } from 'livekit-client';

export interface UseVoiceChatOptions {
  nickname: string;
  roomName?: string;
}

export interface VoiceChatState {
  isConnecting: boolean;
  isConnected: boolean;
  participants: Array<LocalParticipant | RemoteParticipant>;
  isMuted: boolean;
  isDeafened: boolean;
  connectionError: string | null;
  roomDuration: string;
}

export function useVoiceChat({ nickname, roomName = 'default-room' }: UseVoiceChatOptions) {
  const [state, setState] = useState<VoiceChatState>({
    isConnecting: false,
    isConnected: false,
    participants: [],
    isMuted: false,
    isDeafened: false,
    connectionError: null,
    roomDuration: '00:00',
  });

  const voiceChatRef = useRef<VoiceChatService | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateParticipants = useCallback(() => {
    console.log('=== UPDATE PARTICIPANTS ===');
    if (voiceChatRef.current) {
        const participants = voiceChatRef.current.getParticipants();
        console.log('Current participants:', participants.map(p => ({ 
          identity: p.identity, 
          type: p instanceof LocalParticipant ? 'Local' : 'Remote',
          sid: p.sid 
        })));
        
        // State'i güncelle
        setState(prev => {
          console.log('Updating participants state from', prev.participants.length, 'to', participants.length);
          return {...prev, participants: [...participants]};
        });

        // Remote participant'lar için speaking event'lerini dinle
        participants.forEach(p => {
            if (p instanceof RemoteParticipant) {
                p.on(ParticipantEvent.IsSpeakingChanged, () => {
                    console.log('Remote participant speaking changed:', p.identity);
                    const updatedParticipants = voiceChatRef.current?.getParticipants() || [];
                    setState(prev => ({...prev, participants: [...updatedParticipants]}));
                });
            }
        });
    } else {
        console.log('voiceChatRef.current is null');
    }
  }, []);

  const startDurationTimer = useCallback(() => {
    startTimeRef.current = new Date();
    durationIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current.getTime();
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        setState(prev => ({
          ...prev,
          roomDuration: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        }));
      }
    }, 1000);
  }, []);

  const stopDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  const connect = useCallback(async () => {
    console.log('=== CONNECT START ===');
    console.log('Current state:', { isConnecting: state.isConnecting, isConnected: state.isConnected });
    
    if (state.isConnecting || state.isConnected) {
      console.log('Already connecting or connected, returning');
      return;
    }
    
    setState(prev => ({ ...prev, isConnecting: true, connectionError: null }));
    console.log('Set isConnecting to true');

    try {
      console.log('Connecting to voice chat with nickname:', nickname);
      const response = await apiRequest('POST', '/api/token', { nickname, roomName });
      const { token, wsUrl }: LiveKitTokenResponse = await response.json();
      
      console.log('Received token and wsUrl:', { 
        tokenLength: token.length, 
        wsUrl,
        tokenPreview: token.substring(0, 50) + '...'
      });

      voiceChatRef.current = new VoiceChatService();
      console.log('VoiceChatService instance created');

      await voiceChatRef.current.connect({
        token,
        wsUrl,
        onParticipantConnected: () => {
          console.log('Participant connected');
          updateParticipants();
        },
        onParticipantDisconnected: () => {
          console.log('Participant disconnected');
          updateParticipants();
        },
        onConnectionStateChanged: (connectionState) => {
          console.log('Connection state changed:', connectionState);
          const isConnected = connectionState === 'connected';
          setState(prev => ({ ...prev, isConnected }));
          if (isConnected) {
            console.log('Connected successfully, starting timer');
            startDurationTimer();
            updateParticipants();
          }
        },
        onError: (error) => {
          console.error('LiveKit connection error:', error);
          setState(prev => ({ ...prev, connectionError: `Connection failed: ${error.message}`, isConnecting: false }));
        },
      });

      console.log('VoiceChatService.connect() completed');

      // Audio'yu bağlantı başarılı olduktan sonra yayınla
      if (voiceChatRef.current) {
        console.log('Publishing audio after connection...');
        await voiceChatRef.current.publishAudio();
        console.log('Audio published successfully');
        
        // Audio yayınlandıktan sonra katılımcıları güncelle
        console.log('Updating participants after audio publish...');
        updateParticipants();
      }

      setState(prev => ({ 
        ...prev, 
        isConnecting: false, 
        isMuted: voiceChatRef.current?.isMuted() || false,
      }));
      console.log('=== CONNECT END ===');

    } catch (error) {
      console.error('Failed to connect to voice chat:', error);
      let errorMessage = 'Failed to connect';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setState(prev => ({ ...prev, isConnecting: false, connectionError: errorMessage }));
      console.log('=== CONNECT ERROR ===');
    }
  }, [nickname, roomName, state.isConnecting, state.isConnected, updateParticipants, startDurationTimer]);

  const disconnect = useCallback(async () => {
    console.log('=== DISCONNECT START ===');
    
    if (voiceChatRef.current) {
      try {
        await voiceChatRef.current.disconnect();
        console.log('VoiceChatService disconnected successfully');
      } catch (error) {
        console.error('Error disconnecting:', error);
      }
      voiceChatRef.current = null;
    }

    stopDurationTimer();
    
    setState(prev => ({ 
      ...prev, 
      isConnected: false, 
      isConnecting: false,
      participants: [],
      connectionError: null 
    }));

    console.log('=== DISCONNECT COMPLETE ===');
  }, [stopDurationTimer]);

  const toggleMute = useCallback(async () => {
    console.log('=== TOGGLE MUTE ===');
    if (!voiceChatRef.current) return;

    try {
      const newMutedState = !voiceChatRef.current.isMuted();
      await voiceChatRef.current.setMicrophoneEnabled(!newMutedState);
      setState(prev => ({ ...prev, isMuted: newMutedState }));
      console.log('Mute toggled successfully');
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  }, []);

  const toggleDeafen = useCallback(async () => {
    console.log('=== TOGGLE DEAFEN ===');
    if (!voiceChatRef.current) return;

    try {
      const newDeafenedState = !state.isDeafened;
      voiceChatRef.current.setAllParticipantsMuted(newDeafenedState);
      
      // Eğer kendimizi sağırlaştırıyorsak, mikrofonumuzu da kapatalım
      if(newDeafenedState){
        await voiceChatRef.current.setMicrophoneEnabled(false);
        setState(prev => ({ ...prev, isMuted: true, isDeafened: newDeafenedState }));
      } else {
        // Sağır modundan çıkarken mikrofonu eski haline getirebiliriz (isteğe bağlı)
        // Biz burada kapalı tutmaya devam edelim, kullanıcı kendi açsın.
        setState(prev => ({ ...prev, isDeafened: newDeafenedState }));
      }
      
      console.log('Deafen toggled successfully');
    } catch (error) {
      console.error('Error toggling deafen:', error);
    }
  }, [state.isDeafened]);

  const setParticipantVolume = useCallback((participantSid: string, volume: number) => {
    if(voiceChatRef.current) {
        voiceChatRef.current.setParticipantVolume(participantSid, volume);
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const returnValue = useMemo(() => ({
    ...state,
    connect,
    disconnect,
    toggleMute,
    toggleDeafen,
    setParticipantVolume,
  }), [state, connect, disconnect, toggleMute, toggleDeafen, setParticipantVolume]);

  return returnValue;
}
