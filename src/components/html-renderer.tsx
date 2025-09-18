
"use client";

// A simple component to render raw HTML content.
// It uses `dangerouslySetInnerHTML` which is safe in this context
// as the HTML content is controlled by the user from the CMS settings.

type HtmlRendererProps = {
  htmlContent: string;
};

const HtmlRenderer: React.FC<HtmlRendererProps> = ({ htmlContent }) => {
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default HtmlRenderer;
