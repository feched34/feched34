interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  subMessage?: string;
}

export function LoadingOverlay({ 
  isVisible, 
  message = "Bağlanıyorum kral bir saniye", 
  subMessage = "Mikrofona izin verirsin" 
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{message}</h3>
        <p className="text-gray-600 text-sm">{subMessage}</p>
      </div>
    </div>
  );
}
