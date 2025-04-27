import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";

const useTemplateManagement = (initialTemplate) => {
  const defaultTemplate = {
    metadata: {
      templateType: "generic",
      description: "",
      version: "1.0.0",
    },
    sections: [],
  };

  const [template, setTemplate] = useState(initialTemplate || defaultTemplate);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
  });

  const updateTemplate = (path, value) => {
    const keys = path.split(".");
    setTemplate((prev) => {
      const newTemplate = JSON.parse(JSON.stringify(prev));
      let current = newTemplate;

      keys.slice(0, -1).forEach((key) => {
        current[key] = { ...current[key] };
        current = current[key];
      });

      current[keys[keys.length - 1]] = value;
      return newTemplate;
    });
  };

  const addSection = () => {
    const newSection = {
      sectionId: uuidv4(),
      title: `Nueva Sección ${template.sections.length + 1}`,
      type: "composite",
      components: [],
      events: [],
    };
    updateTemplate("sections", [...template.sections, newSection]);
    setSelectedItem({ type: "section", index: template.sections.length });
  };

  const removeSection = (index) => {
    const newSections = [...template.sections];
    newSections.splice(index, 1);
    updateTemplate("sections", newSections);
    setSelectedItem(null);
  };

  const addComponent = (sectionIndex, componentType) => {
    const newComponent = {
      componentId: uuidv4(),
      type: componentType,
      dataSource: { sourceType: "manual" },
      displayOptions: {},
    };

    const updatedSections = [...template.sections];
    updatedSections[sectionIndex].components.push(newComponent);
    updateTemplate("sections", updatedSections);

    setSelectedItem({
      type: "component",
      sectionIndex,
      componentIndex: updatedSections[sectionIndex].components.length - 1,
    });
  };

  const moveComponent = (fromSection, fromIndex, toSection, toIndex) => {
    if (fromSection === toSection && fromIndex === toIndex) return;

    setTemplate((prev) => {
      const newTemplate = JSON.parse(JSON.stringify(prev));
      const [moved] = newTemplate.sections[fromSection].components.splice(
        fromIndex,
        1
      );

      if (toIndex >= newTemplate.sections[toSection].components.length) {
        newTemplate.sections[toSection].components.push(moved);
      } else {
        newTemplate.sections[toSection].components.splice(toIndex, 0, moved);
      }

      return newTemplate;
    });
  };

  const removeComponent = (sectionIndex, componentIndex) => {
    const updatedSections = [...template.sections];
    updatedSections[sectionIndex].components.splice(componentIndex, 1);
    updateTemplate("sections", updatedSections);
    setSelectedItem(null);
  };

  const handleFileUpload = (sectionIndex, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      updateTemplate(`sections.${sectionIndex}.excelData`, jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const addEventToSection = (sectionIndex) => {
    const updatedSections = [...template.sections];
    updatedSections[sectionIndex].events = [
      ...(updatedSections[sectionIndex].events || []),
      { ...eventData, id: uuidv4() },
    ];
    updateTemplate("sections", updatedSections);
    setIsModalOpen(false);
    setEventData({ title: "", description: "", date: "" });
  };

  const removeEvent = (sectionIndex, eventIndex) => {
    const updatedSections = [...template.sections];
    updatedSections[sectionIndex].events.splice(eventIndex, 1);
    updateTemplate("sections", updatedSections);
  };

  return {
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
  };
};

export default useTemplateManagement;
