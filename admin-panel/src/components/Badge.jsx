import React from 'react';

const Badge = ({ children, variant = 'gray', icon }) => {
    const variants = {
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        rose: 'bg-rose-50 text-rose-700 border-rose-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-100',
        gray: 'bg-gray-50 text-gray-700 border-gray-100',
        purple: 'bg-purple-50 text-purple-700 border-purple-100',
        teal: 'bg-teal-50 text-teal-700 border-teal-100',
        cyan: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    };

    return (
        <span className={`badge border ${variants[variant] || variants.gray}`}>
            {icon && <span className="mr-1">{icon}</span>}
            {children}
        </span>
    );
};

export default Badge;
