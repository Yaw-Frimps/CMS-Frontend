import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  const getColorClasses = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-500 bg-red-50 dark:bg-red-500/10',
          button: 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
        };
      case 'warning':
        return {
          icon: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10',
          button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
        };
      default:
        return {
          icon: 'text-primary-500 bg-primary-50 dark:bg-primary-500/10',
          button: 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/20'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass p-8 rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden"
          >
            <button
              onClick={onCancel}
              className="absolute top-6 right-6 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${colors.icon}`}>
                <AlertTriangle className="w-8 h-8" />
              </div>
              
              <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight mb-3">
                {title}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mb-8">
                {message}
              </p>

              <div className="flex w-full gap-4">
                <button
                  onClick={onCancel}
                  className="flex-1 px-6 py-3.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onCancel();
                  }}
                  className={`flex-1 px-6 py-3.5 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95 ${colors.button}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
