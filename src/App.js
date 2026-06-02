import React, { useState } from 'react';
import './App.css';
import IdentifySmallest from './IdentifySmallest';
import FingerCounting from './FingerCounting';
import DecomposeNumber from './DecomposeNumber';
import AddSubtotals from './AddSubtotals';
import { multiplyWithVisualization } from './multiplicationLogic';

function App() {
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [largestNum, setLargestNum] = useState(null);
  const [smallestNum, setSmallestNum] = useState(null);
  const [step2Blocks, setStep2Blocks] = useState([]);
  const [step4Subtotals, setStep4Subtotals] = useState({});

  const handleMultiply = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentStep(0);
    setCompletedSteps([]);
    setLargestNum(null);
    setSmallestNum(null);
    setStep2Blocks([]);

    try {
      const localResult = multiplyWithVisualization(parseInt(num1, 10), parseInt(num2, 10));
      setResult(localResult);
      setCurrentStep(1); // Move to first step
    } catch (err) {
      setError(err.message || 'Error performing multiplication.');
    } finally {
      setLoading(false);
    }
  };

  const completeStep = (stepNum, stepData) => {
    setCompletedSteps((prev) => [...prev, { stepNum, stepData, timestamp: Date.now() }]);
    if (stepNum < 7) {
      setCurrentStep(stepNum + 1);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎓 Simple Multiplication</h1>
      </header>

      <main className="app-main">
        {currentStep === 0 && (
          <div className="input-section-full">
            <form onSubmit={handleMultiply}>
              <div className="input-container">
                <div className="input-group-large">
                  <label htmlFor="num1">First Number</label>
                  <input
                    id="num1"
                    type="number"
                    min="0"
                    max="100"
                    value={num1}
                    onChange={(e) => setNum1(e.target.value)}
                    placeholder="0"
                    disabled={loading}
                    className="input-large"
                  />
                </div>

                <div className="multiply-symbol">×</div>

                <div className="input-group-large">
                  <label htmlFor="num2">Second Number</label>
                  <input
                    id="num2"
                    type="number"
                    min="0"
                    max="100"
                    value={num2}
                    onChange={(e) => setNum2(e.target.value)}
                    placeholder="0"
                    disabled={loading}
                    className="input-large"
                  />
                </div>

                <div className="equals-symbol">=</div>
                <div 
                  className="question-mark"
                  onClick={() => {
                    if (num1 && num2) {
                      handleMultiply();
                    }
                  }}
                  style={{ cursor: num1 && num2 ? 'pointer' : 'default' }}
                >
                  ?
                </div>
              </div>
            </form>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}
          </div>
        )}

        {result && currentStep > 0 && (
          <div className={`notebook-layout ${currentStep === 5 ? 'with-answer' : 'no-answer'}`}>
            {/* LEFT: Problem Statement */}
            <div className="notebook-left">
              <div 
                className="problem-statement"
                onClick={() => {
                  setCurrentStep(0);
                  setNum1('');
                  setNum2('');
                  setResult(null);
                  setCompletedSteps([]);
                  setLargestNum(null);
                  setStep2Blocks([]);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="equation-display">
                  <span className="num">{result.num1}</span>
                  <span className="op">×</span>
                  <span className="num">{result.num2}</span>
                  <span className="op">=</span>
                  <span className="result">?</span>
                </div>
              </div>

              {/* Navigation blocks */}
              <div className="navigation-blocks">
                {/* Block 1: Largest */}
                <div 
                  className={`nav-block ${completedSteps.some(s => s.stepNum === 1) ? 'completed' : ''} ${currentStep === 1 ? 'current' : ''}`}
                  onClick={() => {
                    if (currentStep !== 1 && currentStep > 0) setCurrentStep(1);
                  }}
                >
                  <div className="nav-block-label"><span className="nav-step-num">1.</span> Largest</div>
                  <div className="nav-block-value">{largestNum || '?'}</div>
                </div>

                {/* Block 2: Break */}
                <div 
                  className={`nav-block ${completedSteps.some(s => s.stepNum === 2) ? 'completed' : ''} ${currentStep === 2 ? 'current' : ''}`}
                  onClick={() => {
                    if (currentStep !== 2 && currentStep > 1) setCurrentStep(2);
                  }}
                >
                  <div className="nav-block-label"><span className="nav-step-num">2.</span> Break</div>
                  <div className="nav-block-value">{largestNum || '?'}</div>
                </div>

                {/* Block 3: Smallest */}
                <div 
                  className={`nav-block ${completedSteps.some(s => s.stepNum === 3) ? 'completed' : ''} ${currentStep === 3 ? 'current' : ''}`}
                  onClick={() => {
                    if (currentStep !== 3 && currentStep > 2) setCurrentStep(3);
                  }}
                >
                  <div className="nav-block-label"><span className="nav-step-num">3.</span> Smallest</div>
                  <div className="nav-block-value">{smallestNum || '?'}</div>
                </div>

                {/* Block 4: Counting */}
                <div 
                  className={`nav-block ${completedSteps.some(s => s.stepNum === 4) ? 'completed' : ''} ${currentStep === 4 ? 'current' : ''}`}
                  onClick={() => {
                    if (currentStep !== 4 && currentStep > 3) setCurrentStep(4);
                  }}
                >
                  <div className="nav-block-label"><span className="nav-step-num">4.</span> Counting</div>
                  <div className="nav-block-icon">🖐️</div>
                </div>

                {/* Block 5: Total */}
                <div 
                  className={`nav-block ${completedSteps.some(s => s.stepNum === 5) ? 'completed' : ''} ${currentStep === 5 ? 'current' : ''}`}
                  onClick={() => {
                    if (currentStep !== 5 && currentStep > 4) setCurrentStep(5);
                  }}
                >
                  <div className="nav-block-label"><span className="nav-step-num">5.</span> Total</div>
                  <div className="nav-block-icon">🧮</div>
                </div>
              </div>
            </div>

            {/* CENTER: Current Step Work Area */}
            <div className="notebook-center">
              {/* Step 1: Identify Smallest Number */}
              {currentStep === 1 && (
                <IdentifySmallest
                  num1={result.num1}
                  num2={result.num2}
                  A={result.A}
                  B={result.B}
                  onComplete={(largest) => {
                    setLargestNum(largest);
                    completeStep(1, { largest });
                  }}
                />
              )}

              {/* Step 2: Decompose the Largest Number */}
              {currentStep === 2 && (
                <DecomposeNumber
                  A={result.A}
                  B={result.B}
                  num1={result.num1}
                  num2={result.num2}
                  decomposedA={result.step1}
                  initialSelectedBlocks={step2Blocks}
                  onComplete={(selectedBlocks) => {
                    setStep2Blocks(selectedBlocks);
                    completeStep(2, { selectedBlocks });
                  }}
                />
              )}

              {/* Step 3: Select Smallest Number for Counting */}
              {currentStep === 3 && (
                <IdentifySmallest
                  num1={result.num1}
                  num2={result.num2}
                  A={result.A}
                  B={result.B}
                  mode="smallest"
                  onComplete={(smallest) => {
                    setSmallestNum(smallest);
                    completeStep(3, { smallest });
                  }}
                />
              )}

              {/* Step 4: Counting Display */}
              {currentStep === 4 && (
                <FingerCounting
                  A={result.A}
                  B={result.B}
                  num1={result.num1}
                  num2={result.num2}
                  largestNum={largestNum}
                  smallestNum={smallestNum}
                  selectedBlocks={step2Blocks}
                  onComplete={(subtotals) => {
                    setStep4Subtotals(subtotals);
                    completeStep(4, { subtotals });
                  }}
                />
              )}

              {/* Step 5: Add Subtotals */}
              {currentStep === 5 && (
                <AddSubtotals
                  subtotals={step4Subtotals}
                  expectedResult={result.result}
                  onComplete={() => completeStep(5, {})}
                />
              )}

              {/* Step 6: Final Answer */}
              {currentStep === 6 && (
                <div className="final-answer-display">
                  <div className="final-equation">
                    <span className="big-num">{result.num1}</span>
                    <span className="big-op">×</span>
                    <span className="big-num">{result.num2}</span>
                    <span className="big-op">=</span>
                    <span className="big-answer">{result.result}</span>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Answer Derivation - Only show on final step */}
            {currentStep === 6 && (
              <div className="notebook-right">
                <div className="derivation-title">Answer</div>
                <div className="answer-display">
                  <div className="answer-value">{result.result}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>🎈</p>
      </footer>
    </div>
  );
}

export default App;
