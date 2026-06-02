import React, { useState, useEffect } from 'react';
import './FingerCounting.css';
import './DecomposeNumber.css';
import CountingPalm from './CountingPalm';

function FingerCounting({ A, B, num1, num2, largestNum, selectedBlocks = [], onComplete }) {
  const [displayedRows, setDisplayedRows] = useState(0);
  const [selectedPlaceholderType, setSelectedPlaceholderType] = useState(null);
  const [placeholderTotals, setPlaceholderTotals] = useState({});
  const [completedPlaceholders, setCompletedPlaceholders] = useState({});
  
  const blockTypes = [
    { type: 'hundred', label: '100', emoji: '🟥' },
    { type: 'fifty', label: '50', emoji: '🟧' },
    { type: 'ten', label: '10', emoji: '🟦' },
    { type: 'five', label: '5', emoji: '🟩' },
    { type: 'one', label: '1', emoji: '🟨' }
  ];

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

  // Auto-select the first available block type when none is selected.
  useEffect(() => {
    if (selectedPlaceholderType || selectedBlocks.length === 0) return;

    const priorityTypes = ['hundred', 'fifty', 'ten', 'five', 'one'];
    const firstWithBlocks = priorityTypes.find((type) =>
      selectedBlocks.some((block) => block.type === type)
    );

    if (firstWithBlocks) {
      setSelectedPlaceholderType(firstWithBlocks);
    }
  }, [selectedBlocks, selectedPlaceholderType]);

  // Animate rows appearing one by one
  useEffect(() => {
    if (displayedRows < B) {
      const timer = setTimeout(() => {
        setDisplayedRows(displayedRows + 1);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [displayedRows, B]);

  const handleClick = () => {
    // Show all rows immediately on click
    if (displayedRows < B) {
      setDisplayedRows(B);
    }
  };

  const handlePlaceholderClick = (type) => {
    const blocksOfType = selectedBlocks.filter((b) => b.type === type);
    if (blocksOfType.length > 0 && !completedPlaceholders[type]) {
      setSelectedPlaceholderType(type);
    }
  };

  const handlePlaceholderProgress = (type, segmentCount, runningTotal) => {
    setPlaceholderTotals((prev) => ({ ...prev, [type]: runningTotal }));

    const targetSegments = Math.max(
      selectedBlocks.filter((b) => b.type === type).length,
      Math.min(num1, num2)
    );

    setCompletedPlaceholders((prev) => ({
      ...prev,
      [type]: segmentCount >= targetSegments
    }));
  };

  const handlePlaceholderComplete = (type, count) => {
    const multipliers = { hundred: 100, fifty: 50, ten: 10, five: 5, one: 1 };
    const multiplier = multipliers[type] || 1;

    // Build updated state objects first
    const updatedTotals = { ...placeholderTotals, [type]: count * multiplier };
    const updatedCompleted = { ...completedPlaceholders, [type]: true };

    setPlaceholderTotals(updatedTotals);
    setCompletedPlaceholders(updatedCompleted);

    // Auto-select next available placeholder using the updated state
    const nextType = blockTypes.find(bt => {
      const blocks = selectedBlocks.filter((b) => b.type === bt.type);
      return blocks.length > 0 && !updatedCompleted[bt.type] && bt.type !== type;
    });
    // Keep current palm visible if there is no next placeholder
    setSelectedPlaceholderType(nextType?.type || type);
  };

  // Check if all placeholders with blocks are completed
  const allPlaceholdersCompleted = blockTypes.every(bt => {
    const hasBlocks = selectedBlocks.some(b => b.type === bt.type);
    return !hasBlocks || completedPlaceholders[bt.type];
  });

  return (
    <div className="finger-counting-display-container">
      <div className="finger-counting-display-step" onClick={handleClick} style={{ cursor: 'pointer' }}>
        {/* Show equation from previous step with smallest highlighted */}
        <div className="equation-highlight">
          <span className={`num-badge ${num1 < num2 ? 'largest' : ''}`}>
            {num1}
          </span>
          <span className="equation-op">×</span>
          <span className={`num-badge ${num2 < num1 ? 'largest' : ''}`}>
            {num2}
          </span>
        </div>

        {/* Break Result - white card matching Step 2's Your Structure */}
        <div className="lego-workspace finger-counting-card">
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

            const isActive = blocksOfType.length > 0;
            const isSelected = selectedPlaceholderType === blockDef.type;
            const isCompleted = completedPlaceholders[blockDef.type];

            return (
              <div
                key={blockDef.type}
                className={`placeholder-zone ${isSelected ? 'selected' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => handlePlaceholderClick(blockDef.type)}
                style={{ 
                  cursor: isActive && !isCompleted ? 'pointer' : 'default',
                  opacity: !isActive ? 0.4 : 1,
                  borderColor: isSelected ? '#2ECC71' : isCompleted ? '#27AE60' : '#ddd',
                  borderWidth: isSelected || isCompleted ? '3px' : '1px',
                  backgroundColor: isCompleted ? 'rgba(46, 204, 113, 0.1)' : isSelected ? 'rgba(46, 204, 113, 0.05)' : 'transparent'
                }}
              >
                <div className="placeholder-label">{blockDef.label}s</div>
                {blocksOfType.length === 0 ? (
                  <div className="placeholder-empty">—</div>
                ) : (
                  <>
                    <div className="blocks-stack">
                      {visibleBlocks.map((block, idx) => (
                        <div
                          key={`${blockDef.type}-${idx}`}
                          className="lego-block"
                          style={{
                            backgroundColor: getBlockColor(block.type),
                            bottom: `${idx * blockStep}px`,
                            zIndex: idx,
                            width: `${blockSize}px`,
                            height: `${blockSize}px`,
                            animation: 'none',
                            cursor: 'default'
                          }}
                        >
                          <span
                            className="lego-label"
                            style={{ fontSize: `${Math.max(14, Math.round(blockSize * 0.38))}px` }}
                          >
                            {block.value}
                          </span>
                        </div>
                      ))}
                    </div>
                    {blocksOfType.length > 1 && (
                      <div className="stack-count">{formatGroupedCount(blocksOfType.length)}</div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Totals row showing count for each placeholder */}
      <div className="placeholders-container" style={{ marginTop: '6px' }}>
        {blockTypes.map((blockDef) => {
          const isCompleted = !!completedPlaceholders[blockDef.type];
          const total = placeholderTotals[blockDef.type] || 0;

          return (
            <div
              key={`total-${blockDef.type}`}
              style={{
                padding: '8px',
                backgroundColor: isCompleted ? 'rgba(46, 204, 113, 0.1)' : '#f5f5f5',
                border: isCompleted ? '2px solid #2ECC71' : '1px solid #ddd',
                borderRadius: '8px',
                minWidth: '80px',
                textAlign: 'center',
                flex: '1',
                minHeight: '50px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{blockDef.label}s Total</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: isCompleted ? '#2ECC71' : '#999' }}>
                {total > 0 ? total : '—'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Single Counting Palm below all placeholders */}
      {selectedPlaceholderType && (
        <div style={{ 
          marginTop: '6px',
          padding: '4px 12px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '220px',
          minHeight: '220px',
          maxHeight: '220px',
          overflow: 'visible'
        }}>
          <CountingPalm
            key={selectedPlaceholderType}
            enabledSegments={Math.min(num1, num2)}
            blockType={selectedPlaceholderType}
            blockCount={selectedBlocks.filter((b) => b.type === selectedPlaceholderType).length}
            requiredCount={selectedBlocks.filter((b) => b.type === selectedPlaceholderType).length}
            onProgress={(segmentCount, runningTotal) => handlePlaceholderProgress(selectedPlaceholderType, segmentCount, runningTotal)}
            onComplete={(count) => handlePlaceholderComplete(selectedPlaceholderType, count)}
          />
        </div>
      )}

      {/* Next button when all placeholders are completed */}
      {allPlaceholdersCompleted && (
        <div className="feedback-section" style={{ marginTop: '6px' }}>
          <button className="next-btn" onClick={() => onComplete(placeholderTotals)}>
            ✓ Next
          </button>
        </div>
      )}
      </div>
    </div>
  );
}

export default FingerCounting;
