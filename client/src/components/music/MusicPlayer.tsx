import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRandom, FaRedo, FaVolumeUp, FaTrash } from 'react-icons/fa';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

// Şarkı entity'si (örnek, backend ile entegre edebilirsin)
export function Song(data) {
  return { ...data };
}

const YOUTUBE_API_KEY = 'AIzaSyA668-F6RXvOAYtlS1xbhOgXe37BJnS07c'; // Test için, prod'da backend proxy önerilir

export default function MusicPlayer({ currentUser }: { currentUser: { full_name: string } }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([24]);
  const [queue, setQueue] = useState([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [player, setPlayer] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // none, all, one
  const [isShuffled, setIsShuffled] = useState(false);
  const playerRef = useRef(null);
  const originalQueueRef = useRef([]);
  const wsRef = useRef<WebSocket | null>(null);
  const [roomName, setRoomName] = useState('default-room'); // Oda adı dışarıdan alınabilir
  const [musicState, setMusicState] = useState<any>(null); // Son broadcast edilen state

  // YouTube Iframe API yüklemesi
  useEffect(() => {
    loadQueue();
    loadYouTubeAPI();
    return () => { window.onYouTubeIframeAPIReady = null; };
    // eslint-disable-next-line
  }, []);

  // Kuyruğu localStorage'dan yükle (isteğe bağlı)
  function loadQueue() {
    // localStorage'dan yüklemek istersen buraya ekle
  }

  // YouTube API scriptini yükle
  function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) {
      if (!player) initializePlayer();
      return;
    }
    if (!document.getElementById('youtube-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    window.onYouTubeIframeAPIReady = initializePlayer;
  }

  // YouTube oynatıcıyı başlat
  function initializePlayer() {
    if (!playerRef.current || player) return;
    const ytPlayer = new window.YT.Player(playerRef.current, {
      height: '100%',
      width: '100%',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0
      },
      events: {
        onReady: (event) => {
          setPlayer(event.target);
          setPlayerReady(true);
          event.target.setVolume(volume[0]);
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
          } else if (event.data === window.YT.PlayerState.ENDED) {
            handleSongEnd();
          }
        }
      }
    });
  }

  // Şarkı değişince oynat
  useEffect(() => {
    if (currentSong && player && playerReady && player.loadVideoById) {
      player.loadVideoById(currentSong.video_id);
    }
    // eslint-disable-next-line
  }, [currentSong, playerReady]);

  // Ses değişince uygula
  useEffect(() => {
    if (player && player.setVolume) {
      player.setVolume(volume[0]);
    }
  }, [volume, player]);

  // YouTube video ID çıkar
  function extractYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  // YouTube'da arama yap
  async function searchYouTube(query) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) return null;
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const video = data.items[0];
        return {
          videoId: video.id.videoId,
          title: video.snippet.title
        };
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }

  // Şarkı ekle
  async function addSong() {
    if (!youtubeUrl.trim() || !currentUser) return;
    setIsLoading(true);
    try {
      const input = youtubeUrl.trim();
      let videoId;
      let title = 'YouTube Video';
      const urlVideoId = extractYouTubeVideoId(input);
      if (urlVideoId) {
        videoId = urlVideoId;
        try {
          const videoInfoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
          const videoResponse = await fetch(videoInfoUrl);
          if (videoResponse.ok) {
            const videoData = await videoResponse.json();
            if (videoData.items && videoData.items.length > 0) {
              title = videoData.items[0].snippet.title;
            }
          }
        } catch {}
      } else {
        const searchResult = await searchYouTube(input);
        if (searchResult) {
          videoId = searchResult.videoId;
          title = searchResult.title;
        } else {
          alert('Arama sonucu bulunamadı.');
          setIsLoading(false);
          return;
        }
      }
      const newSongData = {
        title: title,
        duration: '0:00',
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
        video_id: videoId,
        added_by: currentUser?.full_name || 'Anonim',
        queue_position: queue.length
      };
      const newSong = Song(newSongData);
      const newQueue = [...queue, newSong];
      setQueue(newQueue);
      if (!isShuffled) {
        originalQueueRef.current = newQueue;
      }
      setYoutubeUrl('');
      if (!currentSong) {
        setCurrentSong(newSong);
      }
    } catch (error) {
      alert('Şarkı eklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }

  // Oynatma kontrolleri
  function playSong(song) {
    setCurrentSong(song);
  }
  function togglePlayPause() {
    if (!player) return;
    if (isPlaying) player.pauseVideo();
    else player.playVideo();
  }
  function handleSongEnd() {
    if (repeatMode === 'one') {
      player.seekTo(0);
      player.playVideo();
    } else {
      nextSong(true);
    }
  }
  function nextSong(fromSongEnd = false) {
    if (!currentSong) return;
    const idx = queue.findIndex(s => s.video_id === currentSong.video_id);
    if (idx === -1) return;
    if (idx + 1 < queue.length) {
      setCurrentSong(queue[idx + 1]);
    } else if (repeatMode === 'all' && queue.length > 0) {
      setCurrentSong(queue[0]);
    } else if (fromSongEnd) {
      setIsPlaying(false);
    }
  }
  function prevSong() {
    if (!currentSong) return;
    const idx = queue.findIndex(s => s.video_id === currentSong.video_id);
    if (idx > 0) {
      setCurrentSong(queue[idx - 1]);
    }
  }
  function removeSong(songId) {
    const newQueue = queue.filter(s => s.video_id !== songId);
    setQueue(newQueue);
    if (currentSong && currentSong.video_id === songId) {
      if (newQueue.length > 0) setCurrentSong(newQueue[0]);
      else setCurrentSong(null);
    }
    if (!isShuffled) {
      originalQueueRef.current = newQueue;
    }
  }
  function handleVolumeChange(val) {
    setVolume([val]);
  }
  function toggleRepeatMode() {
    setRepeatMode(prev => prev === 'none' ? 'all' : prev === 'all' ? 'one' : 'none');
  }
  function toggleShuffle() {
    if (!isShuffled) {
      const shuffled = [...queue].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      setIsShuffled(true);
    } else {
      setQueue(originalQueueRef.current);
      setIsShuffled(false);
    }
  }

  // WebSocket bağlantısı ve dinleme
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
        if (data.type === 'music_state_broadcast' && data.state) {
          setMusicState(data.state);
        }
      } catch {}
    };
    ws.onclose = () => {};
    ws.onerror = () => {};
    return () => { ws.close(); };
  }, [roomName]);

  // State'i sunucuya gönder
  const broadcastMusicState = (state: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'music_state_update', state }));
    }
  };

  // Müzik state'i değiştiğinde (oynat, duraklat, şarkı ekle, ileri/geri) sunucuya gönder
  useEffect(() => {
    if (!currentSong) return;
    const state = {
      videoId: currentSong.video_id,
      isPlaying,
      currentTime: player && player.getCurrentTime ? player.getCurrentTime() : 0,
      queue,
      repeatMode,
      isShuffled
    };
    broadcastMusicState(state);
    // eslint-disable-next-line
  }, [currentSong, isPlaying, queue, repeatMode, isShuffled]);

  // Gelen state ile oynatıcıyı güncelle
  useEffect(() => {
    if (!musicState) return;
    // Kuyruk ve şarkı güncelle
    setQueue(musicState.queue || []);
    setIsShuffled(!!musicState.isShuffled);
    setRepeatMode(musicState.repeatMode || 'none');
    // Şarkı değiştiyse yükle
    if (musicState.videoId && (!currentSong || currentSong.video_id !== musicState.videoId)) {
      const song = (musicState.queue || []).find((s: any) => s.video_id === musicState.videoId);
      if (song) setCurrentSong(song);
    }
    // Oynatma/duraklatma ve zaman senkronizasyonu
    if (player && playerReady) {
      if (musicState.isPlaying) {
        player.playVideo && player.playVideo();
      } else {
        player.pauseVideo && player.pauseVideo();
      }
      // Zamanı senkronize et (fark çoksa güncelle)
      if (player.getCurrentTime && Math.abs(player.getCurrentTime() - (musicState.currentTime || 0)) > 2) {
        player.seekTo && player.seekTo(musicState.currentTime || 0, true);
      }
    }
    // eslint-disable-next-line
  }, [musicState, playerReady]);

  // UI
  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* YouTube Player */}
        <div className="w-full md:w-2/3 aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
          <div ref={playerRef} className="w-full h-full" />
        </div>
        {/* Şu an çalan */}
        <div className="w-full md:w-1/3 flex flex-col gap-2">
          {currentSong && (
            <div className="flex flex-col items-center bg-slate-800 rounded-lg p-3 mb-2">
              <img src={currentSong.thumbnail} alt={currentSong.title} className="w-24 h-24 rounded-lg mb-2" />
              <div className="text-white font-semibold text-center">{currentSong.title}</div>
              <div className="text-xs text-gray-400">Ekleyen: {currentSong.added_by}</div>
            </div>
          )}
          <div className="flex items-center gap-2 justify-center mt-2">
            <Button onClick={prevSong} size="icon"><FaStepBackward /></Button>
            <Button onClick={togglePlayPause} size="icon">{isPlaying ? <FaPause /> : <FaPlay />}</Button>
            <Button onClick={nextSong} size="icon"><FaStepForward /></Button>
            <Button onClick={toggleShuffle} size="icon" variant={isShuffled ? "default" : "outline"}><FaRandom /></Button>
            <Button onClick={toggleRepeatMode} size="icon" variant={repeatMode !== 'none' ? "default" : "outline"}><FaRedo /></Button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <FaVolumeUp className="text-gray-400" />
            <Slider min={0} max={100} value={volume} onValueChange={v => handleVolumeChange(v[0])} className="w-32" />
          </div>
        </div>
      </div>
      {/* Şarkı ekle */}
      <div className="flex gap-2 mt-6">
        <Input
          placeholder="YouTube URL veya şarkı adı..."
          value={youtubeUrl}
          onChange={e => setYoutubeUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addSong()}
          disabled={isLoading}
        />
        <Button onClick={addSong} disabled={isLoading || !youtubeUrl.trim()}>{isLoading ? 'Ekleniyor...' : 'Ekle'}</Button>
      </div>
      {/* Kuyruk */}
      <div className="mt-8">
        <div className="text-white font-bold mb-2">Çalma Listesi</div>
        <div className="max-h-64 overflow-y-auto">
          <AnimatePresence>
            {queue.map((song, i) => (
              <motion.div
                key={song.video_id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center gap-3 p-2 rounded-lg mb-1 ${currentSong && song.video_id === currentSong.video_id ? 'bg-purple-700/30' : 'bg-slate-700/40'}`}
              >
                <img src={song.thumbnail} alt={song.title} className="w-12 h-12 rounded" />
                <div className="flex-1">
                  <div className="text-white font-medium truncate">{song.title}</div>
                  <div className="text-xs text-gray-400">Ekleyen: {song.added_by}</div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => playSong(song)}><FaPlay /></Button>
                <Button size="icon" variant="ghost" onClick={() => removeSong(song.video_id)}><FaTrash /></Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 