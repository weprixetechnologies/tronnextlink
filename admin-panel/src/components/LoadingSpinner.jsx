import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 24, className = '', color = 'text-indigo-600' }) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <Loader2 className={`animate-spin ${color}`} size={size} />
        </div>
    );
};

export default LoadingSpinner;
