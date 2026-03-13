import React,{ useEffect,useState } from 'react';
import { CheckCircle,XCircle,AlertCircle,X } from 'lucide-react';
import { motion,AnimatePresence } from 'framer-motion';

const Toast = ({ message,type = 'success',onClose,duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        },duration);
        return () => clearTimeout(timer);
    },[duration,onClose]);

    const icons = {
        success: <CheckCircle className="text-success-green" size={20} />,
        error: <XCircle className="text-danger-red" size={20} />,
        info: <AlertCircle className="text-primary-purple" size={20} />,
    };

    const colors = {
        success: 'border-success-green/30 bg-success-green/10',
        error: 'border-danger-red/30 bg-danger-red/10',
        info: 'border-primary-purple/30 bg-primary-purple/10',
    };

    return (
        <motion.div
            initial={{ opacity: 0,y: -20,scale: 0.95 }}
            animate={{ opacity: 1,y: 0,scale: 1 }}
            exit={{ opacity: 0,scale: 0.95 }}
            className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md ${colors[type]} shadow-lg min-w-[300px] max-w-[90vw]`}
        >
            {icons[type]}
            <p className="text-sm font-medium flex-1">{message}</p>
            <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
                <X size={18} />
            </button>
        </motion.div>
    );
};

export const useToast = () => {
    const [toast,setToast] = useState(null);

    const showToast = (message,type = 'success') => {
        setToast({ message,type });
    };

    const ToastContainer = () => (
        <AnimatePresence>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </AnimatePresence>
    );

    return { showToast,ToastContainer };
};

export default Toast;
