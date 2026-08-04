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

export default function CodeEditor({ code, onChange, currentLine, prevLine, theme }) {
  const editorRef = useRef(null);
  const decorationsRef = useRef([]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const newDecorations = [];

      // 1. Previous Executed Line Marker (shown when currentStep > 0 and prevLine is valid)
      if (prevLine && prevLine > 0 && prevLine !== currentLine) {
        newDecorations.push({
          range: {
            startLineNumber: prevLine,
            startColumn: 1,
            endLineNumber: prevLine,
            endColumn: 1,
          },
          options: {
            isWholeLine: true,
            className: 'monaco-line-highlight-prev',
            glyphMarginClassName: 'monaco-glyph-prev-line',
          },
        });
      }

      // 2. Current Execution Line Marker
      if (currentLine && currentLine > 0) {
        newDecorations.push({
          range: {
            startLineNumber: currentLine,
            startColumn: 1,
            endLineNumber: currentLine,
            endColumn: 1,
          },
          options: {
            isWholeLine: true,
            className: 'monaco-line-highlight-current',
            glyphMarginClassName: 'monaco-glyph-current-line',
          },
        });

        editor.revealLineInCenterIfOutsideViewport(currentLine);
      }

      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
    }
  }, [currentLine, prevLine]);

  return (
    <div style={{ height: '100%', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <Editor
        height="100%"
        defaultLanguage="java"
        theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        value={code}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          fontFamily: "'Fira Code', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          glyphMargin: true,
          wordWrap: 'on',
          lineNumbersMinChars: 3,
        }}
      />
    </div>
  );
}
