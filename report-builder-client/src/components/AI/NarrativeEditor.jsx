import React from "react";
const NarrativeEditor = ({ narrative, onChange }) => (
  <div className="narrative-editor">
    <h2>Narrative Editor</h2>
    <textarea
      value={narrative}
      onChange={(e) => onChange(e.target.value)}
      rows={10}
    />
  </div>
);
export default NarrativeEditor;
