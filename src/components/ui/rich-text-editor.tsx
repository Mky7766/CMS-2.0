"use client";

import React, { useState, useEffect, useRef } from 'react';

// A simple mock for a rich text editor component
// In a real application, you would use a library like 'react-quill', 'slate.js', or 'tiptap'.

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Use state to manage the content internally, but sync with the parent's value prop.
  const [internalContent, setInternalContent] = useState(value);

  useEffect(() => {
    // When the external value changes, update the internal state and the editor's display.
    if (value !== internalContent && editorRef.current) {
      setInternalContent(value);
      editorRef.current.innerHTML = value;
    }
  }, [value]);


  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    // When the user types, update both the internal state and call the parent's onChange.
    const newContent = e.currentTarget.innerHTML;
    setInternalContent(newContent);
    onChange(newContent);
  };

  const handleCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    // After executing a command, we need to manually trigger the update.
    if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        setInternalContent(newContent);
        onChange(newContent);
    }
    editorRef.current?.focus(); // Return focus to the editor
  };
  
  const handleCodeBlock = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    const codeBlock = `\n\`\`\`html\n${selectedText}\n\`\`\`\n`;
    
    // This is a simplified way to insert the block. 
    // A more robust editor would handle this differently.
    document.execCommand('insertHTML', false, `<pre><code>${selectedText}</code></pre>`);

    if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
    }
  }

  // Prevent default behavior on button mousedown to avoid losing text selection.
  const onButtonMouseDown = (e: React.MouseEvent<HTMLButtonElement>, command: string, arg?: string) => {
    e.preventDefault();
    handleCommand(command, arg);
  };
  
  const onSelectMouseDown = (e: React.MouseEvent<HTMLSelectElement>) => {
    e.preventDefault();
  }

  return (
    <div className="rounded-md border border-input bg-background ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="p-2 border-b flex flex-wrap items-center gap-1 text-sm bg-muted/50 rounded-t-md">
            <button type="button" onMouseDown={(e) => onButtonMouseDown(e, 'undo')} title="Undo" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">↩️</button>
            <button type="button" onMouseDown={(e) => onButtonMouseDown(e, 'redo')} title="Redo" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">↪️</button>
            <select onChange={e => handleCommand('formatBlock', e.target.value)} defaultValue="p" className="p-2 bg-transparent hover:bg-accent hover:text-accent-foreground rounded-md" onMouseDown={(e) => e.preventDefault()}>
                <option value="p">Normal</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="blockquote">Quote</option>
            </select>
            <button type="button" onMouseDown={(e) => onButtonMouseDown(e, 'bold')} title="Bold" className="font-bold p-2 hover:bg-accent hover:text-accent-foreground rounded-md">B</button>
            <button type="button" onMouseDown={(e) => onButtonMouseDown(e, 'italic')} title="Italic" className="italic p-2 hover:bg-accent hover:text-accent-foreground rounded-md">I</button>
            <button type="button" onMouseDown={(e) => onButtonMouseDown(e, 'underline')} title="Underline" className="underline p-2 hover:bg-accent hover:text-accent-foreground rounded-md">U</button>
            <button type="button" onMouseDown={(e) => onButtonMouseDown(e, 'strikeThrough')} title="Strikethrough" className="line-through p-2 hover:bg-accent hover:text-accent-foreground rounded-md">S</button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); const url = prompt('Enter URL:'); if(url) handleCommand('createLink', url) }} title="Link" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">🔗</button>
            <button type="button" onMouseDown={(e) => onButtonMouseDown(e, 'unlink')} title="Unlink" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">💔</button>
            <button type="button" onMouseDown={(e) => onButtonMouseDown(e, 'justifyLeft')} title="Align Left" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">📄</button>
            <button type="button" onMouseDown={(e) => onButtonMouseDown(e, 'justifyCenter')} title="Align Center" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">📄</button>
            <button type="button" onMouseDown={(e) => onButtonMouseDown(e, 'justifyRight')} title="Align Right" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">📄</button>
            <button type="button" onMouseDown={(e) => onButtonMouseDown(e, 'insertOrderedList')} title="Ordered List" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">1.</button>
            <button type="button" onMouseDown={(e) => onButtonMouseDown(e, 'insertUnorderedList')} title="Unordered List" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">•</button>
            <button type="button" onMouseDown={e => { e.preventDefault(); handleCodeBlock(); }} title="Code Block" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">&lt;/&gt;</button>
            <button type="button" onMouseDown={(e) => onButtonMouseDown(e, 'insertHorizontalRule')} title="Horizontal Rule" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">―</button>
        </div>
        <div
            ref={editorRef}
            contentEditable={true}
            onInput={handleContentChange}
            dangerouslySetInnerHTML={{ __html: value }} // Use the value prop to set initial content
            className="min-h-[250px] w-full rounded-b-md bg-transparent px-3 py-2 text-base placeholder:text-muted-foreground md:text-sm p-4 prose dark:prose-invert max-w-none"
            suppressContentEditableWarning={true}
        />
    </div>
  );
};

export default RichTextEditor;
