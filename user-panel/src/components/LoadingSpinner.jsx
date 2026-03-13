import React from 'react';

const LoadingSpinner = ({ size = 'md' }) => {
    const sizes = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div className="flex items-center justify-center">
            <div className={`${sizes[size]} border-primary-purple border-t-transparent rounded-full animate-spin shadow-[0_0_10px_rgba(108,99,255,0.2)]`}></div>
        </div>
    );
};

export const ShimmerSkeleton = ({ className }) => (
    <div className={`shimmer bg-card-bg/50 rounded-lg ${className}`}></div>
);

export default LoadingSpinner;
