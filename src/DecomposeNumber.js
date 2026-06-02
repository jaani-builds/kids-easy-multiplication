import React, { useState, useEffect, useRef } from 'react';
import './DecomposeNumber.css';

/**
 * DecomposeNumber - Step 2: Interactive block selection to decompose A
 * Kid selects blocks to make the correct decomposition
 */
function DecomposeNumber({ A, B, num1, num2, initialSelectedBlocks = [], onComplete }) {
  const [selectedBlocks, setSelectedBlocks] = useState(initialSelectedBlocks);
  const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect', null
  const [draggedItem, setDraggedItem] = useState(null);
  const [isDragOverStructure, setIsDragOverStructure] = useState(false);
  const [isDragOverHeap, setIsDragOverHeap] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [isAddingAnim, setIsAddingAnim] = useState(false);
  const previousTotalRef = useRef(initialSelectedBlocks.reduce((sum, block) => sum + block.value, 0));

  const getBlockColor = (type) => {
    const colorMap = {
      hundred: '#E8001C',
      fifty: '#FF6B00',
      ten: '#FFD700',
      five: '#00A651',
      one: '#006DB7'
    };
    return colorMap[type] || '#999';
  };

  const blockTypes = [
    { type: 'hundred', label: '100', value: 100 },
    { type: 'fifty', label: '50', value: 50 },
    { type: 'ten', label: '10', value: 10 },
    { type: 'five', label: '5', value: 5 },
    { type: 'one', label: '1', value: 1 }
  ];

  const mergeRules = [
    { fromType: 'one', toType: 'five', requiredCount: 5 },
    { fromType: 'five', toType: 'ten', requiredCount: 2 },
    { fromType: 'ten', toType: 'fifty', requiredCount: 5 },
    { fromType: 'fifty', toType: 'hundred', requiredCount: 2 }
  ];

  // Calculate total value of selected blocks
  const selectedTotal = selectedBlocks.reduce((sum, block) => sum + block.value, 0);
  const isOverflow = selectedTotal > A;
  const isExactMatch = selectedTotal === A;
  const blockCounts = selectedBlocks.reduce((acc, block) => {
    acc[block.type] = (acc[block.type] || 0) + 1;
    return acc;
  }, {});
  const pendingMergeRule = mergeRules.find((rule) => (blockCounts[rule.fromType] || 0) >= rule.requiredCount) || null;
  const isMergeMode = Boolean(pendingMergeRule);
  // Progress bar grows until it reaches the target, then turns red if exceeded
  const fillPercent = Math.min((selectedTotal / A) * 100, 100);
  // Marker positions: on overflow, show target within bar and selected at the end
  const targetMarkerPercent = isOverflow ? (A / selectedTotal) * 100 : 100;
  const totalMarkerPercent = isOverflow ? 100 : fillPercent;

  const getCompactBlockSize = (count) => {
    if (count >= 20) return 30;
    if (count >= 10) return 34;
    if (count >= 5) return 40;
    if (count >= 3) return 48;
    return 56;
  };

  const formatGroupedCount = (count) => {
    if (count <= 5) return `×${count}`;
    const groupsOfFive = Math.floor(count / 5);
    const remainder = count % 5;
    return remainder > 0 ? `${groupsOfFive}×5 + ${remainder}` : `${groupsOfFive}×5`;
  };

  const getBlockDefByType = (type) => blockTypes.find((b) => b.type === type);
  const getTypeIndex = (type) => blockTypes.findIndex((b) => b.type === type);

  const applyMergeRule = (rule) => {
    if (!rule) return;

    setSelectedBlocks((prev) => {
      let toRemove = rule.requiredCount;
      const nextReversed = [];

      // Remove the most recently added blocks of the source type
      for (let idx = prev.length - 1; idx >= 0; idx -= 1) {
        const block = prev[idx];
        if (block.type === rule.fromType && toRemove > 0) {
          toRemove -= 1;
          continue;
        }
        nextReversed.push(block);
      }

      if (toRemove > 0) return prev;

      const next = nextReversed.reverse();
      const mergedBlockDef = getBlockDefByType(rule.toType);
      if (mergedBlockDef) {
        // Create a new block object with the merged type/value
        next.push({ type: mergedBlockDef.type, value: mergedBlockDef.value });
      }
      return next;
    });
  };

  // Animate when the selected total increases (a number is added)
  useEffect(() => {
    if (selectedTotal > previousTotalRef.current) {
      setIsAddingAnim(true);
      const timeoutId = setTimeout(() => setIsAddingAnim(false), 700);
      previousTotalRef.current = selectedTotal;
      return () => clearTimeout(timeoutId);
    }

    previousTotalRef.current = selectedTotal;
  }, [selectedTotal]);

  // Check if selection is correct
  useEffect(() => {
    if (selectedBlocks.length === 0) {
      setFeedback(null);
      setShowContinueButton(false);
      return;
    }

    // Pause regular validation while merge guidance is active
    if (isMergeMode) {
      setFeedback(null);
      setShowContinueButton(false);
      return;
    }

    // If exceeded the target, show red immediately
    if (isOverflow) {
      setFeedback('incorrect');
      setShowContinueButton(false);
      return;
    }

    // Check if selection hits the target total
    if (isExactMatch) {
      setFeedback('correct');
      setShowContinueButton(true);
    } else if (selectedTotal < A) {
      // Not enough blocks yet, no feedback
      setFeedback(null);
      setShowContinueButton(false);
    }
  }, [selectedBlocks, selectedTotal, A, isOverflow, isExactMatch, isMergeMode]);

  const handleBlockClick = (blockType) => {
    if (isMergeMode) return;
    const blockDef = blockTypes.find((b) => b.type === blockType);
    setSelectedBlocks((prev) => [...prev, blockDef]);
  };

  const handleClearAll = () => {
    if (isMergeMode) return;
    setSelectedBlocks([]);
    setFeedback(null);
    setShowContinueButton(false);
  };

  const handleRemoveBlock = (blockType) => {
    if (isMergeMode) return;
    setSelectedBlocks((prev) => {
      const removeIdx = [...prev].map((block) => block.type).lastIndexOf(blockType);
      if (removeIdx < 0) return prev;
      return prev.filter((_, idx) => idx !== removeIdx);
    });
  };

  // Handle drop with type validation
  const handleStructureDrop = (e, targetBlockType) => {
    e.preventDefault();
    setIsDragOverStructure(false);
    
    // Only allow if dragging from heap AND types match
    if (!isMergeMode && draggedItem?.source === 'heap' && draggedItem?.type === targetBlockType) {
      handleBlockClick(targetBlockType);
    }
    setDraggedItem(null);
  };

  return (
    <div className="decompose-container">
      {/* Show equation: num1 × num2, with A highlighted green */}
      <div className="decompose-equation">
        <span className={`decompose-num${num1 === A ? ' highlight-A' : ''}`}>{num1}</span>
        <span className="decompose-op">×</span>
        <span className={`decompose-num${num2 === A ? ' highlight-A' : ''}`}>{num2}</span>
      </div>

      {/* UNIFIED LEGO WORKSPACE CARD */}
      <div className={`lego-workspace ${feedback === 'correct' ? 'correct' : feedback === 'incorrect' ? 'incorrect' : ''} ${isMergeMode ? 'merge-mode' : ''}`}>
        {/* Top section: Selected blocks (your structure) */}
        <div className="your-structure">
          <div
            className="structure-display"
            style={{ opacity: isDragOverStructure ? 1 : 0.9 }}
          >
            {/* Always show progress bar section */}
            <div className="structure-progress-row">
              <div className="structure-progress-visual">
                <div className="progress-track">
                  {/* Main progress fill */}
                  <div
                    className={`progress-fill ${isOverflow ? 'overflow' : ''} ${isExactMatch ? 'correct' : ''} ${isAddingAnim ? 'adding' : ''}`}
                    style={{ width: `${fillPercent}%` }}
                  />
                  {/* Pattern only on overshot portion */}
                  {isOverflow && (
                    <div
                      className="progress-overshoot-pattern"
                      style={{ left: `${targetMarkerPercent}%` }}
                    />
                  )}
                  {/* Target marker line */}
                  <div 
                    className="progress-target-marker"
                    style={{ left: `${targetMarkerPercent}%` }}
                  />
                  <div
                    className="progress-target-value"
                    style={{ left: `${targetMarkerPercent}%` }}
                  >
                    {A}
                  </div>
                  {/* Selected marker line */}
                  {selectedTotal > 0 && (
                    <>
                      <div
                        className={`progress-selected-marker ${isOverflow ? 'overflow' : ''}`}
                        style={{ left: `${totalMarkerPercent}%` }}
                      />
                      <div
                        className={`progress-selected-value ${isOverflow ? 'overflow' : ''} ${isAddingAnim ? 'adding' : ''}`}
                        style={{ left: `${totalMarkerPercent}%` }}
                      >
                        {selectedTotal}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button 
                className={`bin-btn ${selectedBlocks.length === 0 || isMergeMode ? 'disabled' : ''}`} 
                onClick={handleClearAll} 
                title="Clear all"
                disabled={selectedBlocks.length === 0 || isMergeMode}
              >
                🗑
              </button>
            </div>

            {/* Block type placeholders */}
            <div className="placeholders-container">
              {blockTypes.map((blockDef) => {
                const blocksOfType = selectedBlocks.filter((b) => b.type === blockDef.type);
                const visibleBlocks = blocksOfType.slice(0, 5);
                const blockSize = getCompactBlockSize(blocksOfType.length);
                const stackViewportHeight = 64;
                const maxStepToFit = visibleBlocks.length > 1
                  ? Math.floor((stackViewportHeight - blockSize) / (visibleBlocks.length - 1))
                  : 0;
                const preferredStep = Math.round(blockSize * 0.22);
                const blockStep = visibleBlocks.length > 1
                  ? Math.max(4, Math.min(preferredStep, maxStepToFit))
                  : 0;
                const isMergeSource = pendingMergeRule?.fromType === blockDef.type;
                const isMergeTarget = pendingMergeRule?.toType === blockDef.type;
                const mergeShift = pendingMergeRule
                  ? getTypeIndex(pendingMergeRule.toType) - getTypeIndex(pendingMergeRule.fromType)
                  : 0;
                const mergeTravelPx = mergeShift * 132;
                const animatedMergeCount = pendingMergeRule
                  ? Math.min(visibleBlocks.length, pendingMergeRule.requiredCount)
                  : 0;
                const allowHeapDrop = !isMergeMode && draggedItem?.source === 'heap' && draggedItem?.type === blockDef.type;
                return (
                  <div
                    key={blockDef.type}
                    className={`placeholder-zone ${
                      allowHeapDrop
                        ? 'drag-over'
                        : ''
                    } ${isMergeSource ? 'merge-source' : ''} ${isMergeTarget ? 'merge-target' : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (allowHeapDrop) {
                        setIsDragOverStructure(true);
                      }
                    }}
                    onDragLeave={() => setIsDragOverStructure(false)}
                    onDrop={(e) => handleStructureDrop(e, blockDef.type)}
                  >
                    <div className="placeholder-label">{blockDef.label}s</div>
                    {blocksOfType.length === 0 ? (
                      <div className="placeholder-empty">—</div>
                    ) : (
                      <>
                        <div className={`blocks-stack ${isMergeSource && isMergeMode ? 'merge-source-stack' : ''}`}>
                          {visibleBlocks.map((block, idx) => (
                            (() => {
                              const isAnimatedMergeBlock = isMergeMode && isMergeSource && idx < animatedMergeCount;
                              const isLeadBlock = isAnimatedMergeBlock && idx === 0;
                              // Lead block shows target type as data attribute, but label stays as source
                              const targetBlockDef = isLeadBlock && pendingMergeRule 
                                ? getBlockDefByType(pendingMergeRule.toType)
                                : null;
                              return (
                            <div
                              key={`${blockDef.type}-${idx}`}
                              className={`lego-block removable ${isAnimatedMergeBlock ? 'merge-moving' : ''} ${isAnimatedMergeBlock && idx === 0 ? 'merge-lead' : ''}`}
                              title={`Value: ${block.value}`}
                              data-merge-target={targetBlockDef ? targetBlockDef.value : ''}
                              draggable={!isMergeMode}
                              onClick={() => {
                                if (isAnimatedMergeBlock && pendingMergeRule) {
                                  applyMergeRule(pendingMergeRule);
                                  return;
                                }
                                if (!isMergeMode) handleRemoveBlock(blockDef.type);
                              }}
                              onDragStart={() => {
                                if (isMergeMode) return;
                                setDraggedItem({ source: 'structure', type: blockDef.type });
                              }}
                              onDragEnd={() => {
                                setDraggedItem(null);
                              }}
                              style={{
                                backgroundColor: getBlockColor(block.type),
                                animation: isAnimatedMergeBlock ? undefined : `blockAppear 0.3s ease-out backwards`,
                                bottom: `${idx * blockStep}px`,
                                zIndex: idx,
                                width: `${blockSize}px`,
                                height: `${blockSize}px`,
                                '--merge-travel': `${mergeTravelPx}px`,
                                '--merge-index': idx,
                                '--merge-count': animatedMergeCount,
                                '--merge-target-color': targetBlockDef ? getBlockColor(targetBlockDef.type) : ''
                              }}
                            >
                              <span
                                className={`lego-label ${isLeadBlock ? 'merge-source-label' : ''}`}
                                style={{ fontSize: `${Math.max(14, Math.round(blockSize * 0.38))}px` }}
                              >
                                {block.value}
                              </span>
                            </div>
                              );
                            })()
                          ))}
                        </div>
                        {blocksOfType.length > 1 && (
                          <div className={`stack-count ${isMergeMode && isMergeSource ? 'merge-hidden' : ''}`}>
                            {formatGroupedCount(blocksOfType.length)}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom section: Available blocks heap */}
        <div
          className={`available-heap ${isDragOverHeap ? 'drag-over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            if (isMergeMode) return;
            setIsDragOverHeap(true);
          }}
          onDragLeave={() => setIsDragOverHeap(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOverHeap(false);
            if (!isMergeMode && draggedItem?.source === 'structure') {
              handleRemoveBlock(draggedItem.type);
            }
            setDraggedItem(null);
          }}
        >
          <div className="heap-display">
            {blockTypes.map((blockDef) => (
              <div
                key={blockDef.type}
                className={`lego-block-heap ${isMergeMode ? 'disabled' : ''} ${draggedItem?.source === 'heap' && draggedItem?.type === blockDef.type ? 'dragging' : ''}`}
                onClick={() => {
                  if (!isMergeMode) handleBlockClick(blockDef.type);
                }}
                draggable={!isMergeMode}
                onDragStart={() => {
                  if (isMergeMode) return;
                  setDraggedItem({ source: 'heap', type: blockDef.type });
                }}
                onDragEnd={() => {
                  setDraggedItem(null);
                  setIsDragOverHeap(false);
                  setIsDragOverStructure(false);
                }}
                style={{ backgroundColor: getBlockColor(blockDef.type) }}
                title={blockDef.label}
              >
                <span className="lego-heap-label">{blockDef.value}</span>
              </div>
            ))}
          </div>
        </div>

        {feedback === 'correct' && showContinueButton && (
          <div className="feedback-section">
            <button className="next-btn" onClick={() => onComplete(selectedBlocks)}>
              ✓ Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DecomposeNumber;
