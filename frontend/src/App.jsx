import React, { useState, useEffect, useRef } from 'react';
import CodeEditor from './components/CodeEditor';
import SteppingControls from './components/SteppingControls';
import VisualizationCanvas from './components/VisualizationCanvas';
import StdoutDrawer from './components/StdoutDrawer';
import SettingsModal from './components/SettingsModal';
import { AnimationSettingsProvider } from './context/AnimationSettingsContext';
import { Play, AlertCircle, Loader2, Code2, Share2, CheckCheck, ChevronDown, PanelLeftClose, PanelLeftOpen, Settings, Sun, Moon } from 'lucide-react';
import { EXAMPLES } from './examples';
import { buildShareableUrl, readCodeFromUrlParam } from './shareLink';

// ─── Exception Detection Helper ─────────────────────────────────────────────

function detectException(errorMsg) {
  if (!errorMsg) return null;

  if (/\berror:/i.test(errorMsg) || /\.java:\d+:/i.test(errorMsg)) {
    return null;
  }

  const excMatch = errorMsg.match(/^((?:[a-z]+\.)+[A-Z][A-Za-z]*(?:Exception|Error)[A-Za-z]*):?\s*(.*)/);
  if (excMatch) {
    const type = excMatch[1].split('.').pop();
    const rest = excMatch[2] || '';
    const lineMatch = rest.match(/\(at line (\d+)\)$/);
    const line = lineMatch ? parseInt(lineMatch[1], 10) : null;
    const message = rest.replace(/\s*\(at line \d+\)\s*$/, '').trim();
    return { type, message, line };
  }

  return null;
}

// ─── Type Inference Helper ──────────────────────────────────────────────────

function preprocessTrace(trace) {
  if (!trace) return [];
  return trace.map((step) => {
    if (!step.heap) return step;
    const newHeap = {};
    for (const [ref, obj] of Object.entries(step.heap)) {
      let visualType = obj.visualType;
      const type = obj.type || '';
      const fields = Object.keys(obj.fields || {});

      // Priority override for doubly linked list (prev & next fields)
      if ((fields.includes('prev') || fields.includes('previous')) && fields.includes('next')) {
        visualType = 'doubly_linked_list';
      } else if (!visualType || visualType === 'object') {
        if (type.endsWith('[]')) {
          visualType = 'array';
        } else if (fields.includes('left') && fields.includes('right')) {
          visualType = 'tree_node';
        } else if (fields.includes('next') && (fields.includes('val') || fields.includes('value') || fields.includes('data') || fields.includes('key'))) {
          visualType = 'linked_list';
        } else if (type.includes('ArrayList') || type.includes('Vector')) {
          visualType = 'list';
        } else if (type.includes('HashSet') || type.includes('TreeSet')) {
          visualType = 'set';
        } else if (type.includes('HashMap') || type.includes('TreeMap')) {
          visualType = 'map';
        } else if (type.includes('Stack')) {
          visualType = 'stack';
        } else if (type.includes('Deque') || type.includes('Queue')) {
          visualType = 'queue';
        } else if (type.includes('StringBuilder') || type.includes('StringBuffer')) {
          visualType = 'string_builder';
        }
      }
      newHeap[ref] = { ...obj, visualType: visualType || 'object' };
    }
    return { ...step, heap: newHeap };
  });
}

// ─── Main App Component ──────────────────────────────────────────────────────

function MainApp() {
  const defaultCode = readCodeFromUrlParam() || EXAMPLES[0].code;

  const [code, setCode] = useState(defaultCode);
  const [trace, setTrace] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exception, setException] = useState(null);
  const [shareStatus, setShareStatus] = useState('idle');
  const [exampleOpen, setExampleOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const exampleRef = useRef(null);

  // Theme State (Dark / Light Mode with LocalStorage Persistence)
  const [theme, setTheme] = useState(() => localStorage.getItem('codbee_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('codbee_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Left Panel Resizing & Collapsing State
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const [editorWidth, setEditorWidth] = useState(380); // in px
  const [isResizingEditor, setIsResizingEditor] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(380);

  // Close dropdown on click outside
  useEffect(() => {
    function onClickOutside(e) {
      if (exampleRef.current && !exampleRef.current.contains(e.target)) {
        setExampleOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Drag resizer for Editor panel
  const handleSplitterMouseDown = (e) => {
    if (isEditorCollapsed) return;
    setIsResizingEditor(true);
    startXRef.current = e.clientX;
    startWidthRef.current = editorWidth;
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingEditor) return;
      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.min(750, Math.max(220, startWidthRef.current + deltaX));
      setEditorWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingEditor(false);
    };

    if (isResizingEditor) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizingEditor]);

  // ── Visualize Execution ────────────────────────────────────────────────────

  const handleVisualize = async () => {
    setLoading(true);
    setError(null);
    setException(null);
    setTrace([]);
    setCurrentStep(0);

    try {
      const match = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
      const className = match ? match[1] : 'Main';

      const response = await fetch('/api/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'java', code, className }),
      });

      const data = await response.json().catch(() => ({}));

      const processedTrace = preprocessTrace(data.trace || []);

      if (!response.ok) {
        setError(data.error || `HTTP ${response.status}`);
        setTrace(processedTrace);
        return;
      }

      if (data.error) {
        const exc = detectException(data.error);
        if (exc) {
          setException(exc);
        } else {
          setError(data.error);
        }
        setTrace(processedTrace);
      } else {
        setTrace(processedTrace);
      }
      setCurrentStep(0);
    } catch (err) {
      setError(err.message || 'Failed to communicate with the backend.');
    } finally {
      setLoading(false);
    }
  };

  // ── Share Link ─────────────────────────────────────────────────────────────

  const handleShare = () => {
    const url = buildShareableUrl(code);
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2500);
    });
  };

  // ── Load Example ───────────────────────────────────────────────────────────

  const handleLoadExample = (example) => {
    setCode(example.code);
    setTrace([]);
    setCurrentStep(0);
    setError(null);
    setException(null);
    setExampleOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    window.history.replaceState({}, '', url.toString());
  };

  // ── Derived state ──────────────────────────────────────────────────────────

  const currentStepData = trace[currentStep] || null;
  const currentLine = currentStepData?.line || 0;
  const prevStepData = currentStep > 0 ? trace[currentStep - 1] : null;
  const prevLine = prevStepData?.line || 0;

  // ── Render Layout ──────────────────────────────────────────────────────────

  return (
    <div className="app-root">
      {/* ── Single-Row Top Bar ── */}
      <header className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Code2 size={20} color="#3b82f6" />
          <span className="navbar-title">
            CODBEE <span className="navbar-badge">Java Tutor</span>
          </span>

          {/* Toggle Code Editor Panel Button */}
          <button
            className="btn btn-ghost"
            onClick={() => setIsEditorCollapsed((prev) => !prev)}
            title={isEditorCollapsed ? 'Show Code Editor' : 'Hide Code Editor'}
            style={{ padding: '6px 10px', marginLeft: '6px' }}
          >
            {isEditorCollapsed ? <PanelLeftOpen size={16} color="#60a5fa" /> : <PanelLeftClose size={16} />}
            <span style={{ fontSize: '12px', display: 'inline-block' }}>
              {isEditorCollapsed ? 'Code' : 'Hide Code'}
            </span>
          </button>
        </div>

        {/* Center/Right Action Group & Stepping Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Stepping Controls */}
          <SteppingControls
            currentStep={currentStep}
            totalSteps={trace.length}
            onStepChange={setCurrentStep}
            disabled={loading || trace.length === 0}
          />

          <div style={{ width: '1px', height: '20px', background: '#1e293b', margin: '0 2px' }} />

          {/* Load Example Dropdown */}
          <div ref={exampleRef} style={{ position: 'relative' }}>
            <button
              className="btn btn-ghost"
              onClick={() => setExampleOpen((o) => !o)}
              title="Load an example program"
            >
              Examples <ChevronDown size={13} />
            </button>
            {exampleOpen && (
              <div className="dropdown-menu">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.id}
                    className="dropdown-item"
                    onClick={() => handleLoadExample(ex)}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Share button */}
          <button
            className={`btn btn-ghost ${shareStatus === 'copied' ? 'btn-copied' : ''}`}
            onClick={handleShare}
            title="Copy shareable link"
          >
            {shareStatus === 'copied' ? (
              <><CheckCheck size={14} /> Copied!</>
            ) : (
              <><Share2 size={14} /> Share</>
            )}
          </button>

          {/* Theme Mode Toggle Button */}
          <button
            className="btn btn-ghost"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            style={{ padding: '6px 10px' }}
          >
            {theme === 'dark' ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#2563eb" />}
          </button>

          {/* Settings Gear Button */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-ghost"
              onClick={() => setIsSettingsOpen((s) => !s)}
              title="Visualization Settings"
              style={{ padding: '6px 10px' }}
            >
              <Settings size={15} />
            </button>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
          </div>

          {/* Visualize Execution button */}
          <button
            className="btn btn-primary"
            onClick={handleVisualize}
            disabled={loading}
            title="Compile and visualize execution"
          >
            {loading
              ? <><Loader2 size={14} className="spin-icon" /> Tracing...</>
              : <><Play size={14} fill="white" /> Visualize</>}
          </button>
        </div>
      </header>

      {/* ── Error Banner (Compile/Network) ── */}
      {error && (
        <div className="banner banner-error">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Exception Banner (Runtime) ── */}
      {exception && (
        <div className="banner banner-exception">
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>
            <strong>
              {exception.line ? `Exception at line ${exception.line}: ` : 'Exception: '}
              {exception.type}
            </strong>
            {exception.message ? ` — ${exception.message}` : ''}
            {trace.length > 0 && (
              <span style={{ marginLeft: 8, opacity: 0.75, fontSize: '12px' }}>
                ({trace.length} step{trace.length !== 1 ? 's' : ''} captured)
              </span>
            )}
          </span>
        </div>
      )}

      {/* ── Main Layout Workspace ── */}
      <main className="workspace-container">
        {/* Left: Collapsible & Drag-Resizable Monaco Code Editor */}
        {!isEditorCollapsed && (
          <>
            <section
              style={{
                width: `${editorWidth}px`,
                height: '100%',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-card)',
                overflow: 'hidden',
              }}
            >
              <CodeEditor code={code} onChange={setCode} currentLine={currentLine} prevLine={prevLine} theme={theme} />
            </section>

            {/* Splitter Resize Bar */}
            <div
              onMouseDown={handleSplitterMouseDown}
              title="Drag to resize editor panel"
              style={{
                width: '6px',
                height: '100%',
                background: isResizingEditor ? '#3b82f6' : '#1e293b',
                cursor: 'col-resize',
                flexShrink: 0,
                transition: 'background 0.15s',
                zIndex: 10,
              }}
            />
          </>
        )}

        {/* Center/Right: Visualization Canvas Area */}
        <section style={{ flex: 1, height: '100%', minWidth: 0, overflow: 'hidden' }}>
          <VisualizationCanvas stepData={currentStepData} />
        </section>
      </main>

      {/* ── Bottom Drawer: Standard Output (stdout) ── */}
      <StdoutDrawer stdout={currentStepData?.stdout || ''} />
    </div>
  );
}

export default function App() {
  return (
    <AnimationSettingsProvider>
      <MainApp />
    </AnimationSettingsProvider>
  );
}
