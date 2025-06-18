import { useState, useEffect } from 'react';
import { useVoiceChat } from '@/hooks/use-voice-chat';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { ErrorModal } from '@/components/ui/error-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function VoiceChat() {
  const [currentScreen, setCurrentScreen] = useState<'join' | 'chat'>('join');
  const [nickname, setNickname] = useState('');
  const [showError, setShowError] = useState(false);

  const {
    isConnecting,
    isConnected,
    participants,
    isMuted,
    connectionError,
    roomDuration,
    connect,
    disconnect,
    toggleMute,
  } = useVoiceChat({ nickname });

  // Handle form submission
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    
    await connect();
  };

  // Handle leaving room
  const handleLeaveRoom = async () => {
    await disconnect();
    setCurrentScreen('join');
    setNickname('');
  };

  // Show error modal when there's a connection error
  useEffect(() => {
    if (connectionError) {
      setShowError(true);
    }
  }, [connectionError]);

  // Switch to chat screen when connected
  useEffect(() => {
    if (isConnected) {
      setCurrentScreen('chat');
    }
  }, [isConnected]);

  // Get current user from participants
  const currentUser = participants.find(p => p.identity === nickname);
  const otherParticipants = participants.filter(p => p.identity !== nickname);

  // Generate participant avatar color
  const getAvatarColor = (name: string) => {
    const colors = ['bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-blue-500', 'bg-red-500', 'bg-yellow-500'];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (currentScreen === 'join') {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
                <i className="fas fa-microphone text-white text-2xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">VoiceConnect</h1>
              <p className="text-gray-600">Join the conversation instantly</p>
            </div>

            {/* Nickname Form */}
            <form onSubmit={handleJoinRoom} className="space-y-6">
              <div className="relative">
                <Input
                  type="text"
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder=" "
                  required
                  maxLength={20}
                  className="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors duration-200 bg-white"
                />
                <Label 
                  htmlFor="nickname" 
                  className="absolute left-4 top-3 text-gray-500 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-sm peer-focus:text-primary peer-focus:bg-white peer-focus:px-2 peer-focus:-ml-2 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-primary peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:-ml-2"
                >
                  Enter your nickname
                </Label>
              </div>

              <Button 
                type="submit"
                className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                disabled={!nickname.trim()}
              >
                <i className="fas fa-microphone mr-2"></i>
                Join Voice Chat
              </Button>
            </form>

            {/* Feature List */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-4">What you get:</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-700">
                  <i className="fas fa-check text-success mr-3"></i>
                  Real-time voice communication
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <i className="fas fa-check text-success mr-3"></i>
                  No registration required
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <i className="fas fa-check text-success mr-3"></i>
                  Crystal clear audio quality
                </div>
              </div>
            </div>
          </div>
        </div>

        <LoadingOverlay isVisible={isConnecting} />
        <ErrorModal 
          isVisible={showError}
          message={connectionError || ""}
          onRetry={() => {
            setShowError(false);
            connect();
          }}
          onClose={() => setShowError(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-microphone text-white text-sm"></i>
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900">VoiceConnect</h1>
                </div>
                
                {/* Connection Status */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></div>
                    <span>Connected</span>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Hello, <span className="font-semibold">{nickname}</span></span>
                <button 
                  onClick={handleLeaveRoom}
                  className="text-gray-500 hover:text-error transition-colors duration-200"
                  title="Leave room"
                >
                  <i className="fas fa-sign-out-alt text-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            
            {/* Main Controls */}
            <div className="lg:col-span-3">
              <Card className="bg-white rounded-2xl shadow-lg">
                <CardContent className="p-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Voice Chat Room</h2>
                  
                  {/* Speaking Indicator */}
                  <div className="mb-8">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-xl">
                        <i className="fas fa-microphone text-white text-4xl"></i>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-4">
                      {isMuted ? 'Muted' : 'Listening...'}
                    </p>
                  </div>

                  {/* Audio Controls */}
                  <div className="flex justify-center space-x-4">
                    <button 
                      onClick={toggleMute}
                      className={`flex items-center justify-center w-14 h-14 text-white rounded-full transition-colors duration-200 focus:outline-none focus:ring-4 ${
                        isMuted 
                          ? 'bg-error hover:bg-red-600 focus:ring-red-200' 
                          : 'bg-success hover:bg-green-600 focus:ring-green-200'
                      }`}
                      title="Mute/Unmute"
                    >
                      <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-xl`}></i>
                    </button>
                    
                    <button 
                      className="flex items-center justify-center w-14 h-14 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-gray-200"
                      title="Volume"
                    >
                      <i className="fas fa-volume-up text-xl"></i>
                    </button>
                  </div>

                  {/* Room Info */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{participants.length}</div>
                        <div className="text-sm text-gray-600">Participants</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{roomDuration}</div>
                        <div className="text-sm text-gray-600">Duration</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User List */}
            <div className="lg:col-span-1">
              <Card className="bg-white rounded-2xl shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Participants 
                    <span className="text-primary">({participants.length})</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {/* Current user */}
                    {currentUser && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">
                                {currentUser.identity?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{currentUser.identity}</div>
                            <div className="text-xs text-blue-600">You</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <i className={`fas ${isMuted ? 'fa-microphone-slash text-error' : 'fa-microphone text-success'} text-sm`}></i>
                        </div>
                      </div>
                    )}

                    {/* Other participants */}
                    {otherParticipants.map((participant) => (
                      <div key={participant.identity} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className={`w-8 h-8 ${getAvatarColor(participant.identity || '')} rounded-full flex items-center justify-center`}>
                              <span className="text-white text-sm font-semibold">
                                {participant.identity?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{participant.identity}</div>
                            <div className="text-xs text-gray-500">Listening</div>
                          </div>
                        </div>
                        <i className="fas fa-microphone text-success text-sm"></i>
                      </div>
                    ))}
                  </div>

                  {/* Room Code */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-2">Room Code</p>
                      <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">DEFAULT-ROOM</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <ErrorModal 
        isVisible={showError}
        message={connectionError || ""}
        onRetry={() => {
          setShowError(false);
          connect();
        }}
        onClose={() => setShowError(false)}
      />
    </>
  );
}
