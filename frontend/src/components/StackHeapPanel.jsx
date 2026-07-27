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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={14} color="#0a84ff" />
            <span>Call Stack</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {stack.length === 0 ? (
            <div style={emptyTextStyle}>No active call frames</div>
          ) : (
            stack.map((frame, idx) => (
              <div key={idx} style={idx === 0 ? activeFrameCardStyle : frameCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: idx === 0 ? '#64b5f6' : '#90caf9', fontSize: '12px', fontFamily: 'var(--font-mac)' }}>
                    {cleanClassName(frame.className)}.{frame.methodName}()
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    line {frame.line}
                  </span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <tbody>
                    {Object.entries(frame.variables || {}).map(([varName, valDto]) => (
                      <tr key={varName} style={{ borderBottom: '1px dotted rgba(255, 255, 255, 0.06)' }}>
                        <td style={{ padding: '4px 0', color: '#cbd5e1', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={14} color="#30d158" />
            <span>Heap Objects</span>
          </div>
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

  if (isArrayType(type)) {
    return <ArrayCard heapId={heapId} type={type} fields={fields} />;
  }

  if (isArrayList(type)) {
    return <CollectionCard heapId={heapId} type="ArrayList" fields={fields} />;
  }

  if (isHashMap(type)) {
    return <CollectionCard heapId={heapId} type="HashMap" fields={fields} />;
  }

  return (
    <div data-heap-card-id={heapId} style={heapCardStyle}>
      <HeapCardHeader heapId={heapId} label={cleanClassName(type)} />
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <tbody>
          {Object.entries(fields || {}).map(([fieldName, valDto]) => (
            <tr key={fieldName} style={{ borderBottom: '1px dotted rgba(255, 255, 255, 0.06)' }}>
              <td style={{ padding: '3px 0', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{fieldName}</td>
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
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '5px',
                  padding: '3px 6px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <RenderValue valDto={valDto} sourceId={`heap-${heapId}-${idx}`} />
              </div>
              <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{idx}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CollectionCard({ heapId, type, fields }) {
  const sizeField = fields['size'];
  const size = sizeField ? sizeField.value : null;

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
              <tr key={fieldName} style={{ borderBottom: '1px dotted rgba(255, 255, 255, 0.06)' }}>
                <td style={{ padding: '3px 0', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{fieldName}</td>
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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
      <span style={{ fontWeight: 600, color: '#30d158', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
        {label}
        {badge && <span style={{ marginLeft: '6px', fontSize: '10px', color: '#94a3b8' }}>{badge}</span>}
      </span>
      <span style={{ fontSize: '10px', color: '#bf5af2', background: 'rgba(191, 90, 242, 0.15)', border: '1px solid rgba(191, 90, 242, 0.3)', padding: '1px 6px', borderRadius: '10px' }}>
        {heapId}
      </span>
    </div>
  );
}

// ─── RenderValue ─────────────────────────────────────────────────────────────

export function RenderValue({ valDto, sourceId }) {
  if (!valDto) return <span style={{ color: '#64748b', fontFamily: 'var(--font-mono)' }}>null</span>;

  if (valDto.type === 'reference') {
    const targetRef = String(valDto.value);
    return (
      <span
        data-ref-target={targetRef}
        data-source-id={sourceId}
        style={{
          color: '#bf5af2',
          background: 'rgba(191, 90, 242, 0.15)',
          border: '1px solid rgba(191, 90, 242, 0.3)',
          borderRadius: '12px',
          padding: '2px 8px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
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
      <span style={{ color: '#ffd60a', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
        &ldquo;{String(valDto.value).length > 24 ? valDto.value.substring(0, 24) + '…' : valDto.value}&rdquo;
      </span>
    );
  }

  if (valDto.type === 'null') {
    return <span style={{ color: '#64748b', fontFamily: 'var(--font-mono)' }}>null</span>;
  }

  if (valDto.type === 'primitive') {
    const v = valDto.value;
    if (v === true || v === false) {
      return <span style={{ color: v ? '#30d158' : '#ff453a', fontFamily: 'var(--font-mono)' }}>{String(v)}</span>;
    }
    return <span style={{ color: '#64d2ff', fontFamily: 'var(--font-mono)' }}>{String(v)}</span>;
  }

  return <span style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{String(valDto.value)}</span>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cleanClassName(fullName) {
  if (!fullName) return '';
  const parts = fullName.split('.');
  const lastPart = parts[parts.length - 1];
  return lastPart.includes('$') ? lastPart.split('$').pop() : lastPart;
}

// ─── macOS Card Styles ────────────────────────────────────────────────────────

const panelCardStyle = {
  background: 'rgba(32, 34, 44, 0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.09)',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
  padding: '14px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
};

const panelHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justify-content: 'space-between',
  fontWeight: 600,
  fontSize: '11px',
  color: '#e2e8f0',
  marginBottom: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
  flexShrink: 0,
  fontFamily: 'var(--font-mac)',
};

const frameCardStyle = {
  background: 'rgba(255, 255, 255, 0.04)',
  borderRadius: '8px',
  padding: '10px 12px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
};

const activeFrameCardStyle = {
  ...frameCardStyle,
  background: 'rgba(10, 132, 255, 0.08)',
  border: '1px solid rgba(10, 132, 255, 0.4)',
  boxShadow: '0 4px 12px rgba(10, 132, 255, 0.2)',
};

const heapCardStyle = {
  background: 'rgba(20, 21, 28, 0.8)',
  borderRadius: '8px',
  padding: '10px 12px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
};

const emptyTextStyle = {
  fontSize: '12px',
  color: '#64748b',
  fontStyle: 'italic',
  textAlign: 'center',
  padding: '16px 0',
  fontFamily: 'var(--font-mac)',
};
