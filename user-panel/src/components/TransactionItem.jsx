import React from 'react';
import {
    Plus,
    Minus,
    Users,
    TrendingUp,
    Wallet,
    AlertCircle
} from 'lucide-react';

const TransactionItem = ({ type, description, date, amount, status }) => {
    const config = {
        deposit: { icon: <Wallet size={18} />, color: 'bg-primary/20 text-primary', label: 'Deposit' },
        join_income: { icon: <Users size={18} />, color: 'bg-secondary/20 text-secondary', label: 'Recruitment' },
        affiliate_l1: { icon: <TrendingUp size={18} />, color: 'bg-gold/20 text-gold', label: 'L1 Affiliate' },
        affiliate_l2: { icon: <TrendingUp size={18} />, color: 'bg-secondary/20 text-secondary', label: 'L2 Affiliate' },
        withdrawal: { icon: <Minus size={18} />, color: 'bg-red-500/20 text-red-500', label: 'Withdrawal' },
        admin_credit: { icon: <Plus size={18} />, color: 'bg-primary/20 text-primary', label: 'Admin Credit' },
        admin_debit: { icon: <Minus size={18} />, color: 'bg-red-500/20 text-red-500', label: 'Admin Debit' },
        plan_purchase: { icon: <Minus size={18} />, color: 'bg-rose-500/20 text-rose-500', label: 'Plan Purchase' },
        platform_fee: { icon: <Minus size={18} />, color: 'bg-orange-500/20 text-orange-500', label: 'Platform Fee' },
        default: { icon: <AlertCircle size={18} />, color: 'bg-white/10 text-white/40', label: 'Transaction' }
    };

    const { icon, color, label } = config[type] || config.default;
    const isNegative = amount < 0 || ['withdrawal', 'admin_debit', 'plan_purchase', 'platform_fee'].includes(type);
    const formattedAmount = `${isNegative ? '' : '+'}$${Math.abs(parseFloat(amount)).toFixed(2)}`;

    return (
        <div className="flex items-center justify-between p-4 bg-card-dark/50 border border-card-border rounded-xl hover:bg-card-dark transition-colors group">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                    {icon}
                </div>
                <div>
                    <h4 className="font-bold text-sm">{label}</h4>
                    <p className="text-xs text-white/40 mt-0.5">{description || date}</p>
                </div>
            </div>
            <div className="text-right">
                <p className={`font-bold ${isNegative ? 'text-red-500' : 'text-secondary'}`}>
                    {formattedAmount}
                </p>
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 text-white/40`}>
                    {status || 'Completed'}
                </span>
            </div>
        </div>
    );
};

export default TransactionItem;
