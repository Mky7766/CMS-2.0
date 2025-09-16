"use client";

import React, { useEffect, useRef } from 'react';

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && value !== editor.innerHTML) {
        editor.innerHTML = value;
    }
  }, [value]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
  };

  const handleCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    if(editorRef.current) {
        onChange(editorRef.current.innerHTML);
    }
  };
  
  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      handleCommand('createLink', url);
    }
  };

  const onButtonMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const command = e.currentTarget.dataset.command;
    const arg = e.currentTarget.dataset.arg;
    if(command) {
        handleCommand(command, arg);
    }
  };
  
   const onSelectMouseDown = (e: React.MouseEvent<HTMLSelectElement>) => {
    e.preventDefault();
  }

  return (
    <div className="rounded-md border border-input bg-background ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      <div className="p-1 border-b flex flex-wrap items-center gap-1 text-sm bg-muted/50 rounded-t-md">
        <button type="button" onMouseDown={onButtonMouseDown} data-command="undo" title="Undo" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">↩️</button>
        <button type="button" onMouseDown={onButtonMouseDown} data-command="redo" title="Redo" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">↪️</button>
        <select onChange={e => handleCommand('formatBlock', e.target.value)} defaultValue="p" className="p-2 bg-transparent hover:bg-accent hover:text-accent-foreground rounded-md" onMouseDown={onSelectMouseDown}>
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="blockquote">Quote</option>
        </select>
        <button type="button" onMouseDown={onButtonMouseDown} data-command="bold" title="Bold" className="font-bold p-2 w-8 hover:bg-accent hover:text-accent-foreground rounded-md">B</button>
        <button type="button" onMouseDown={onButtonMouseDown} data-command="italic" title="Italic" className="italic p-2 w-8 hover:bg-accent hover:text-accent-foreground rounded-md">I</button>
        <button type="button" onMouseDown={onButtonMouseDown} data-command="underline" title="Underline" className="underline p-2 w-8 hover:bg-accent hover:text-accent-foreground rounded-md">U</button>
        <button type="button" onMouseDown={onButtonMouseDown} data-command="strikeThrough" title="Strikethrough" className="line-through p-2 w-8 hover:bg-accent hover:text-accent-foreground rounded-md">S</button>
        <button type="button" onMouseDown={() => handleLink()} title="Link" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">🔗</button>
        <button type="button" onMouseDown={onButtonMouseDown} data-command="unlink" title="Unlink" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">💔</button>
        <button type="button" onMouseDown={onButtonMouseDown} data-command="justifyLeft" title="Align Left" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M3 21v-2h18v2H3Zm0-4v-2h12v2H3Zm0-4v-2h18v2H3Zm0-4V7h12v2H3Zm0-4V3h18v2H3Z"/></svg>
        </button>
        <button type="button" onMouseDown={onButtonMouseDown} data-command="justifyCenter" title="Align Center" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M3 21v-2h18v2H3Zm4-4v-2h10v2H7ZM3 9V7h18v2H3Zm4-4V3h10v2H7Z"/></svg>
        </button>
        <button type="button" onMouseDown={onButtonMouseDown} data-command="justifyRight" title="Align Right" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M3 21v-2h18v2H3Zm8-4v-2h10v2H11ZM3 9V7h18v2H3Zm8-4V3h10v2H11Z"/></svg>
        </button>
        <button type="button" onMouseDown={onButtonMouseDown} data-command="insertOrderedList" title="Ordered List" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M4 17.154q-.369 0-.623-.254t-.254-.623q0-.369.254-.623t.623-.254q.369 0 .623.254t.254.623q0 .369-.254.623T4 17.154ZM3 11V9h18v2H3Zm1-2.846q-.369 0-.623-.254T3.123 7.43q0-.369.254-.623t.623-.254q.369 0 .623.254t.254.623q0 .369-.254.623T4 8.154ZM3 5V3h18v2H3Zm2.25 10.769v-1.153H3.5v-.731h2.5V15H4.25v.769H6.5v.731H4.25v.923H3.5v-1.615Zm.193-6.077L3.5 10.385v-.577l.808-.615H5.5V11H3.5v-.731l1.038-.769q.25-.192.413-.356t.221-.269q.058-.106.077-.183t.019-.163q0-.25-.163-.384t-.433-.135q-.25 0-.423.115t-.25.327H2.5q.058-.48.365-.77t.75-.29q.461 0 .73.25t.27.6q0 .211-.086.403t-.25.366q-.163.173-.461.404Z"/></svg>
        </button>
        <button type="button" onMouseDown={onButtonMouseDown} data-command="insertUnorderedList" title="Unordered List" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">
             <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M3 17v-2h18v2H3Zm0-6v-2h18v2H3Zm0-6V3h18v2H3Z"/></svg>
        </button>
        <button type="button" onMouseDown={onButtonMouseDown} data-command="formatBlock" data-arg="pre" title="Code Block" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">&lt;/&gt;</button>
        <button type="button" onMouseDown={onButtonMouseDown} data-command="insertHorizontalRule" title="Horizontal Rule" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md">―</button>
      </div>
      <div
        ref={editorRef}
        contentEditable={true}
        onInput={handleInput}
        className="min-h-[250px] w-full rounded-b-md bg-transparent px-3 py-2 text-base placeholder:text-muted-foreground md:text-sm p-4 prose dark:prose-invert max-w-none focus-visible:outline-none"
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

export default RichTextEditor;
