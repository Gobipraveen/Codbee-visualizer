import React, { useRef } from 'react';
import { Layers, Database, Link as LinkIcon } from 'lucide-react';
import HeapGraphSvgOverlay from './HeapGraphSvgOverlay';

// ─── Type classification helpers ───────────────────────────────────────────

function isArrayType(type) {
  return type && type.endsWith('[]');
}

function isArrayList(type) {
  return type && (type === 'java.util.ArrayList' || type.includes('ArrayList'));
}

function isHashMap(type) {
  return type && (type === 'java.util.HashMap' || type.includes('HashMap') || type.includes('LinkedHashMap'));
}

function isString(type) {
  return type === 'java.lang.String';
}

// ─── Main Panel ─────────────────────────────────────────────────────────────

export default function StackHeapPanel({ stepData }) {
  const containerRef = useRef(null);
  const stack = stepData?.stack || [];
  const heapMap = stepData?.heap || {};

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '45% 55%',
        gap: '12px',
        height: '100%',
        width: '100%',
        overflowY: 'auto',
      }}
    >
      {/* SVG Arrow Overlay */}
      <HeapGraphSvgOverlay containerRef={containerRef} stepData={stepData} />

      {/* ── Stack Panel ── */}
      <div style={panelCardStyle}>
        <div style={panelHeaderStyle}>
          <Layers size={15} color="#3b82f6" />
          <span>Call Stack</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {stack.length === 0 ? (
            <div style={emptyTextStyle}>No active call frames</div>
          ) : (
            stack.map((frame, idx) => (
              <div key={idx} style={idx === 0 ? activeFrameCardStyle : frameCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: idx === 0 ? '#93c5fd' : '#60a5fa', fontSize: '12px' }}>
                    {cleanClassName(frame.className)}.{frame.methodName}()
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', background: '#0f172a', padding: '2px 6px', borderRadius: '4px' }}>
                    line {frame.line}
                  </span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <tbody>
                    {Object.entries(frame.variables || {}).map(([varName, valDto]) => (
                      <tr key={varName} style={{ borderBottom: '1px dotted #1e293b' }}>
                        <td style={{ padding: '4px 0', color: '#cbd5e1', fontFamily: 'monospace', fontWeight: 500 }}>
                          {varName}
                        </td>
                        <td style={{ padding: '4px 0', textAlign: 'right' }}>
                          <RenderValue valDto={valDto} sourceId={`stack-${idx}-${varName}`} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Heap Panel ── */}
      <div style={panelCardStyle}>
        <div style={panelHeaderStyle}>
          <Database size={15} color="#10b981" />
          <span>Heap Objects</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '10px', alignContent: 'start' }}>
          {Object.keys(heapMap).length === 0 ? (
            <div style={{ ...emptyTextStyle, gridColumn: '1 / -1' }}>No heap objects allocated</div>
          ) : (
            Object.entries(heapMap).map(([heapId, objDto]) => (
              <HeapCard key={heapId} heapId={heapId} objDto={objDto} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── HeapCard: smart rendering based on type ────────────────────────────────

function HeapCard({ heapId, objDto }) {
  const { type, fields } = objDto;

  // Arrays: render as index-row boxes
  if (isArrayType(type)) {
    return <ArrayCard heapId={heapId} type={type} fields={fields} />;
  }

  // ArrayList: show size + elements readable
  if (isArrayList(type)) {
    return <CollectionCard heapId={heapId} type="ArrayList" fields={fields} />;
  }

  // HashMap / LinkedHashMap
  if (isHashMap(type)) {
    return <CollectionCard heapId={heapId} type="HashMap" fields={fields} />;
  }

  // Default: generic object card
  return (
    <div data-heap-card-id={heapId} style={heapCardStyle}>
      <HeapCardHeader heapId={heapId} label={cleanClassName(type)} />
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <tbody>
          {Object.entries(fields || {}).map(([fieldName, valDto]) => (
            <tr key={fieldName} style={{ borderBottom: '1px dotted #1e293b' }}>
              <td style={{ padding: '3px 0', color: '#94a3b8', fontFamily: 'monospace' }}>{fieldName}</td>
              <td style={{ padding: '3px 0', textAlign: 'right' }}>
                <RenderValue valDto={valDto} sourceId={`heap-${heapId}-${fieldName}`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ArrayCard({ heapId, type, fields }) {
  const elementType = type.replace('[]', '');
  const entries = Object.entries(fields || {}).sort((a, b) => {
    const ai = parseInt(a[0].replace(/[\[\]]/g, ''), 10);
    const bi = parseInt(b[0].replace(/[\[\]]/g, ''), 10);
    return ai - bi;
  });

  return (
    <div data-heap-card-id={heapId} style={{ ...heapCardStyle, gridColumn: entries.length > 6 ? '1 / -1' : undefined }}>
      <HeapCardHeader heapId={heapId} label={`${cleanClassName(elementType)}[]`} />
      {entries.length === 0 ? (
        <span style={{ color: '#64748b', fontSize: '11px', fontStyle: 'italic' }}>empty array</span>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
          {entries.map(([idx, valDto]) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '32px',
              }}
            >
              <div
                style={{
                  border: '1px solid #334155',
                  background: '#1e293b',
                  borderRadius: '4px',
                  padding: '3px 6px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              >
                <RenderValue valDto={valDto} sourceId={`heap-${heapId}-${idx}`} />
              </div>
              <span style={{ fontSize: '10px', color: '#64748b', marginTop: '1px' }}>{idx}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CollectionCard({ heapId, type, fields }) {
  // Try to extract meaningful content from internal fields
  // ArrayList has elementData (array ref) and size
  const sizeField = fields['size'];
  const size = sizeField ? sizeField.value : null;

  // For non-String[] refs we just list non-internal fields
  const displayFields = Object.entries(fields || {}).filter(
    ([k]) => !['serialVersionUID', 'DEFAULT_CAPACITY', 'EMPTY_ELEMENTDATA', 'DEFAULTCAPACITY_EMPTY_ELEMENTDATA', 'MAX_ARRAY_SIZE', 'modCount', 'threshold', 'loadFactor', 'table', 'entrySet', 'keySet', 'values'].includes(k)
  );

  return (
    <div data-heap-card-id={heapId} style={heapCardStyle}>
      <HeapCardHeader
        heapId={heapId}
        label={type}
        badge={size != null ? `size=${size}` : null}
      />
      {displayFields.length === 0 ? (
        <span style={{ color: '#64748b', fontSize: '11px', fontStyle: 'italic' }}>
          {type} (internal fields hidden)
        </span>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <tbody>
            {displayFields.map(([fieldName, valDto]) => (
              <tr key={fieldName} style={{ borderBottom: '1px dotted #1e293b' }}>
                <td style={{ padding: '3px 0', color: '#94a3b8', fontFamily: 'monospace' }}>{fieldName}</td>
                <td style={{ padding: '3px 0', textAlign: 'right' }}>
                  <RenderValue valDto={valDto} sourceId={`heap-${heapId}-${fieldName}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function HeapCardHeader({ heapId, label, badge }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', borderBottom: '1px solid #334155', paddingBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
      <span style={{ fontWeight: 700, color: '#34d399', fontSize: '12px', fontFamily: 'monospace' }}>
        {label}
        {badge && <span style={{ marginLeft: '6px', fontSize: '10px', color: '#94a3b8' }}>{badge}</span>}
      </span>
      <span style={{ fontSize: '10px', color: '#a78bfa', background: 'rgba(167,139,250,0.15)', padding: '1px 5px', borderRadius: '4px' }}>
        {heapId}
      </span>
    </div>
  );
}

// ─── RenderValue ─────────────────────────────────────────────────────────────

export function RenderValue({ valDto, sourceId }) {
  if (!valDto) return <span style={{ color: '#64748b' }}>null</span>;

  if (valDto.type === 'reference') {
    const targetRef = String(valDto.value);
    return (
      <span
        data-ref-target={targetRef}
        data-source-id={sourceId}
        style={{
          color: '#c084fc',
          background: 'rgba(192,132,252,0.15)',
          border: '1px solid rgba(192,132,252,0.4)',
          borderRadius: '12px',
          padding: '2px 8px',
          fontSize: '11px',
          fontFamily: 'monospace',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          cursor: 'default',
          whiteSpace: 'nowrap',
        }}
      >
        <LinkIcon size={10} />
        {targetRef}
      </span>
    );
  }

  if (valDto.type === 'string') {
    return (
      <span style={{ color: '#fde047', fontFamily: 'monospace', fontSize: '12px' }}>
        &ldquo;{String(valDto.value).length > 24 ? valDto.value.substring(0, 24) + '…' : valDto.value}&rdquo;
      </span>
    );
  }

  if (valDto.type === 'null') {
    return <span style={{ color: '#64748b', fontFamily: 'monospace' }}>null</span>;
  }

  if (valDto.type === 'primitive') {
    const v = valDto.value;
    // Boolean coloring
    if (v === true || v === false) {
      return <span style={{ color: v ? '#4ade80' : '#f87171', fontFamily: 'monospace' }}>{String(v)}</span>;
    }
    return <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{String(v)}</span>;
  }

  return <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{String(valDto.value)}</span>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cleanClassName(fullName) {
  if (!fullName) return '';
  // strip package
  const parts = fullName.split('.');
  const lastPart = parts[parts.length - 1];
  // handle inner class suffix (e.g. LinkedListDemo$Node → Node)
  return lastPart.includes('$') ? lastPart.split('$').pop() : lastPart;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const panelCardStyle = {
  background: '#121826',
  borderRadius: '8px',
  border: '1px solid #1e293b',
  padding: '12px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
};

const panelHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontWeight: 600,
  fontSize: '11px',
  color: '#f8fafc',
  marginBottom: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  flexShrink: 0,
};

const frameCardStyle = {
  background: '#1e293b',
  borderRadius: '6px',
  padding: '8px 10px',
  border: '1px solid #334155',
};

const activeFrameCardStyle = {
  ...frameCardStyle,
  border: '1px solid #3b82f6',
  boxShadow: '0 0 0 1px rgba(59,130,246,0.2)',
};

const heapCardStyle = {
  background: '#0f172a',
  borderRadius: '6px',
  padding: '8px 10px',
  border: '1px solid #334155',
};

const emptyTextStyle = {
  fontSize: '12px',
  color: '#64748b',
  fontStyle: 'italic',
  textAlign: 'center',
  padding: '12px 0',
};
