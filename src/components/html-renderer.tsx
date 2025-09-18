
"use client";

import React, { useEffect, useRef } from 'react';

// A component to render raw HTML content, including executing <script> tags safely on the client.
type HtmlRendererProps = {
  htmlContent: string;
};

const HtmlRenderer: React.FC<HtmlRendererProps> = ({ htmlContent }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptsLoaded = useRef(new Set<string>());

  useEffect(() => {
    if (containerRef.current) {
      // First, set the inner HTML from the content string.
      // This will create the DOM nodes, including script tags, but won't execute them.
      containerRef.current.innerHTML = htmlContent;

      // Find all script tags within the newly created content.
      const scripts = containerRef.current.querySelectorAll('script');
      
      scripts.forEach(script => {
        // To prevent re-running scripts on re-renders, we check if it's already been loaded.
        const scriptId = script.src || script.innerHTML;
        if (scriptsLoaded.current.has(scriptId)) {
          return;
        }

        const newScript = document.createElement('script');
        
        // Copy attributes from the original script tag to the new one.
        script.getAttributeNames().forEach(attr => {
          const value = script.getAttribute(attr);
          if (value) {
            newScript.setAttribute(attr, value);
          }
        });
        
        // Copy inner content for inline scripts.
        if (script.innerHTML) {
          newScript.innerHTML = script.innerHTML;
        }

        // The browser will execute the script when it's appended to the document.
        document.body.appendChild(newScript);
        
        // Mark this script as loaded.
        scriptsLoaded.current.add(scriptId);

        // Clean up by removing the script from the DOM when the component unmounts.
        return () => {
          document.body.removeChild(newScript);
        };
      });
    }
  }, [htmlContent]);

  // The div is initially rendered empty and then populated on the client.
  // To avoid server/client mismatch, we can also use dangerouslySetInnerHTML
  // but that won't execute scripts. The useEffect approach is safer for scripts.
  // For the initial render, we render the HTML without scripts to avoid mismatch.
  const staticHtml = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: staticHtml }} />;
};

export default HtmlRenderer;
