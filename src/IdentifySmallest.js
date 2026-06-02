import React, { useState } from 'react';
import './IdentifySmallest.css';

/**
 * IdentifySmallest - Step 1: Identify which number is largest or smallest
 * Auto-completes when correct answer clicked
 * mode: 'largest' or 'smallest'
 */
function IdentifySmallest({ num1, num2, A, B, onComplete, mode = 'largest' }) {
  const [selectedNum, setSelectedNum] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const handleNumberClick = (num) => {
    const targetNum = mode === 'smallest' ? Math.min(num1, num2) : Math.max(num1, num2);

    if (num === targetNum) {
      setSelectedNum(num);
      setIsCorrect(true);
      setTimeout(() => {
        onComplete(num);
      }, 800);
    } else {
      setSelectedNum(num);
      setIsCorrect(false);
      setTimeout(() => {
        setSelectedNum(null);
        setIsCorrect(null);
      }, 400);
    }
  };

  const titleText = mode === 'smallest' ? 'Choose smallest' : 'Choose largest';

  return (
    <div className="identify-smallest-container">
      <div className="step-title-small">{titleText}</div>
      <div className="numbers-display">
        <div
          className={`number-button ${selectedNum === num1 ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
          onClick={() => handleNumberClick(num1)}
        >
          <span className="number-value">{num1}</span>
        </div>

        <div className="multiply-sign">×</div>

        <div
          className={`number-button ${selectedNum === num2 ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
          onClick={() => handleNumberClick(num2)}
        >
          <span className="number-value">{num2}</span>
        </div>
      </div>
    </div>
  );
}

export default IdentifySmallest;
