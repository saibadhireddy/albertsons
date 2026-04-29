/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, lazy } from 'react';
import './AgentPopup.css';
import { ArrowLeftIcon, RobotIcon, SendIcon } from '@databricks/design-system';

const SparkleRectangleIcon = lazy(() =>
  import('@databricks/design-system').then(mod => ({ default: mod.SparkleRectangleIcon }))
);
const DashIcon = lazy(() =>
  import('@databricks/design-system').then(mod => ({ default: mod.DashIcon }))
);
const CloseSmallIcon = lazy(() =>
  import('@databricks/design-system').then(mod => ({ default: mod.CloseSmallIcon }))
);
const ChevronRightIcon = lazy(() =>
  import('@databricks/design-system').then(mod => ({ default: mod.ChevronRightIcon }))
);

const SPACES = [
  {
    id: '1',
    name: 'MARGE',
    display_name: 'Marge',
    description:
      'Explore Outcomes, Campaign Data, Account & Contact Details, $DBU Consumption',
  },
  {
    id: '3',
    name: 'MARDI',
    display_name: 'Mardi',
    description:
      'Understand digital performance through insights on campaigns, offers, and trends',
  },
  {
    id: '5',
    name: 'PLANNING_GENIE',
    display_name: 'Maple',
    description: 'Understand marketing plans and campaign taxonomy',
  },
];

const AgentPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'selection' | 'list' | 'chat'>('selection');
  const [activeAgent, setActiveAgent] = useState('');
  const popupRef = useRef<HTMLDivElement | null>(null);

  const togglePopup = () => setIsOpen(!isOpen);

  const reset = () => {
    setView('selection');
    setActiveAgent('');
  };

  const handleSelectAgent = (
    name: string,
    nextView: 'chat' | 'list' | 'selection' = 'chat'
  ) => {
    setActiveAgent(name);
    setView(nextView);
  };

  // Minimize when clicking outside the popup
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // If you also want to reset the state when clicking outside, uncomment:
        // reset();
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isOpen]);
  // Pattern: add global listener, check ref.contains(target), then cleanup. [web:16][web:17][web:20][web:22]

  return (
    <div className="agent-wrapper">
      {!isOpen && (
        <button className="fab genie-fab" onClick={togglePopup}>
          <SparkleRectangleIcon
            style={{ fontSize: '28px', color: '#fff' }}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          />
        </button>
      )}

      {isOpen && (
        <div
          ref={popupRef}
          className={`popup-container genie-popup ${
            view === 'chat' ? 'genie-popup-chat' : ''
          }`}
        >
          {/* Header */}
          <div className="popup-header genie-header">
            <div className="header-left">
              {view !== 'selection' && (
                <button
                  className="icon-button back-button"
                  onClick={() => setView('selection')}
                  title="Back"
                >
                  <span className="back-arrow">
                    <ArrowLeftIcon
                      style={{ fontSize: '18px', color: '#fff' }}
                      onPointerEnterCapture={undefined}
                      onPointerLeaveCapture={undefined}
                    />
                  </span>
                </button>
              )}

              <SparkleRectangleIcon
                style={{ fontSize: '22px', color: '#fff' }}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              />
              <span className="header-title">
                {view === 'selection'
                    ? 'AI Agent Spaces'
                    : view === 'list'
                    ? 'Marketing Genie Spaces'
                    : activeAgent || 'Agent'}
                </span>

            </div>

            <div className="header-actions">
              <button
                className="icon-button"
                onClick={() => setIsOpen(false)}
                title="Minimise"
              >
                <DashIcon
                  style={{ fontSize: '18px', color: '#fff', marginTop: '6px' }}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                />
              </button>
              <button
                className="icon-button"
                onClick={() => {
                  setIsOpen(false);
                  reset();
                }}
                title="Close and Reset"
              >
                <CloseSmallIcon
                  style={{ fontSize: '20px', color: '#fff' }}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="popup-body genie-body">
            {view === 'selection' && (
              <div className="selection-view">
                <div
                  className="agent-card"
                  onClick={() => handleSelectAgent('Orchestrated Agent', 'chat')}
                >
                  <div className="agent-card-icon primary">
                    <RobotIcon
                      style={{ fontSize: '26px', color: '#143d4a' }}
                      onPointerEnterCapture={undefined}
                      onPointerLeaveCapture={undefined}
                    />
                  </div>
                  <p className="agent-card-title">Orchestrated Agent</p>
                </div>

                <div
                  className="agent-card"
                  onClick={() => {
                    setView('list');
                  }}
                >
                  <div className="agent-card-icon secondary">
                    <SparkleRectangleIcon
                      style={{ fontSize: '24px', color: '#143d4a' }}
                      onPointerEnterCapture={undefined}
                      onPointerLeaveCapture={undefined}
                    />
                  </div>
                  <p className="agent-card-title">Genie Spaces</p>
                </div>
              </div>
            )}

            {view === 'list' && (
              <div className="agent-list">
                {SPACES.map(space => (
                  <div
                    key={space.id}
                    className="list-item"
                    onClick={() => handleSelectAgent(space.display_name, 'chat')}
                  >
                    <div className="list-item-text">
                      <span className="list-item-title">{space.display_name}</span>
                      <span className="list-item-description">
                        {space.description}
                      </span>
                    </div>
                    <ChevronRightIcon
                      style={{ fontSize: '18px', color: '#143d4a' }}
                      onPointerEnterCapture={undefined}
                      onPointerLeaveCapture={undefined}
                    />
                  </div>
                ))}
              </div>
            )}

            {view === 'chat' && (
              <div className="chat-space chat-space-large">
                <div className="chat-messages">
                  <div className="chat-info-banner">⚙️ Work in progress</div>
                  <p className="bot-msg">
                    Hello! I am {activeAgent || 'your agent'}. How can I help you today?
                  </p>
                </div>

                <div className="question-box">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="question-input"
                      placeholder="Ask your Question"
                    />
                    <span className="send-icon" id="send-icon">
                      <SendIcon
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}
                      />
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentPopup;
