import React, { memo, useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Mic, MicOff, Headphones, VolumeX, Wifi, WifiOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VoiceControlsProps {
  isMuted: boolean;
  isDeafened: boolean;
  toggleMute: () => void;
  toggleDeafen: () => void;
}

const VoiceControls: React.FC<VoiceControlsProps> = memo(({ isMuted, isDeafened, toggleMute, toggleDeafen }) => {
  const [ping, setPing] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Ping ölçümü
  const measurePing = useCallback(async () => {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/ping', { method: 'GET' });
      if (response.ok) {
        const endTime = Date.now();
        const pingTime = endTime - startTime;
        setPing(pingTime);
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      setIsConnected(false);
    }
  }, []);

  // Ping ölçümünü başlat
  useEffect(() => {
    measurePing();
    const interval = setInterval(measurePing, 5000); // Her 5 saniyede bir

    return () => {
      clearInterval(interval);
    };
  }, [measurePing]);

  // Ping rengi belirleme
  const getPingColor = useCallback((pingValue: number) => {
    if (pingValue <= 50) return 'text-green-400'; // Yeşil - Mükemmel
    if (pingValue <= 100) return 'text-yellow-400'; // Sarı - İyi
    if (pingValue <= 200) return 'text-orange-400'; // Turuncu - Orta
    return 'text-red-400'; // Kırmızı - Kötü
  }, []);

  // Ping durumu ikonu
  const getPingIcon = useCallback((pingValue: number) => {
    if (pingValue <= 50) return <Wifi className="h-3 w-3" />;
    if (pingValue <= 100) return <Wifi className="h-3 w-3" />;
    if (pingValue <= 200) return <Wifi className="h-3 w-3" />;
    return <WifiOff className="h-3 w-3" />;
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center justify-center gap-4 p-3 bg-[#101320] rounded-xl border border-[#23253a]">
          {/* Mikrofon Butonu */}
          <Tooltip>
              <TooltipTrigger asChild>
                  <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className={`hover:bg-[#2ec8fa22] rounded-full w-12 h-12 transition-all duration-200 ${
                        isMuted 
                          ? 'text-red-500 hover:text-red-400 hover:bg-red-50022' 
                          : 'text-[#e5eaff] hover:text-[#2ec8fa]'
                      }`}
                  >
                      {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                  </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-[#101320] text-[#e5eaff] border-[#23253a]">
                  <p>{isMuted ? 'Mikrofonu Aç' : 'Mikrofonu Kapat'}</p>
              </TooltipContent>
          </Tooltip>
          
          {/* Sağırlaşma Butonu */}
          <Tooltip>
              <TooltipTrigger asChild>
                  <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleDeafen}
                      className={`hover:bg-[#2ec8fa22] rounded-full w-12 h-12 transition-all duration-200 ${
                        isDeafened 
                          ? 'text-red-500 hover:text-red-400 hover:bg-red-50022' 
                          : 'text-[#e5eaff] hover:text-[#2ec8fa]'
                      }`}
                  >
                      {isDeafened ? <VolumeX size={24} /> : <Headphones size={24} />}
                  </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-[#101320] text-[#e5eaff] border-[#23253a]">
                  <p>{isDeafened ? 'Sesi Aç' : 'Sağırlaş'}</p>
              </TooltipContent>
          </Tooltip>
          
          {/* Ping Göstergesi */}
          <Tooltip>
              <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#0f1422aa] border border-[#4dc9fa22]">
                      {isConnected ? (
                          <>
                              {getPingIcon(ping || 0)}
                              <span className={`text-xs font-mono ${getPingColor(ping || 0)}`}>
                                  {ping ? `${ping}ms` : '...'}
                              </span>
                          </>
                      ) : (
                          <>
                              <WifiOff className="h-3 w-3 text-red-400" />
                              <span className="text-xs text-red-400">Bağlantı Yok</span>
                          </>
                      )}
                  </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-[#101320] text-[#e5eaff] border-[#23253a]">
                  <p>Bağlantı Durumu</p>
              </TooltipContent>
          </Tooltip>
      </div>
    </TooltipProvider>
  );
});

VoiceControls.displayName = "VoiceControls";

export default VoiceControls; 