
"use client";

import React, { useEffect, useRef } from 'react';

// A simple regex to find ```html ... ``` blocks
const codeBlockRegex = /```html\n([\s\S]*?)\n```/g;

type HtmlRendererProps = {
  htmlContent: string;
};

const HtmlRenderer: React.FC<HtmlRendererProps> = ({ htmlContent }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptsExecuted = useRef(new Set<string>());

  // This effect will run after the component mounts and after every update.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Find and execute script tags within the rendered HTML
    const scripts = Array.from(container.getElementsByTagName('script'));
    for (const script of scripts) {
        const src = script.getAttribute('src');
        const scriptId = src || script.innerHTML;

        // Prevent re-execution of the same script
        if (scriptsExecuted.current.has(scriptId)) {
            continue;
        }

        // Special check for Google Maps API to prevent re-initialization error
        if (src && src.includes('maps.googleapis.com') && (window as any).google?.maps) {
            console.log("Google Maps API already loaded, skipping script injection.");
            scriptsExecuted.current.add(scriptId);
            continue;
        }

      const newScript = document.createElement('script');
      
      // Copy attributes
      for (let j = 0; j < script.attributes.length; j++) {
        newScript.setAttribute(script.attributes[j].name, script.attributes[j].value);
      }
      
      // Copy inline script content
      if (script.innerHTML) {
        newScript.innerHTML = script.innerHTML;
      }
      
      // Replace the old script tag with the new one to trigger execution
      script.parentNode?.replaceChild(newScript, script);
      scriptsExecuted.current.add(scriptId);
    }
  }, [htmlContent]); // Re-run the effect if the htmlContent changes

  // Use a replacer function to handle markdown-style code blocks
  const processedContent = htmlContent.replace(codeBlockRegex, (match, code) => {
    // The captured group `code` is the raw HTML, CSS, JS content.
    // We just return it as is, to be injected into the div.
    return code;
  }).replace(/(?<!```)\n/g, '<br />'); // Replace newlines with <br> only outside of code blocks.


  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

export default HtmlRenderer;

    