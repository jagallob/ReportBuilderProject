import React from "react";
import { useNavigate } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ComponentPalette from "./TemplateEditorComponents/ComponentPalette";
import SectionsArea from "./TemplateEditorComponents/SectionsArea";
import ConfigurationPanel from "./TemplateEditorComponents/ConfigurationPanel";
import useTemplateManagement from "./TemplateEditorComponents/useTemplateManagement";
import HeaderActions from "../layouts/HeaderActions";

const TemplateEditor = ({ initialTemplate, onSave, onCancel }) => {
  const navigate = useNavigate();
  const onViewReports = () => {
    navigate("/dashboard/reports");
  };
  const {
    template,
    selectedItem,
    isModalOpen,
    eventData,
    updateTemplate,
    addSection,
    removeSection,
    addComponent,
    moveComponent,
    removeComponent,
    setSelectedItem,
    setIsModalOpen,
    setEventData,
    handleFileUpload,
    addEventToSection,
    removeEvent,
  } = useTemplateManagement(initialTemplate);

  return (
    <DndProvider backend={HTML5Backend}>
      <HeaderActions onViewReports={onViewReports} onCancel={onCancel} />
      <div className="flex h-screen bg-gray-50">
        <ComponentPalette
          addSection={addSection}
          template={template}
          updateTemplate={updateTemplate}
        />

        <SectionsArea
          template={template}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          addSection={addSection}
          removeSection={removeSection}
          addComponent={addComponent}
          moveComponent={moveComponent}
          removeComponent={removeComponent}
          handleFileUpload={handleFileUpload}
          onSave={onSave}
          onCancel={onCancel}
          initialTemplate={initialTemplate}
        />

        {selectedItem && (
          <ConfigurationPanel
            selectedItem={selectedItem}
            template={template}
            updateTemplate={updateTemplate}
            setIsModalOpen={setIsModalOpen}
            removeEvent={removeEvent}
          />
        )}

        {isModalOpen && (
          <EventModal
            eventData={eventData}
            setEventData={setEventData}
            setIsModalOpen={setIsModalOpen}
            addEventToSection={() => addEventToSection(selectedItem.index)}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default TemplateEditor;
