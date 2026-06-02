import React, { useState, useEffect } from 'react';

const CountingPalm = ({ enabledSegments = 14, blockType = 'one', blockCount = 0, requiredCount = 0, onComplete = null, onProgress = null }) => {
  const [selectedSegments, setSelectedSegments] = useState([]);

  // Determine multiplier based on block type
  const getMultiplier = () => {
    // For 1s placeholder, use the actual count of ones
    if (blockType === 'one') {
      return blockCount;
    }
    
    const multipliers = {
      five: 5,
      ten: 10,
      fifty: 50,
      hundred: 100
    };
    return multipliers[blockType] || 1;
  };

  const multiplier = getMultiplier();
  // Require at least the currently available segment count for counting rounds
  // (example: 5 x 2 should need selecting two 5-segments, not one).
  const targetSegments = Math.max(requiredCount, enabledSegments);
  const targetTotal = targetSegments * multiplier;

  // Selection order: 1→2→3→4→5→6→7→8→9→10→11→12→13→14 (right to left, top to bottom)
  const selectionOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  // Get the display value for a segment
  const getSegmentValue = (segmentNum) => multiplier;

  // Calculate total selected value
  const selectedTotal = selectedSegments.length * multiplier;

  // Reset finger selections when switching to another placeholder type.
  useEffect(() => {
    setSelectedSegments([]);
  }, [blockType]);

  // Report running total as user selects or deselects segments.
  useEffect(() => {
    if (onProgress) {
      onProgress(selectedSegments.length, selectedTotal);
    }
  }, [selectedSegments, selectedTotal, onProgress]);

  // Auto-complete when target total is reached
  useEffect(() => {
    if (targetTotal > 0 && selectedTotal === targetTotal && onComplete) {
      const timer = setTimeout(() => {
        onComplete(selectedSegments.length);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedTotal, targetTotal, onComplete, selectedSegments]);

  // Helper function to check if a segment should be enabled
  const isSegmentEnabled = (segmentNum) => segmentNum <= enabledSegments;

  // Handle segment click - hierarchical selection with max limit
  const handleSegmentClick = (segmentNum) => {
    if (!isSegmentEnabled(segmentNum)) return;

    // Don't allow selecting if we've already reached the target
    if (selectedTotal >= targetTotal && !selectedSegments.includes(segmentNum)) {
      return;
    }

    const orderIndex = selectionOrder.indexOf(segmentNum);
    
    if (selectedSegments.includes(segmentNum)) {
      // Deselect: can only deselect if no higher segments are selected
      const maxSelectedIndex = Math.max(...selectedSegments.map(s => selectionOrder.indexOf(s)));
      if (orderIndex === maxSelectedIndex) {
        setSelectedSegments(selectedSegments.filter(s => s !== segmentNum));
      }
    } else {
      // Select: can only select if all previous segments are selected
      if (orderIndex === 0 || selectedSegments.includes(selectionOrder[orderIndex - 1])) {
        setSelectedSegments([...selectedSegments, segmentNum]);
      }
    }
  };

  if (!enabledSegments || enabledSegments === 0) {
    return (
      <div className="counting-palm disabled" style={{ opacity: 0.2, cursor: 'default', fontSize: '80px', lineHeight: 1 }}>
        🖐️
      </div>
    );
  }

  return (
    <div className="counting-palm enabled" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: '2px' }}>
      <svg viewBox="18 28 125 144" width="100%" height="100%" style={{ cursor: 'pointer', maxWidth: '100%', maxHeight: '100%' }} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="fingerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ffc9a8', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#f5b9a4', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="fingerGradDisabled" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#e8c9b8', stopOpacity: 0.4 }} />
            <stop offset="100%" style={{ stopColor: '#d9b5a4', stopOpacity: 0.3 }} />
          </linearGradient>
          <linearGradient id="fingerGradSelected" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#2ECC71', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#27AE60', stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* Thumb (13, 14) - 2 segments */}
        <g transform="rotate(-30 31.5 145)">
          <rect x="25" y="75" width="13" height="35" rx="6.5" fill={selectedSegments.includes(13) ? "url(#fingerGradSelected)" : (isSegmentEnabled(13) ? "url(#fingerGrad)" : "url(#fingerGradDisabled)")} stroke="#d9876d" strokeWidth="1" opacity={isSegmentEnabled(13) ? 1 : 0.4} pointerEvents="auto" onClick={() => isSegmentEnabled(13) && handleSegmentClick(13)} />
          <line x1="25" y1="110" x2="38" y2="110" stroke="#d9876d" strokeWidth="1.5" opacity={isSegmentEnabled(13) ? 1 : 0.3} pointerEvents="none" />
          <text x="31.5" y="92.5" textAnchor="middle" fontSize="7" fontWeight="bold" fill={isSegmentEnabled(13) ? "#2a2a2a" : "#999"} opacity={isSegmentEnabled(13) ? 1 : 0.4} pointerEvents="none">{getSegmentValue(13)}</text>
          <rect x="25" y="110" width="13" height="35" rx="6.5" fill={selectedSegments.includes(14) ? "url(#fingerGradSelected)" : (isSegmentEnabled(14) ? "url(#fingerGrad)" : "url(#fingerGradDisabled)")} stroke="#d9876d" strokeWidth="1" opacity={isSegmentEnabled(14) ? 1 : 0.4} pointerEvents="auto" onClick={() => isSegmentEnabled(14) && handleSegmentClick(14)} />
          <text x="31.5" y="127.5" textAnchor="middle" fontSize="7" fontWeight="bold" fill={isSegmentEnabled(14) ? "#2a2a2a" : "#999"} opacity={isSegmentEnabled(14) ? 1 : 0.4} pointerEvents="none">{getSegmentValue(14)}</text>
        </g>

        {/* Index finger (10, 11, 12) - 3 segments */}
        <g>
          <rect x="52" y="50" width="14" height="31.67" rx="7" fill={selectedSegments.includes(10) ? "url(#fingerGradSelected)" : (isSegmentEnabled(10) ? "url(#fingerGrad)" : "url(#fingerGradDisabled)")} stroke="#d9876d" strokeWidth="1" opacity={isSegmentEnabled(10) ? 1 : 0.4} pointerEvents="auto" onClick={() => isSegmentEnabled(10) && handleSegmentClick(10)} />
          <line x1="52" y1="81.67" x2="66" y2="81.67" stroke="#d9876d" strokeWidth="1.5" opacity={isSegmentEnabled(10) ? 1 : 0.3} pointerEvents="none" />
          <text x="59" y="65.8" textAnchor="middle" fontSize="6" fontWeight="bold" fill={isSegmentEnabled(10) ? "#2a2a2a" : "#999"} opacity={isSegmentEnabled(10) ? 1 : 0.4} pointerEvents="none">{getSegmentValue(10)}</text>
          <rect x="52" y="81.67" width="14" height="31.67" rx="7" fill={selectedSegments.includes(11) ? "url(#fingerGradSelected)" : (isSegmentEnabled(11) ? "url(#fingerGrad)" : "url(#fingerGradDisabled)")} stroke="#d9876d" strokeWidth="1" opacity={isSegmentEnabled(11) ? 1 : 0.4} pointerEvents="auto" onClick={() => isSegmentEnabled(11) && handleSegmentClick(11)} />
          <line x1="52" y1="113.33" x2="66" y2="113.33" stroke="#d9876d" strokeWidth="1.5" opacity={isSegmentEnabled(11) ? 1 : 0.3} pointerEvents="none" />
          <text x="59" y="97.5" textAnchor="middle" fontSize="6" fontWeight="bold" fill={isSegmentEnabled(11) ? "#2a2a2a" : "#999"} opacity={isSegmentEnabled(11) ? 1 : 0.4} pointerEvents="none">{getSegmentValue(11)}</text>
          <rect x="52" y="113.33" width="14" height="31.67" rx="7" fill={selectedSegments.includes(12) ? "url(#fingerGradSelected)" : (isSegmentEnabled(12) ? "url(#fingerGrad)" : "url(#fingerGradDisabled)")} stroke="#d9876d" strokeWidth="1" opacity={isSegmentEnabled(12) ? 1 : 0.4} pointerEvents="auto" onClick={() => isSegmentEnabled(12) && handleSegmentClick(12)} />
          <text x="59" y="129.2" textAnchor="middle" fontSize="6" fontWeight="bold" fill={isSegmentEnabled(12) ? "#2a2a2a" : "#999"} opacity={isSegmentEnabled(12) ? 1 : 0.4} pointerEvents="none">{getSegmentValue(12)}</text>
        </g>

        {/* Middle finger (7, 8, 9) - 3 segments */}
        <g>
          <rect x="73" y="35" width="14" height="36.67" rx="7" fill={selectedSegments.includes(7) ? "url(#fingerGradSelected)" : (isSegmentEnabled(7) ? "url(#fingerGrad)" : "url(#fingerGradDisabled)")} stroke="#d9876d" strokeWidth="1" opacity={isSegmentEnabled(7) ? 1 : 0.4} pointerEvents="auto" onClick={() => isSegmentEnabled(7) && handleSegmentClick(7)} />
          <line x1="73" y1="71.67" x2="87" y2="71.67" stroke="#d9876d" strokeWidth="1.5" opacity={isSegmentEnabled(7) ? 1 : 0.3} pointerEvents="none" />
          <text x="80" y="53.3" textAnchor="middle" fontSize="6" fontWeight="bold" fill={isSegmentEnabled(7) ? "#2a2a2a" : "#999"} opacity={isSegmentEnabled(7) ? 1 : 0.4} pointerEvents="none">{getSegmentValue(7)}</text>
          <rect x="73" y="71.67" width="14" height="36.67" rx="7" fill={selectedSegments.includes(8) ? "url(#fingerGradSelected)" : (isSegmentEnabled(8) ? "url(#fingerGrad)" : "url(#fingerGradDisabled)")} stroke="#d9876d" strokeWidth="1" opacity={isSegmentEnabled(8) ? 1 : 0.4} pointerEvents="auto" onClick={() => isSegmentEnabled(8) && handleSegmentClick(8)} />
          <line x1="73" y1="108.33" x2="87" y2="108.33" stroke="#d9876d" strokeWidth="1.5" opacity={isSegmentEnabled(8) ? 1 : 0.3} pointerEvents="none" />
          <text x="80" y="90" textAnchor="middle" fontSize="6" fontWeight="bold" fill={isSegmentEnabled(8) ? "#2a2a2a" : "#999"} opacity={isSegmentEnabled(8) ? 1 : 0.4} pointerEvents="none">{getSegmentValue(8)}</text>
          <rect x="73" y="108.33" width="14" height="36.67" rx="7" fill={selectedSegments.includes(9) ? "url(#fingerGradSelected)" : (isSegmentEnabled(9) ? "url(#fingerGrad)" : "url(#fingerGradDisabled)")} stroke="#d9876d" strokeWidth="1" opacity={isSegmentEnabled(9) ? 1 : 0.4} pointerEvents="auto" onClick={() => isSegmentEnabled(9) && handleSegmentClick(9)} />
          <text x="80" y="126.7" textAnchor="middle" fontSize="6" fontWeight="bold" fill={isSegmentEnabled(9) ? "#2a2a2a" : "#999"} opacity={isSegmentEnabled(9) ? 1 : 0.4} pointerEvents="none">{getSegmentValue(9)}</text>
        </g>

        {/* Ring finger (4, 5, 6) - 3 segments */}
        <g>
          <rect x="92" y="55" width="14" height="30" rx="7" fill={selectedSegments.includes(4) ? "url(#fingerGradSelected)" : (isSegmentEnabled(4) ? "url(#fingerGrad)" : "url(#fingerGradDisabled)")} stroke="#d9876d" strokeWidth="1" opacity={isSegmentEnabled(4) ? 1 : 0.4} pointerEvents="auto" onClick={() => isSegmentEnabled(4) && handleSegmentClick(4)} />
          <line x1="92" y1="85" x2="106" y2="85" stroke="#d9876d" strokeWidth="1.5" opacity={isSegmentEnabled(4) ? 1 : 0.3} pointerEvents="none" />
          <text x="99" y="70" textAnchor="middle" fontSize="6" fontWeight="bold" fill={isSegmentEnabled(4) ? "#2a2a2a" : "#999"} opacity={isSegmentEnabled(4) ? 1 : 0.4} pointerEvents="none">{getSegmentValue(4)}</text>
          <rect x="92" y="85" width="14" height="30" rx="7" fill={selectedSegments.includes(5) ? "url(#fingerGradSelected)" : (isSegmentEnabled(5) ? "url(#fingerGrad)" : "url(#fingerGradDisabled)")} stroke="#d9876d" strokeWidth="1" opacity={isSegmentEnabled(5) ? 1 : 0.4} pointerEvents="auto" onClick={() => isSegmentEnabled(5) && handleSegmentClick(5)} />
          <line x1="92" y1="115" x2="106" y2="115" stroke="#d9876d" strokeWidth="1.5" opacity={isSegmentEnabled(5) ? 1 : 0.3} pointerEvents="none" />
          <text x="99" y="100" textAnchor="middle" fontSize="6" fontWeight="bold" fill={isSegmentEnabled(5) ? "#2a2a2a" : "#999"} opacity={isSegmentEnabled(5) ? 1 : 0.4} pointerEvents="none">{getSegmentValue(5)}</text>
          <rect x="92" y="115" width="14" height="30" rx="7" fill={selectedSegments.includes(6) ? "url(#fingerGradSelected)" : (isSegmentEnabled(6) ? "url(#fingerGrad)" : "url(#fingerGradDisabled)")} stroke="#d9876d" strokeWidth="1" opacity={isSegmentEnabled(6) ? 1 : 0.4} pointerEvents="auto" onClick={() => isSegmentEnabled(6) && handleSegmentClick(6)} />
          <text x="99" y="130" textAnchor="middle" fontSize="6" fontWeight="bold" fill={isSegmentEnabled(6) ? "#2a2a2a" : "#999"} opacity={isSegmentEnabled(6) ? 1 : 0.4} pointerEvents="none">{getSegmentValue(6)}</text>
        </g>

        {/* Little finger (1, 2, 3) - 3 segments */}
        <g>
          <rect x="110" y="70" width="14" height="25" rx="7" fill={selectedSegments.includes(1) ? "url(#fingerGradSelected)" : (isSegmentEnabled(1) ? "url(#fingerGrad)" : "url(#fingerGradDisabled)")} stroke="#d9876d" strokeWidth="1" opacity={isSegmentEnabled(1) ? 1 : 0.4} pointerEvents="auto" onClick={() => isSegmentEnabled(1) && handleSegmentClick(1)} />
          <line x1="110" y1="95" x2="124" y2="95" stroke="#d9876d" strokeWidth="1.5" opacity={isSegmentEnabled(1) ? 1 : 0.3} pointerEvents="none" />
          <text x="117" y="82.5" textAnchor="middle" fontSize="6" fontWeight="bold" fill={isSegmentEnabled(1) ? "#2a2a2a" : "#999"} opacity={isSegmentEnabled(1) ? 1 : 0.4} pointerEvents="none">{getSegmentValue(1)}</text>
          <rect x="110" y="95" width="14" height="25" rx="7" fill={selectedSegments.includes(2) ? "url(#fingerGradSelected)" : (isSegmentEnabled(2) ? "url(#fingerGrad)" : "url(#fingerGradDisabled)")} stroke="#d9876d" strokeWidth="1" opacity={isSegmentEnabled(2) ? 1 : 0.4} pointerEvents="auto" onClick={() => isSegmentEnabled(2) && handleSegmentClick(2)} />
          <line x1="110" y1="120" x2="124" y2="120" stroke="#d9876d" strokeWidth="1.5" opacity={isSegmentEnabled(2) ? 1 : 0.3} pointerEvents="none" />
          <text x="117" y="107.5" textAnchor="middle" fontSize="6" fontWeight="bold" fill={isSegmentEnabled(2) ? "#2a2a2a" : "#999"} opacity={isSegmentEnabled(2) ? 1 : 0.4} pointerEvents="none">{getSegmentValue(2)}</text>
          <rect x="110" y="120" width="14" height="25" rx="7" fill={selectedSegments.includes(3) ? "url(#fingerGradSelected)" : (isSegmentEnabled(3) ? "url(#fingerGrad)" : "url(#fingerGradDisabled)")} stroke="#d9876d" strokeWidth="1" opacity={isSegmentEnabled(3) ? 1 : 0.4} pointerEvents="auto" onClick={() => isSegmentEnabled(3) && handleSegmentClick(3)} />
          <text x="117" y="132.5" textAnchor="middle" fontSize="6" fontWeight="bold" fill={isSegmentEnabled(3) ? "#2a2a2a" : "#999"} opacity={isSegmentEnabled(3) ? 1 : 0.4} pointerEvents="none">{getSegmentValue(3)}</text>
        </g>
      </svg>
    </div>
  );
};

export default CountingPalm;
