"use client";

import React, { useState, useEffect } from 'react';

// A simple mock for a rich text editor component
// In a real application, you would use a library like 'react-quill', 'slate.js', or 'tiptap'.

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

// Define the props for the custom toolbar button
type ToolbarButtonProps = {
  format: string;
  icon?: string;
  label?: string;
  onClick: (format: string) => void;
};

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ format, icon, label, onClick }) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault();
      onClick(format);
    }}
    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
    title={label || format}
  >
    {icon ? <span className="text-sm">{icon}</span> : label}
  </button>
);


const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const [editorState, setEditorState] = useState(value);
  const editorRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync external changes
    setEditorState(value);
  }, [value]);
  
  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
  };

  const handleCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    if(editorRef.current) {
        onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="rounded-md border border-input">
        <div className="p-2 border-b flex flex-wrap items-center gap-2 text-sm">
            <button type="button" onMouseDown={e => {e.preventDefault(); handleCommand('undo')}} title="Undo" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">↩️</button>
            <button type="button" onMouseDown={e => {e.preventDefault(); handleCommand('redo')}} title="Redo" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">↪️</button>
            <select onChange={e => handleCommand('formatBlock', e.target.value)} defaultValue="p" className="p-2 bg-transparent">
                <option value="p">Normal</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
            </select>
            <button type="button" onMouseDown={e => {e.preventDefault(); handleCommand('bold')}} title="Bold" className="font-bold p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">B</button>
            <button type="button" onMouseDown={e => {e.preventDefault(); handleCommand('italic')}} title="Italic" className="italic p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">I</button>
            <button type="button" onMouseDown={e => {e.preventDefault(); handleCommand('underline')}} title="Underline" className="underline p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">U</button>
            <button type="button" onMouseDown={e => {e.preventDefault(); handleCommand('strikeThrough')}} title="Strikethrough" className="line-through p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">S</button>
            <button type="button" onMouseDown={e => {e.preventDefault(); const url = prompt('Enter URL:'); if(url) handleCommand('createLink', url)}} title="Link" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">🔗</button>
            <button type="button" onMouseDown={e => {e.preventDefault(); handleCommand('unlink')}} title="Unlink" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">💔</button>
            <button type="button" onMouseDown={e => {e.preventDefault(); handleCommand('justifyLeft')}} title="Align Left" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">📄</button>
            <button type="button" onMouseDown={e => {e.preventDefault(); handleCommand('justifyCenter')}} title="Align Center" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">📄</button>
            <button type="button" onMouseDown={e => {e.preventDefault(); handleCommand('justifyRight')}} title="Align Right" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">📄</button>
            <button type="button" onMouseDown={e => {e.preventDefault(); handleCommand('insertOrderedList')}} title="Ordered List" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">1.</button>
            <button type="button" onMouseDown={e => {e.preventDefault(); handleCommand('insertUnorderedList')}} title="Unordered List" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">•</button>
            <button type="button" onMouseDown={e => {e.preventDefault(); handleCommand('insertHorizontalRule')}} title="Horizontal Rule" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">―</button>
        </div>
        <div
            ref={editorRef}
            contentEditable={true}
            onInput={handleContentChange}
            dangerouslySetInnerHTML={{ __html: editorState }}
            className="min-h-[250px] w-full rounded-b-md bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm p-4"
        />
    </div>
  );
};

export default RichTextEditor;
