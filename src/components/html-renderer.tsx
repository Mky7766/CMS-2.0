
"use client";

import React, { useEffect, useRef } from 'react';

// A simple regex to find ```html ... ``` blocks
const codeBlockRegex = /```html\n([\s\S]*?)\n```/g;

type HtmlRendererProps = {
  htmlContent: string;
};

const HtmlRenderer: React.FC<HtmlRendererProps> = ({ htmlContent }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // This effect will run after the component mounts and after every update.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Find and execute script tags within the rendered HTML
    const scripts = container.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
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
    }
  }, [htmlContent]); // Re-run the effect if the htmlContent changes

  // Use a replacer function to handle markdown-style code blocks
  const processedContent = htmlContent.replace(codeBlockRegex, (match, code) => {
    // The captured group `code` is the raw HTML, CSS, JS content.
    // We just return it as is, to be injected into the div.
    return code;
  }).replace(/\n/g, '<br />'); // Also replace newlines with <br> for non-HTML content.


  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

export default HtmlRenderer;

    