import React, { useState } from 'react';
import './AddSubtotals.css';

/**
 * AddSubtotals - Step 5: Calculate total of all subtotals
 * Kid adds up all the counted segments to get the final result
 */
function AddSubtotals({ subtotals, onComplete }) {
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Extract and sort subtotals
  const sortedSubtotals = Object.entries(subtotals)
    .filter(([key, value]) => value > 0)
    .sort(([keyA], [keyB]) => {
      const orderMap = { hundred: 0, fifty: 1, ten: 2, five: 3, one: 4 };
      return (orderMap[keyA] || 99) - (orderMap[keyB] || 99);
    });

  const total = sortedSubtotals.reduce((sum, [, val]) => sum + val, 0);

  const handleAnswerChange = (e) => {
    const value = e.target.value;
    setUserAnswer(value);
    setFeedback(null);
    setIsCorrect(null);
  };

  const handleSubmit = () => {
    const answer = parseInt(userAnswer, 10);
    if (isNaN(answer)) {
      setFeedback('Please enter a number');
      setIsCorrect(false);
      return;
    }

    if (answer === total) {
      setIsCorrect(true);
      setFeedback('✓ Correct!');
      setTimeout(() => {
        onComplete();
      }, 800);
    } else {
      setIsCorrect(false);
      setFeedback(`Not quite. Try again!`);
      setUserAnswer('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="add-subtotals-container">
      <div className="step-title-small">Add these up</div>

      <div className="subtotals-display">
        <div className="subtotals-list">
          {sortedSubtotals.map(([key, value]) => (
            <div key={key} className="subtotal-row">
              <div className="subtotal-value">{value}</div>
            </div>
          ))}
          <div className="subtotal-divider">_____</div>
          <div className="subtotal-row total-row">
            <div className="subtotal-label">Total</div>
            <input
              type="number"
              value={userAnswer}
              onChange={handleAnswerChange}
              onKeyPress={handleKeyPress}
              placeholder="?"
              className="answer-input"
              autoFocus
            />
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`feedback-message ${isCorrect ? 'correct' : 'incorrect'}`}>
          {feedback}
        </div>
      )}

      <button 
        className="check-btn"
        onClick={handleSubmit}
        disabled={!userAnswer}
      >
        Check
      </button>
    </div>
  );
}

export default AddSubtotals;
