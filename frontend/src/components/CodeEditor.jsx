import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

export const SAMPLE_LINKED_LIST_CODE = `public class LinkedListDemo {
    static class Node {
        int val;
        Node next;

        Node(int val, Node next) {
            this.val = val;
            this.next = next;
        }
    }

    public static void main(String[] args) {
        Node n3 = new Node(30, null);
        Node n2 = new Node(20, n3);
        Node head = new Node(10, n2);

        Node curr = head;
        while (curr != null) {
            System.out.println("Node val: " + curr.val);
            curr = curr.next;
        }
    }
}`;

export default function CodeEditor({ code, onChange, currentLine }) {
  const editorRef = useRef(null);
  const decorationsRef = useRef([]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (editorRef.current && currentLine && currentLine > 0) {
      const editor = editorRef.current;
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
        {
          range: {
            startLineNumber: currentLine,
            startColumn: 1,
            endLineNumber: currentLine,
            endColumn: 1,
          },
          options: {
            isWholeLine: true,
            className: 'active-line-highlight',
            glyphMarginClassName: 'active-line-glyph',
          },
        },
      ]);

      editor.revealLineInCenterIfOutsideViewport(currentLine);
    } else if (editorRef.current && (!currentLine || currentLine <= 0)) {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  }, [currentLine]);

  return (
    <div style={{
      height: '100%',
      width: '100%',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.09)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
      background: 'rgba(32, 34, 44, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      <Editor
        height="100%"
        defaultLanguage="java"
        theme="vs-dark"
        value={code}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 13.5,
          fontFamily: "var(--font-mono)",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          glyphMargin: true,
          lineNumbersMinChars: 3,
        }}
      />
    </div>
  );
}
