import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Play, Pause, Trash2, FileAudio, Keyboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SoundManager({ roomName = 'default-room' }: { roomName?: string }) {
  // Yüklenen seslerin listesi: { id, name, assignedKey }
  const [sounds, setSounds] = useState<any[]>([]);
  const [playingSounds, setPlayingSounds] = useState<Set<string>>(new Set());
  const [isListening, setIsListening] = useState(false);
  const [soundToAssign, setSoundToAssign] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket ile soundboard state senkronizasyonu
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join_room', roomId: roomName }));
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'soundboard_state_broadcast' && data.state) {
          setSounds(data.state.sounds || []);
        }
        if (data.type === 'play_sound' && data.soundId) {
          playSoundLocal(data.soundId);
        }
      } catch {}
    };
    ws.onclose = () => {};
    ws.onerror = () => {};
    return () => { ws.close(); };
  }, [roomName]);

  // State'i sunucuya gönder
  const broadcastSoundboardState = (newSounds: any[]) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'soundboard_state_update', state: { sounds: newSounds } }));
    }
  };

  // Sesi odadaki herkese çaldır
  const broadcastPlaySound = (soundId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'play_sound', soundId }));
    }
  };

  // Dosya yükleme
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const newSounds = Array.from(files)
      .filter(file => file.type.startsWith('audio/'))
      .map(file => {
        const id = Date.now() + Math.random().toString(36);
        const audioUrl = URL.createObjectURL(file);
        const audio = new Audio(audioUrl);
        audio.addEventListener('ended', () => {
          setPlayingSounds(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        });
        audioRefs.current[id] = audio;
        return {
          id,
          name: file.name.replace(/\.[^/.]+$/, ''),
          assignedKey: null
        };
      });
    const updatedSounds = [...sounds, ...newSounds];
    setSounds(updatedSounds);
    broadcastSoundboardState(updatedSounds);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Sesi çal (local)
  const playSoundLocal = (soundId: string) => {
    const audio = audioRefs.current[soundId];
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      audio.currentTime = 0;
      setPlayingSounds(prev => {
        const newSet = new Set(prev);
        newSet.delete(soundId);
        return newSet;
      });
      return;
    }
    audio.currentTime = 0;
    audio.play();
    setPlayingSounds(prev => new Set(prev).add(soundId));
  };

  // Sesi çal (herkese broadcast)
  const playSound = (soundId: string) => {
    broadcastPlaySound(soundId);
    playSoundLocal(soundId);
  };

  // Sesi sil
  const deleteSound = (soundId: string) => {
    if (audioRefs.current[soundId]) {
      audioRefs.current[soundId].pause();
      URL.revokeObjectURL(audioRefs.current[soundId].src);
      delete audioRefs.current[soundId];
    }
    const updatedSounds = sounds.filter(s => s.id !== soundId);
    setSounds(updatedSounds);
    broadcastSoundboardState(updatedSounds);
  };

  // Tuş atama başlat
  const startKeyAssignment = (sound: any) => {
    setIsListening(true);
    setSoundToAssign(sound);
  };

  // Klavye kısayolu yönetimi
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (isListening && soundToAssign) {
        event.preventDefault();
        event.stopPropagation();
        const key = event.code;
        if (['Escape'].includes(key)) {
          setIsListening(false);
          setSoundToAssign(null);
          return;
        }
        const existingSound = sounds.find(s => s.assignedKey === key);
        if (existingSound) {
          alert(`Bu tuş zaten "${existingSound.name}" sesine atanmış.`);
          return;
        }
        const updatedSounds = sounds.map(sound =>
          sound.id === soundToAssign.id ? { ...sound, assignedKey: key } : sound
        );
        setSounds(updatedSounds);
        broadcastSoundboardState(updatedSounds);
        setIsListening(false);
        setSoundToAssign(null);
        return;
      }
      if (!isListening) {
        const soundToPlay = sounds.find(s => s.assignedKey === event.code);
        if (soundToPlay && !event.repeat) {
          playSound(soundToPlay.id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [sounds, isListening, soundToAssign]);

  // Bileşen kaldırıldığında Object URL'leri temizle
  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio && audio.src) {
          URL.revokeObjectURL(audio.src);
        }
      });
    };
  }, []);

  // Yardımcı: Klavye kodunu okunabilir isme çevir
  const formatKeyName = (keyCode: string | null) => {
    if (!keyCode) return '';
    if (keyCode.startsWith('Key')) return keyCode.replace('Key', '');
    if (keyCode.startsWith('Digit')) return keyCode.replace('Digit', '');
    if (keyCode === 'Space') return 'Boşluk';
    return keyCode;
  };

  // UI
  return (
    <Card className="bg-slate-900 rounded-2xl shadow-lg p-6 w-full max-w-lg mx-auto">
      <CardContent>
        <div className="flex items-center gap-3 mb-6">
          <FileAudio className="text-primary w-7 h-7" />
          <h2 className="text-xl font-bold text-white">Ses Paneli</h2>
        </div>
        <div className="mb-4 flex gap-2 items-center">
          <input
            type="file"
            accept="audio/*"
            multiple
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" /> Ses Yükle
          </Button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          <AnimatePresence>
            {sounds.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-gray-400 flex flex-col items-center py-8">
                <FileAudio className="w-10 h-10 mb-2" />
                Henüz ses yüklenmedi.
              </motion.div>
            )}
            {sounds.map(sound => (
              <motion.div
                key={sound.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center gap-3 p-2 rounded-lg mb-1 ${playingSounds.has(sound.id) ? 'bg-purple-700/30' : 'bg-slate-700/40'}`}
              >
                <div className="flex-1">
                  <div className="text-white font-medium truncate">{sound.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {sound.assignedKey && (
                      <Badge variant="secondary">{formatKeyName(sound.assignedKey)}</Badge>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => startKeyAssignment(sound)}>
                      <Keyboard className="w-4 h-4 mr-1" /> {sound.assignedKey ? 'Tuşu Değiştir' : 'Tuş Ata'}
                    </Button>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => playSound(sound.id)}>
                  {playingSounds.has(sound.id) ? <Pause /> : <Play />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => deleteSound(sound.id)}>
                  <Trash2 />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {/* Tuş atama dinleme kutusu */}
        <AnimatePresence>
          {isListening && soundToAssign && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-slate-800 rounded-xl p-8 flex flex-col items-center shadow-2xl border border-primary">
                <Keyboard className="w-8 h-8 text-primary mb-3" />
                <div className="text-white text-lg font-semibold mb-2">Tuş Ata</div>
                <div className="text-gray-400 mb-4">Bir tuşa basarak <span className="text-primary font-bold">{soundToAssign.name}</span> için kısayol ata.<br />Vazgeçmek için <span className="font-bold">ESC</span> tuşuna bas.</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
} 