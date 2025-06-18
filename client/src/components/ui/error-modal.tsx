interface ErrorModalProps {
  isVisible: boolean;
  title?: string;
  message: string;
  onRetry?: () => void;
  onClose?: () => void;
}

export function ErrorModal({ 
  isVisible, 
  title = "Connection Error", 
  message, 
  onRetry,
  onClose 
}: ErrorModalProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-exclamation-triangle text-error text-2xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-6">{message}</p>
        <div className="flex gap-2">
          {onClose && (
            <button 
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Close
            </button>
          )}
          {onRetry && (
            <button 
              onClick={onRetry}
              className="flex-1 bg-primary hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
