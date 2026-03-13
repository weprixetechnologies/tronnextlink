import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'No data found', message = 'There are no items to display at this time.', icon = <Inbox size={48} />, action }) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="p-4 bg-gray-50 text-gray-300 rounded-full mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-black text-gray-900 leading-tight">{title}</h3>
            <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto font-medium">{message}</p>
            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
