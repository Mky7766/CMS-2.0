
"use client";

import React, { useEffect, useRef } from 'react';

type HtmlRendererProps = {
  htmlContent: string;
};

// This component is now only used on the client-side for dynamic content.
// For server-side rendering of settings code, we need a different approach.

const HtmlRenderer: React.FC<HtmlRendererProps> = ({ htmlContent }) => {
  if (typeof window === 'undefined') {
    // For server-side rendering, we'll use dangerouslySetInnerHTML in the layout.
    // To make this component universal, we render nothing on the server.
    // A better approach would be to parse and sanitize, but this is a quick fix.
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  }
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Use a global Set to track loaded script sources to prevent duplicates on client-side navigations
  const loadedScriptSources = useRef(new Set<string>());

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !htmlContent) return;

    // Create a temporary element to hold the new content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Clear the container
    container.innerHTML = '';
      
    const scriptsToLoad: HTMLScriptElement[] = [];
    const nonScriptNodes: Node[] = [];

    Array.from(tempDiv.childNodes).forEach(node => {
      if (node.nodeName === 'SCRIPT') {
          const script = node as HTMLScriptElement;
          // Only add script if its source hasn't been loaded before in this session
          if (script.src && !loadedScriptSources.current.has(script.src)) {
              scriptsToLoad.push(script);
              loadedScriptSources.current.add(script.src);
          } else if (!script.src) {
              // Always load inline scripts as they don't have a src to track
              scriptsToLoad.push(script);
          }
      } else {
        nonScriptNodes.push(node.cloneNode(true));
      }
    });
      
    nonScriptNodes.forEach(node => container.appendChild(node));

    scriptsToLoad.forEach(oldScript => {
      const script = document.createElement('script');
      // Copy all attributes
      for (const attr of oldScript.attributes) {
          script.setAttribute(attr.name, attr.value);
      }
      // Copy inline script content
      if (oldScript.innerHTML) {
          script.innerHTML = oldScript.innerHTML;
      }
      // Re-append the script to the body to execute it
      document.body.appendChild(script);
    });

  }, [htmlContent]);

  return <div ref={containerRef} />;
};

export default HtmlRenderer;
