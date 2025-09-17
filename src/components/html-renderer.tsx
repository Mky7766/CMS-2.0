
"use client";

import React, { useEffect, useRef } from 'react';

type HtmlRendererProps = {
  htmlContent: string;
};

// Use a global Set to track loaded script sources to prevent duplicates
const loadedScriptSources = new Set<string>();

const HtmlRenderer: React.FC<HtmlRendererProps> = ({ htmlContent }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container && htmlContent) {
      // Create a temporary element to hold the new content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;

      // Clear the container and append new nodes
      container.innerHTML = '';
      
      const scriptsToLoad: HTMLScriptElement[] = [];
      const nonScriptNodes: Node[] = [];

      Array.from(tempDiv.childNodes).forEach(node => {
        if (node.nodeName === 'SCRIPT') {
            const script = node as HTMLScriptElement;
            // Only add script if its source hasn't been loaded before
            if (script.src && !loadedScriptSources.has(script.src)) {
                scriptsToLoad.push(script);
                loadedScriptSources.add(script.src);
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
        if (oldScript.src) {
            script.src = oldScript.src;
        }
        if (oldScript.innerHTML) {
            script.innerHTML = oldScript.innerHTML;
        }
        for (const attr of oldScript.attributes) {
            script.setAttribute(attr.name, attr.value);
        }
        document.body.appendChild(script);
      });

    }
  }, [htmlContent]);

  return <div ref={containerRef} />;
};

export default HtmlRenderer;
