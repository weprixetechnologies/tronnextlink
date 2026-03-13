import React from 'react';
import { Check, Loader2 } from 'lucide-react';

const PlanCard = ({ plan, onBuy, balance, activePlanId, loading }) => {
    const isAffordable = balance >= plan.price_usdt;
    const isActive = activePlanId === plan.id;
    const popular = plan.name.toLowerCase().includes('silver') || plan.name.toLowerCase().includes('popular');

    return (
        <div className={`relative bg-card-dark border ${popular ? 'border-primary glow-purple' : 'border-card-border'} rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-4px]`}>
            {popular && (
                <div className="absolute top-0 right-0 py-1 px-4 bg-primary text-[10px] font-bold text-white uppercase rounded-bl-xl tracking-widest z-10">
                    Popular
                </div>
            )}

            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <div className="text-right">
                        <span className="text-white/40 text-xs block">Price</span>
                        <span className="text-2xl font-bold text-gold">${parseFloat(plan.price_usdt).toFixed(2)} <span className="text-xs">USDT</span></span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 mb-6">
                    <span className="text-xs text-white/40 font-medium uppercase">Slots:</span>
                    <div className="flex gap-1.5">
                        {[...Array(plan.slots)].map((_, i) => (
                            <div key={i} className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                        ))}
                    </div>
                </div>

                <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-sm text-white/60">
                        <div className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                            <Check size={12} strokeWidth={3} />
                        </div>
                        <span>{plan.slots} recruitment slots</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-white/60">
                        <div className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                            <Check size={12} strokeWidth={3} />
                        </div>
                        <span>75% commission per recruit</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-white/60">
                        <div className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                            <Check size={12} strokeWidth={3} />
                        </div>
                        <span>Daily affiliate income</span>
                    </li>
                </ul>

                {isActive ? (
                    <button disabled className="w-full py-3 bg-white/5 border border-white/10 text-white/40 font-bold rounded-xl cursor-not-allowed">
                        Currently Active
                    </button>
                ) : (
                    <button
                        onClick={() => isAffordable && onBuy(plan)}
                        disabled={!isAffordable || loading}
                        className={`w-full py-3 font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2
              ${isAffordable
                                ? 'btn-primary'
                                : 'bg-bg-dark text-white/40 border border-card-border cursor-not-allowed'}
            `}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (isAffordable ? 'Buy This Plan' : 'Insufficient Balance')}
                    </button>
                )}

                {!isAffordable && !isActive && (
                    <p className="text-center text-[11px] text-red-500 mt-3 font-medium">
                        Need ${(plan.price_usdt - balance).toFixed(2)} more USDT to buy
                    </p>
                )}
            </div>
        </div>
    );
};

export default PlanCard;
