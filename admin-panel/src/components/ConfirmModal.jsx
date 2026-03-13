import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger', loading = false }) => {
    if (!isOpen) return null;

    const colors = {
        danger: {
            bg: 'bg-rose-50',
            icon: 'text-rose-600',
            button: 'bg-rose-600 hover:bg-rose-700'
        },
        warning: {
            bg: 'bg-amber-50',
            icon: 'text-amber-600',
            button: 'bg-amber-600 hover:bg-amber-700'
        },
        info: {
            bg: 'bg-indigo-50',
            icon: 'text-indigo-600',
            button: 'bg-indigo-600 hover:bg-indigo-700'
        }
    };

    const style = colors[type] || colors.danger;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl ${style.bg}`}>
                            <AlertTriangle className={`w-6 h-6 ${style.icon}`} />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 leading-relaxed">{message}</p>
                </div>

                <div className="p-6 bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-indigo-200 ${style.button}`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                        ) : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
