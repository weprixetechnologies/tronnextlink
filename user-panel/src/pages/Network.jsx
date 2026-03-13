import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import TreeNode from '../components/TreeNode';
import { Users, Info } from 'lucide-react';

const Network = () => {
    const [tree, setTree] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNetworkData = async () => {
            try {
                const [treeRes, statsRes] = await Promise.all([
                    axios.get('/network/tree'),
                    axios.get('/network/stats')
                ]);
                setTree(treeRes.data.data);
                setStats(statsRes.data.data);
            } catch (err) {
                console.error('Error fetching network data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchNetworkData();
    }, []);

    if (loading) return <div className="p-8 text-center text-white/40">Loading network tree...</div>;

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">My Network</h1>
                <p className="text-white/60">Visualize your referral structure and downline earnings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-card-dark border border-card-border flex flex-row items-center p-6 border-l-4 border-l-secondary rounded-2xl shadow-md">
                    <div className="bg-secondary/10 p-3 rounded-full text-secondary mr-4">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">Protocol Level 1</p>
                        <p className="text-3xl font-black text-white" style={{ letterSpacing: '-0.05em' }}>{stats?.level1Count || 0} Nodes</p>
                    </div>
                </div>
                <div className="bg-card-dark border border-card-border flex flex-row items-center p-6 border-l-4 border-l-primary rounded-2xl shadow-md">
                    <div className="bg-primary/10 p-3 rounded-full text-primary mr-4">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">Protocol Level 2</p>
                        <p className="text-3xl font-black text-white" style={{ letterSpacing: '-0.05em' }}>{stats?.level2Count || 0} Nodes</p>
                    </div>
                </div>
            </div>

            <div className="bg-card-dark border border-card-border rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold flex items-center">
                        Network Structure (Up to L2)
                    </h3>
                    <div className="flex items-center text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
                        <Info size={14} className="mr-1" />
                        Click nodes to expand/collapse
                    </div>
                </div>

                <div className="bg-bg-dark/50 p-6 rounded-2xl border border-card-border min-h-[400px]">
                    {tree.length > 0 ? (
                        tree.map((node) => (
                            <TreeNode key={node.id} node={node} />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-white/20 py-20">
                            <Users size={48} className="mb-4 opacity-20" />
                            <p>No referrals in your network yet.</p>
                            <p className="text-xs">Invite users with your referral link to build your team!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Network;
