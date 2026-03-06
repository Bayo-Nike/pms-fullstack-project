import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

const typeStyles = {
  success: {
    bg: 'bg-[#E2F3E4]', 
    text: 'text-[#357E3B]', 
    iconColor: 'text-[#357E3B]', 
  },
  info: {
    bg: 'bg-[#CCE5FF]', 
    text: 'text-[#0063CC]', 
    iconColor: 'text-[#0063CC]',
  },
  error: { 
    bg: 'bg-[#FFD6D6]', 
    text: 'text-[#F00000]', 
    iconColor: 'text-[#F00000]',
  },
};

/**
 * A reusable alert message component.
 *
 * @param {object} props - Component props.
 * @param {'success' | 'info' | 'error'} props.type - The type of message (determines styling). Defaults to 'info'.
 * @param {string} props.message - The message text to display.
 * @param {boolean} props.show - Whether the alert should be visible.
 * @param {function} [props.onClose] - Optional function to call when the close button is clicked. If not provided, the close button won't be shown.
 */
const AlertMessage = ({
  type = 'info',
  message,
  show = false,
  onClose,
}) => {
  if (!show) {
    return null;
  }

  const styles = typeStyles[type] || typeStyles.info;

  const baseClasses = "flex items-center justify-between p-3 rounded-md shadow-sm my-3 text-sm transition-opacity duration-300 ease-in-out";

  return (
    <div
      className={`${baseClasses} ${styles.bg} ${styles.text}`}
      role="alert" 
    >
      {/* Message Content */}
      <span className="flex-grow mr-2">{message}</span>

      {}
      {onClose && (
        <button
          onClick={onClose}
          className={`ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg inline-flex h-8 w-8 ${styles.text} hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-1 ${styles.bg === 'bg-[#FFD6D6]' ? 'focus:ring-red-400' : styles.bg === 'bg-[#CCE5FF]' ? 'focus:ring-blue-400' : 'focus:ring-green-400'} `} // Dynamic focus ring based on type
          aria-label="Close message"
        >
          <span className="sr-only">Close</span> {}
          <CloseIcon fontSize="small" />
        </button>
      )}
    </div>
  );
};

export default AlertMessage;