import React, { useState } from 'react';
import { Plus, Check, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmptySlotNode = ({ referralLink, type = 'empty' }) => {
    const [copied, setCopied] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const navigate = useNavigate();

    const handleClick = (e) => {
        e.stopPropagation();
        if (type === 'no-plan') {
            navigate('/deposit');
            return;
        }

        if (referralLink) {
            navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (type === 'no-plan') {
        return (
            <div
                onClick={handleClick}
                className="group"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    minWidth: '94px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}
            >
                <div
                    className="empty-slot-pulse"
                    style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        border: '2px dashed #6C63FF',
                        background: 'rgba(108, 99, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6C63FF',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 0 15px rgba(108, 99, 255, 0.1)'
                    }}
                >
                    <Rocket size={20} className="group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-center">
                    <p style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        color: '#6C63FF',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>Get Slots</p>
                    <p style={{
                        fontSize: '8px',
                        fontWeight: '600',
                        color: 'rgba(255,255,255,0.3)',
                        marginTop: '2px'
                    }}>No Active Plan</p>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={handleClick}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '12px',
                minWidth: '84px',
                cursor: 'pointer',
                position: 'relative',
                opacity: 0.6,
                transition: 'all 0.3s ease'
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '1'}
            onMouseOut={e => e.currentTarget.style.opacity = '0.6'}
        >
            {/* Dashed circle */}
            <div
                className={!copied ? "empty-slot-pulse" : ""}
                style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: copied ? '2px dashed #10B981' : '2px dashed #2D2D44',
                    background: copied ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 45, 68, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: copied ? '#10B981' : '#4B5563',
                    transition: 'all 0.3s ease',
                }}
            >
                {copied ? <Check size={20} /> : <Plus size={20} className="group-hover:scale-110 transition-transform" />}
            </div>

            {/* Label */}
            <div className="text-center leading-tight">
                <p style={{
                    fontSize: '9px',
                    fontWeight: '800',
                    color: copied ? '#10B981' : '#4B5563',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {copied ? 'Copied!' : 'Open Slot'}
                </p>
                {!copied && (
                    <p style={{
                        fontSize: '8px',
                        color: '#6C63FF',
                        fontWeight: '700',
                        marginTop: '2px'
                    }}>
                        Invite Now
                    </p>
                )}
            </div>

            {/* Tooltip on hover */}
            {showTooltip && !copied && (
                <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%) translateY(-8px)',
                    background: '#1A1A2E',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '10px',
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    zIndex: 100,
                    pointerEvents: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}>
                    Click to copy referral link
                </div>
            )}
        </div>
    );
};

export default EmptySlotNode;
