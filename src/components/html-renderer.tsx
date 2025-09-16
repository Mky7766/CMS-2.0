
"use client";

import React, { useEffect, useRef } from 'react';

type HtmlRendererProps = {
  htmlContent: string;
};

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
      
      Array.from(tempDiv.childNodes).forEach(node => {
        if (node.nodeName === 'SCRIPT') {
          const script = document.createElement('script');
          const oldScript = node as HTMLScriptElement;
          
          if(oldScript.src) {
              script.src = oldScript.src;
          }
          if(oldScript.innerHTML) {
              script.innerHTML = oldScript.innerHTML;
          }
          
          for (const attr of oldScript.attributes) {
            script.setAttribute(attr.name, attr.value);
          }
          document.body.appendChild(script); // Append to body to ensure execution
        } else {
          container.appendChild(node.cloneNode(true));
        }
      });
    }
  }, [htmlContent]);

  return <div ref={containerRef} />;
};

export default HtmlRenderer;
