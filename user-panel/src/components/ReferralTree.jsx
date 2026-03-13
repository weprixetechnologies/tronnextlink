import React, { useState, useCallback } from 'react';
import TreeNode from './TreeNode';
import EmptySlotNode from './EmptySlotNode';
import axios from '../api/axios';

const ReferralTree = ({ currentUser, level1 = [], referralLink }) => {
    // expandedNodes: Set of user IDs that are currently expanded
    const [expandedNodes, setExpandedNodes] = useState(new Set());

    // childrenCache: Map of userId → their children array
    const [childrenCache, setChildrenCache] = useState({});

    // loadingNodes: Set of user IDs currently being fetched
    const [loadingNodes, setLoadingNodes] = useState(new Set());

    // Collapse descendants recursively
    const doCollapse = (userId, currentExpanded, currentCache) => {
        currentExpanded.delete(userId);
        const children = (currentCache[userId] || []).filter(c => !c.isEmptySlot);
        children.forEach(child => doCollapse(child.id, currentExpanded, currentCache));
    };

    // Toggle expand/collapse of a node
    const handleNodeClick = useCallback(async (userId, hasReferrals) => {
        if (!hasReferrals) return;

        const newExpanded = new Set(expandedNodes);

        if (newExpanded.has(userId)) {
            // COLLAPSE
            doCollapse(userId, newExpanded, childrenCache);
            setExpandedNodes(newExpanded);
            return;
        }

        // EXPAND: fetch children if not cached
        if (!childrenCache[userId]) {
            setLoadingNodes(prev => new Set(prev).add(userId));
            try {
                const res = await axios.get(`/network/children/${userId}`);
                if (res.data?.success) {
                    const children = res.data.data?.children || [];
                    setChildrenCache(prev => ({
                        ...prev,
                        [userId]: children
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch children:', err);
                return;
            } finally {
                setLoadingNodes(prev => {
                    const next = new Set(prev);
                    next.delete(userId);
                    return next;
                });
            }
        }

        newExpanded.add(userId);
        setExpandedNodes(newExpanded);
    }, [expandedNodes, childrenCache]);

    // Render tree level recursively
    const renderLevel = (nodes, depth = 0, parentNode = null) => {
        // Calculate empty slots for this row
        let emptySlotCount = 0;
        let showBuyPlanNode = false;

        if (parentNode) {
            if (parentNode.slots_total === 0) {
                // Only show Buy Plan node if it's the first level or if we want to show it for nodes that have no plan
                // But according to rule 5: "If user has NO plan (slots_total = 0): Show special No Plan ghost node instead"
                // Let's only show "Buy Plan" for the root user for now to avoid cluttering deep levels, 
                // but the prompt says: "RULE 1 - Only show empty slots for the CURRENT USER's node" and "RULE 2 - Show empty slots for EXPANDED nodes too"
                showBuyPlanNode = true;
            } else {
                emptySlotCount = parentNode.slots_remaining || 0;
            }
        }

        // Cap display at 6 empty slots max
        const displayEmptyCount = Math.min(emptySlotCount, 6);
        const remainingMore = emptySlotCount > 6 ? emptySlotCount - 6 : 0;

        if ((!nodes || nodes.length === 0) && emptySlotCount === 0 && !showBuyPlanNode) return null;

        const totalRowItems = (nodes?.length || 0) + displayEmptyCount + (showBuyPlanNode ? 1 : 0);

        return (
            <div className="tree-level" style={{ '--depth': depth, '--siblings': totalRowItems }}>
                <div className="nodes-row">
                    {/* REAL FILLED NODES */}
                    {nodes && nodes.map(node => (
                        <div key={node.id} className="node-column">
                            <TreeNode
                                node={node}
                                isExpanded={expandedNodes.has(node.id)}
                                isLoading={loadingNodes.has(node.id)}
                                isCurrentUser={node.id === currentUser?.id}
                                onClick={() => handleNodeClick(node.id, node.direct_referrals_count > 0)}
                                depth={depth}
                            />

                            {/* Render children if expanded */}
                            {expandedNodes.has(node.id) && childrenCache[node.id] && (
                                <div className="children-container">
                                    <div className={`connector-line-down ${expandedNodes.has(node.id) ? 'active-line' : ''}`} />
                                    {renderLevel(childrenCache[node.id], depth + 1, node)}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* NO PLAN GHOST NODE */}
                    {showBuyPlanNode && (
                        <div className="node-column empty-slot">
                            <EmptySlotNode type="no-plan" />
                        </div>
                    )}

                    {/* EMPTY SLOT NODES */}
                    {Array.from({ length: displayEmptyCount }).map((_, i) => (
                        <div key={`empty-${i}`} className="node-column empty-slot">
                            <EmptySlotNode referralLink={referralLink} />
                            {i === 5 && remainingMore > 0 && (
                                <div style={{
                                    fontSize: '9px',
                                    fontWeight: '800',
                                    color: 'rgba(255,255,255,0.2)',
                                    marginTop: '8px',
                                    textAlign: 'center'
                                }}>
                                    +{remainingMore} MORE SLOTS
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {emptySlotCount === 0 && parentNode && parentNode.slots_total > 0 && nodes?.length >= parentNode.slots_total && (
                    <div className="mt-4 flex items-center justify-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full mx-auto w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                        <p className="text-[9px] font-black text-secondary uppercase tracking-[0.1em]">All slots filled! Upgrade plan for more</p>
                    </div>
                )}
            </div>
        );
    };

    // Root node = current user
    const rootNode = {
        ...currentUser,
        direct_referrals_count: currentUser?.level1Count || 0,
        isRoot: true,
        slots_total: currentUser?.slots_total || 0,
        slots_remaining: currentUser?.slots_remaining || (currentUser?.slots_total - currentUser?.slots_used) || 0,
    };

    return (
        <div className="referral-tree-container">
            {/* Root Node (YOU) */}
            <div className="root-wrapper">
                <TreeNode
                    node={rootNode}
                    isCurrentUser={true}
                    isRoot={true}
                    isExpanded={true}
                    onClick={() => { }}
                />
                {/* Connector from root down */}
                {((level1?.length > 0) || rootNode.slots_total === 0 || rootNode.slots_remaining > 0) && (
                    <div className="connector-line-down root-line" />
                )}
            </div>

            {/* Level 1 and beyond */}
            {renderLevel(level1, 1, rootNode)}
        </div>
    );
};

export default ReferralTree;
