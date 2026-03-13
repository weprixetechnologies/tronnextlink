import React from 'react';

const TreeNode = ({ node, isExpanded, isLoading, isCurrentUser, isRoot, onClick }) => {
    const hasChildren = node.direct_referrals_count > 0;

    // Avatar color based on status
    const avatarColor = isCurrentUser ? '#6C63FF' :
        isExpanded ? '#00D4AA' :
            node.status === 'blocked' ? '#EF4444' :
                node.plan_name ? '#10B981' : '#4B5563';

    // Ring color
    const ringColor = isCurrentUser ? '#6C63FF' :
        isExpanded ? '#00D4AA' :
            hasChildren ? '#6C63FF' : '#2D2D44';

    // Initial for avatar
    const initial = node.full_name?.charAt(0)?.toUpperCase() || '?';

    return (
        <div
            onClick={hasChildren || isRoot ? onClick : undefined}
            className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-300 ${hasChildren || isRoot ? 'cursor-pointer hover:scale-105' : 'cursor-default opacity-60'}`}
            style={{
                minWidth: isRoot ? '80px' : '72px',
            }}
        >
            {/* Avatar Circle */}
            <div
                className="rounded-full bg-[#1A1A2E] flex items-center justify-center font-black relative transition-all duration-300"
                style={{
                    width: isRoot ? '64px' : '48px',
                    height: isRoot ? '64px' : '48px',
                    border: `2px solid ${ringColor}`,
                    color: avatarColor,
                    fontSize: isRoot ? '24px' : '18px',
                    boxShadow: isExpanded ? `0 0 15px ${ringColor}40` : 'none',
                }}
            >
                {initial}

                {/* Loading spinner overlay */}
                {isLoading && (
                    <div className="absolute -inset-1 rounded-full border-2 border-transparent border-t-[#6C63FF] animate-spin" />
                )}
            </div>

            {/* YOU label for root */}
            {isRoot && (
                <span className="text-[9px] font-black text-[#6C63FF] tracking-widest uppercase">
                    YOU
                </span>
            )}

            {/* Name */}
            <span className="text-[11px] font-bold text-white max-w-[72px] text-center overflow-hidden text-ellipsis whiteplace-nowrap">
                {node.full_name?.split(' ')[0]}
            </span>

            {/* Plan badge */}
            {node.plan_name && !isRoot && (
                <span className="text-[9px] font-bold text-[#00D4AA] bg-[#00D4AA]/10 px-1.5 py-0.5 rounded max-w-[68px] overflow-hidden text-ellipsis whitespace-nowrap border border-[#00D4AA]/20">
                    {node.plan_name}
                </span>
            )}

            {/* Referral count + expand indicator */}
            {!isRoot && (
                <div
                    className="flex items-center gap-1 text-[10px] font-bold"
                    style={{
                        color: hasChildren
                            ? (isExpanded ? '#00D4AA' : '#9CA3AF')
                            : '#4B5563'
                    }}
                >
                    {hasChildren ? (
                        <>
                            <span>{node.direct_referrals_count}</span>
                            <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>▼</span>
                        </>
                    ) : (
                        <span className="text-[9px]">--</span>
                    )}
                </div>
            )}
        </div>
    );
};

export default TreeNode;
