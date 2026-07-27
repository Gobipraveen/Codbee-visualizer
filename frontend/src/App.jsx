import React, { useState, useEffect, useRef } from 'react';
import CodeEditor from './components/CodeEditor';
import SteppingControls from './components/SteppingControls';
import StackHeapPanel from './components/StackHeapPanel';
import StdoutConsole from './components/StdoutConsole';
import { Play, AlertCircle, Loader2, Code2, Share2, CheckCheck, ChevronDown } from 'lucide-react';
import { EXAMPLES } from './examples';
import { buildShareableUrl, readCodeFromUrlParam } from './shareLink';

/**
 * Parse the error field from the backend.
 * Runtime exceptions look like: "java.lang.SomeException: message (at line X)"
 * Compilation errors look like: "error: ..." or contain "javac" / ".java:"
 * Returns { type, message } for runtime exceptions, null for compiler errors (let them show as red banners).
 */
function detectException(errorMsg) {
  if (!errorMsg) return null;

  // Compilation errors: contain "error:" at start of a line, or ".java:" file references
  if (/\berror:/i.test(errorMsg) || /\.java:\d+:/i.test(errorMsg)) {
    return null; // show as red error banner
  }

  // Runtime exceptions: Java exception class names contain dots and "Exception" or "Error"
  const excMatch = errorMsg.match(/^((?:[a-z]+\.)+[A-Z][A-Za-z]*(?:Exception|Error)[A-Za-z]*):?\s*(.*)/);
  if (excMatch) {
    const type = excMatch[1].split('.').pop(); // short class name
    const rest = excMatch[2] || '';
    // Extract "at line X" if present
    const lineMatch = rest.match(/\(at line (\d+)\)$/);
    const line = lineMatch ? parseInt(lineMatch[1], 10) : null;
    const message = rest.replace(/\s*\(at line \d+\)\s*$/, '').trim();
    return { type, message, line };
  }

  return null;
}


// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  // Load code from URL param on first mount, else default to linked-list example
  const defaultCode = readCodeFromUrlParam() || EXAMPLES[0].code;

  const [code, setCode] = useState(defaultCode);
  const [trace, setTrace] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exception, setException] = useState(null); // { type, message, line }
  const [shareStatus, setShareStatus] = useState('idle'); // 'idle' | 'copied'
  const [exampleOpen, setExampleOpen] = useState(false);
  const exampleRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e) {
      if (exampleRef.current && !exampleRef.current.contains(e.target)) {
        setExampleOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // ── Visualize ───────────────────────────────────────────────────────────────

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

      if (!response.ok) {
        setError(data.error || `HTTP ${response.status}`);
        setTrace(data.trace || []);
        return;
      }

      if (data.error) {
        // Could be a compilation error OR a runtime exception that stopped the trace
        const exc = detectException(data.error);
        if (exc) {
          setException(exc);
        } else {
          setError(data.error);
        }
        setTrace(data.trace || []);
      } else {
        setTrace(data.trace || []);
      }
      setCurrentStep(0);
    } catch (err) {
      setError(err.message || 'Failed to communicate with the backend.');
    } finally {
      setLoading(false);
    }
  };

  // ── Share Link ───────────────────────────────────────────────────────────────

  const handleShare = () => {
    const url = buildShareableUrl(code);
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2500);
    });
  };

  // ── Load Example ─────────────────────────────────────────────────────────────

  const handleLoadExample = (example) => {
    setCode(example.code);
    setTrace([]);
    setCurrentStep(0);
    setError(null);
    setException(null);
    setExampleOpen(false);
    // clear URL param
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    window.history.replaceState({}, '', url.toString());
  };

  // ── Derived state ────────────────────────────────────────────────────────────

  const currentStepData = trace[currentStep] || null;
  const currentLine = currentStepData?.line || 0;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="app-root">
      {/* ── Navbar ── */}
      <header className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Code2 size={22} color="#3b82f6" />
          <span className="navbar-title">
            CODBEE <span className="navbar-badge">Java Tutor</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Load Example dropdown */}
          <div ref={exampleRef} style={{ position: 'relative' }}>
            <button
              className="btn btn-ghost"
              onClick={() => setExampleOpen((o) => !o)}
              title="Load an example program"
            >
              Examples <ChevronDown size={14} />
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

          {/* Visualize button */}
          <button
            className="btn btn-primary"
            onClick={handleVisualize}
            disabled={loading}
            title="Compile and visualize"
          >
            {loading
              ? <><Loader2 size={15} className="spin-icon" /> Tracing...</>
              : <><Play size={14} fill="white" /> Visualize</>}
          </button>
        </div>
      </header>

      {/* ── Error banner (compilation / network errors) ── */}
      {error && (
        <div className="banner banner-error">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Exception banner (runtime exceptions) ── */}
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

      {/* ── Main content ── */}
      <main className="main-grid">
        {/* Left: Code Editor + Controls */}
        <section className="col-editor">
          <div style={{ flex: 1, minHeight: 0 }}>
            <CodeEditor code={code} onChange={setCode} currentLine={currentLine} />
          </div>
          <SteppingControls
            currentStep={currentStep}
            totalSteps={trace.length}
            onStepChange={setCurrentStep}
            disabled={loading || trace.length === 0}
          />
        </section>

        {/* Center: Stack + Heap */}
        <section className="col-stack-heap">
          <StackHeapPanel stepData={currentStepData} />
        </section>

        {/* Right: Stdout */}
        <section className="col-stdout">
          <StdoutConsole stdout={currentStepData?.stdout || ''} />
        </section>
      </main>
    </div>
  );
}
