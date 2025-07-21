import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PlusIcon } from "@heroicons/react/24/outline";
import ComponentPalette from "./TemplateEditorComponents/ComponentPalette";
import SectionsArea from "./TemplateEditorComponents/SectionsArea";
import ConfigurationPanel from "./TemplateEditorComponents/ConfigurationPanel";
import PreviewPanel from "./TemplateEditorComponents/PreviewPanel";
import useTemplateManagement from "./TemplateEditorComponents/useTemplateManagement";
import EventModal from "./TemplateEditorComponents/EventModal";
import SelectEventsModal from "./SelectEventsModal";

const TemplateEditor = ({ initialTemplate, onSave, onCancel }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showSelectEventsModal, setShowSelectEventsModal] = useState(false);

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
    // removeEvent, // Eliminado ya que no se usa
    generateDefaultStructure,
  } = useTemplateManagement(initialTemplate);

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleAddEventToSection = () => {
    if (selectedItem && typeof selectedItem.index === "number") {
      addEventToSection(selectedItem.index);
    }
  };

  const handleSelectEvents = (events) => {
    if (selectedItem && typeof selectedItem.index === "number") {
      const sectionIndex = selectedItem.index;
      const updatedSections = [...template.sections];
      updatedSections[sectionIndex].events = [
        ...(updatedSections[sectionIndex].events || []),
        ...events,
      ];
      updateTemplate("sections", updatedSections);
    }
  };

  const getCurrentSection = () => {
    if (!selectedItem) return null;
    return selectedItem.type === "section"
      ? template.sections[selectedItem.index]
      : template.sections[selectedItem.sectionIndex];
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-gray-50">
        <ComponentPalette
          addSection={addSection}
          template={template}
          updateTemplate={updateTemplate}
          generateDefaultStructure={generateDefaultStructure}
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
          updateTemplate={updateTemplate}
          onSave={onSave}
          onCancel={onCancel}
          initialTemplate={initialTemplate}
          onPreview={togglePreview}
        />

        {selectedItem && (
          <ConfigurationPanel
            selectedItem={selectedItem}
            template={template}
            updateTemplate={updateTemplate}
            handleFileUpload={handleFileUpload}
            currentSection={getCurrentSection()}
            addEventToSection={handleAddEventToSection}
            setShowSelectEventsModal={setShowSelectEventsModal}
            setSelectedItem={setSelectedItem}
          />
        )}

        {isModalOpen &&
          selectedItem &&
          typeof selectedItem.index === "number" && (
            <EventModal
              eventData={eventData}
              setEventData={setEventData}
              setIsModalOpen={setIsModalOpen}
              addEventToSection={handleAddEventToSection}
            />
          )}

        {showSelectEventsModal &&
          selectedItem &&
          typeof selectedItem.index === "number" && (
            <SelectEventsModal
              isOpen={showSelectEventsModal}
              onClose={() => setShowSelectEventsModal(false)}
              onSelectEvents={handleSelectEvents}
            />
          )}

        {showPreview && (
          <PreviewPanel template={template} onClose={togglePreview} />
        )}
      </div>
    </DndProvider>
  );
};

export default TemplateEditor;
