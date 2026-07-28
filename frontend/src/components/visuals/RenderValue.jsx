import React from 'react';
import { Link as LinkIcon } from 'lucide-react';

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
    if (v === true || v === false) {
      return <span style={{ color: v ? '#4ade80' : '#f87171', fontFamily: 'monospace' }}>{String(v)}</span>;
    }
    return <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{String(v)}</span>;
  }

  return <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{String(valDto.value)}</span>;
}

export function cleanClassName(fullName) {
  if (!fullName) return '';
  const parts = fullName.split('.');
  const lastPart = parts[parts.length - 1];
  return lastPart.includes('$') ? lastPart.split('$').pop() : lastPart;
}
