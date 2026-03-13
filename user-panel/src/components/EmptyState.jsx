import React from 'react';

const EmptyState = ({ icon, title, description, actionText, onAction }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="text-6xl mb-4 grayscale opacity-50">{icon}</div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-text-secondary text-sm max-w-xs mb-6">{description}</p>
            {actionText && (
                <button
                    onClick={onAction}
                    className="btn-primary py-2 px-6 text-sm"
                >
                    {actionText}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
