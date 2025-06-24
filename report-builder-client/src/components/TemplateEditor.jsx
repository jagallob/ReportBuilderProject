import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PlusIcon } from "@heroicons/react/24/outline";
import ComponentPalette from "./TemplateEditorComponents/ComponentPalette";
import SectionsArea from "./TemplateEditorComponents/SectionsArea";
import ConfigurationPanel from "./TemplateEditorComponents/ConfigurationPanel";
import PreviewPanel from "./TemplateEditorComponents/PreviewPanel";
import PreviewButton from "./TemplateEditorComponents/PreviewButton";
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
    removeEvent,
    generateDefaultStructure,
  } = useTemplateManagement(initialTemplate);

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Handler para agregar evento a la sección seleccionada (evita función inline y valida selectedItem)
  const handleAddEventToSection = () => {
    if (selectedItem && typeof selectedItem.index === "number") {
      addEventToSection(selectedItem.index);
    }
  };

  // Handler para agregar eventos seleccionados desde SelectEventsModal
  const handleSelectEvents = (events) => {
    if (selectedItem && typeof selectedItem.index === "number") {
      // Agregar los eventos seleccionados a la sección correspondiente
      const sectionIndex = selectedItem.index;
      const updatedSections = [...template.sections];
      updatedSections[sectionIndex].events = [
        ...(updatedSections[sectionIndex].events || []),
        ...events,
      ];
      updateTemplate("sections", updatedSections);
    }
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
            setIsModalOpen={setIsModalOpen}
            removeEvent={removeEvent}
            handleFileUpload={handleFileUpload}
            currentSection={template.sections[selectedItem.index]}
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

        {/* Botones flotantes para agregar sucesos solo si hay sección seleccionada */}
        {selectedItem && typeof selectedItem.index === "number" && (
          <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-3 items-end">
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow"
              onClick={() => setIsModalOpen(true)}
              title="Agregar suceso manualmente"
            >
              + Agregar Suceso Manual
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
              onClick={() => setShowSelectEventsModal(true)}
              title="Agregar sucesos existentes"
            >
              + Agregar Sucesos Existentes
            </button>
          </div>
        )}

        {/* Modal para seleccionar eventos existentes */}
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

/* Tailwind extra: .fab-action { @apply flex items-center gap-2 text-white font-bold py-2 px-4 rounded shadow; } */
