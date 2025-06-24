import React from "react";
const AITemplateBuilder = ({ template, onChange }) => (
  <div className="ai-template-builder">
    <h2>AI Template Builder</h2>
    <textarea
      value={template}
      onChange={(e) => onChange(e.target.value)}
      rows={8}
    />
  </div>
);
export default AITemplateBuilder;
