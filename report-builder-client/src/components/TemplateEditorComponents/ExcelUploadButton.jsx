import React from "react";

const ExcelUploadButton = ({ sectionIndex, handleFileUpload }) => {
  return (
    <div className="mt-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Subir archivo Excel
      </label>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={(e) => handleFileUpload(sectionIndex, e)}
        className="w-full p-2 border rounded text-sm"
      />
    </div>
  );
};

export default ExcelUploadButton;
