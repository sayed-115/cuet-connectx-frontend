import { useEffect, useState } from 'react';

function Toast({ toast }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast?.show) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [toast?.show]);

  if (!visible) return null;

  const isError = toast.type === 'error';

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 ${
        isError ? 'bg-red-600' : 'bg-green-600'
      }`}
    >
      <span className="text-base">{isError ? '\u2716' : '\u2714'}</span>
      {toast.message}
    </div>
  );
}

export default Toast;
