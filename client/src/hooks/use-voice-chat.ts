import { useState, useEffect, useCallback, useRef } from 'react';
import { VoiceChatService } from '@/lib/livekit';
import { apiRequest } from '@/lib/queryClient';
import type { LiveKitTokenResponse, Participant } from '@shared/schema';
import { RemoteParticipant, LocalParticipant } from 'livekit-client';

export interface UseVoiceChatOptions {
  nickname: string;
  roomName?: string;
}

export interface VoiceChatState {
  isConnecting: boolean;
  isConnected: boolean;
  participants: Array<LocalParticipant | RemoteParticipant>;
  isMuted: boolean;
  connectionError: string | null;
  roomDuration: string;
}

export function useVoiceChat({ nickname, roomName = 'default-room' }: UseVoiceChatOptions) {
  const [state, setState] = useState<VoiceChatState>({
    isConnecting: false,
    isConnected: false,
    participants: [],
    isMuted: false,
    connectionError: null,
    roomDuration: '00:00',
  });

  const voiceChatRef = useRef<VoiceChatService | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket connection for real-time updates
  const connectWebSocket = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({ type: 'join_room', roomId: roomName }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'participants_update') {
          // Handle participant updates from server
          console.log('Participants updated:', data.participants);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [roomName]);

  // Start room duration timer
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

  // Stop duration timer
  const stopDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  // Connect to voice chat
  const connect = useCallback(async () => {
    if (state.isConnecting || state.isConnected) return;

    setState(prev => ({ ...prev, isConnecting: true, connectionError: null }));

    try {
      // Get LiveKit token from server
      const response = await apiRequest('POST', '/api/token', {
        nickname,
        roomName,
      });

      const { token, wsUrl }: LiveKitTokenResponse = await response.json();

      // Initialize voice chat service
      voiceChatRef.current = new VoiceChatService();

      await voiceChatRef.current.connect({
        token,
        wsUrl,
        onParticipantConnected: (participant: RemoteParticipant) => {
          setState(prev => ({
            ...prev,
            participants: voiceChatRef.current?.getParticipants() || [],
          }));
        },
        onParticipantDisconnected: (participant: RemoteParticipant) => {
          setState(prev => ({
            ...prev,
            participants: voiceChatRef.current?.getParticipants() || [],
          }));
        },
        onTrackMuted: () => {
          setState(prev => ({
            ...prev,
            isMuted: voiceChatRef.current?.isMuted() || false,
          }));
        },
        onTrackUnmuted: () => {
          setState(prev => ({
            ...prev,
            isMuted: voiceChatRef.current?.isMuted() || false,
          }));
        },
        onConnectionStateChanged: (connectionState) => {
          setState(prev => ({ ...prev, isConnected: connectionState === 'connected' }));
        },
        onError: (error) => {
          setState(prev => ({
            ...prev,
            connectionError: error.message,
            isConnecting: false,
          }));
        },
      });

      // Connect WebSocket for real-time updates
      connectWebSocket();

      // Start duration timer
      startDurationTimer();

      setState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: true,
        participants: voiceChatRef.current?.getParticipants() || [],
        isMuted: voiceChatRef.current?.isMuted() || false,
      }));

    } catch (error) {
      console.error('Failed to connect to voice chat:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        connectionError: error instanceof Error ? error.message : 'Failed to connect',
      }));
    }
  }, [nickname, roomName, state.isConnecting, state.isConnected, connectWebSocket, startDurationTimer]);

  // Disconnect from voice chat
  const disconnect = useCallback(async () => {
    if (voiceChatRef.current) {
      await voiceChatRef.current.disconnect();
      voiceChatRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    stopDurationTimer();

    setState({
      isConnecting: false,
      isConnected: false,
      participants: [],
      isMuted: false,
      connectionError: null,
      roomDuration: '00:00',
    });
  }, [stopDurationTimer]);

  // Toggle mute
  const toggleMute = useCallback(async () => {
    if (voiceChatRef.current) {
      const newMutedState = await voiceChatRef.current.toggleMute();
      setState(prev => ({ ...prev, isMuted: newMutedState }));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (voiceChatRef.current) {
        voiceChatRef.current.disconnect();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      stopDurationTimer();
    };
  }, [stopDurationTimer]);

  return {
    ...state,
    connect,
    disconnect,
    toggleMute,
  };
}
