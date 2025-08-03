using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ReportBuilderAPI.Models
{
    /// <summary>
    /// Resultado del análisis estructural de un PDF
    /// </summary>
    public class PDFAnalysisResult
    {
        public string DocumentTitle { get; set; } = string.Empty;
        public List<PDFSection> Sections { get; set; } = new List<PDFSection>();
        public List<AreaAssignment> SuggestedAreaAssignments { get; set; } = new List<AreaAssignment>();
        public Dictionary<string, object> Metadata { get; set; } = new Dictionary<string, object>();
        public DateTime AnalyzedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Sección identificada en el PDF
    /// </summary>
    public class PDFSection
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Title { get; set; } = string.Empty;
        public string Subtitle { get; set; } = string.Empty;
        public int PageNumber { get; set; }
        public int Order { get; set; }
        public string Content { get; set; } = string.Empty;
        public List<PDFComponent> Components { get; set; } = new List<PDFComponent>();
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
        public List<string> Keywords { get; set; } = new List<string>();
        public string SuggestedArea { get; set; } = string.Empty;
        public double Confidence { get; set; } = 0.0;
        public string ContentType { get; set; } = "texto";
    }

    /// <summary>
    /// Componente identificado dentro de una sección
    /// </summary>
    public class PDFComponent
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public ComponentType Type { get; set; }
        public string Content { get; set; } = string.Empty;
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
        public ComponentPosition Position { get; set; } = new ComponentPosition();
        public string Caption { get; set; } = string.Empty;
        public List<string> DataSources { get; set; } = new List<string>();
    }

    /// <summary>
    /// Posición del componente en el documento
    /// </summary>
    public class ComponentPosition
    {
        public float X { get; set; }
        public float Y { get; set; }
        public float Width { get; set; }
        public float Height { get; set; }
        public int Page { get; set; }
    }

    /// <summary>
    /// Asignación sugerida de sección a área
    /// </summary>
    public class AreaAssignment
    {
        public string SectionId { get; set; } = string.Empty;
        public string SectionTitle { get; set; } = string.Empty;
        public int AreaId { get; set; }
        public string AreaName { get; set; } = string.Empty;
        public double Confidence { get; set; } = 0.0;
        public List<string> Reasoning { get; set; } = new List<string>();
        public List<ComponentType> RequiredComponents { get; set; } = new List<ComponentType>();
    }

    /// <summary>
    /// Tipos de componentes que pueden existir en un documento
    /// </summary>
    public enum ComponentType
    {
        Text,
        Table,
        Chart,
        Image,
        KPI,
        Graph,
        List,
        Header,
        Footer,
        Navigation,
        Summary,
        DataGrid,
        Form,
        Button,
        Link
    }

    /// <summary>
    /// Configuración para el análisis de PDF
    /// </summary>
    public class PDFAnalysisConfig
    {
        public bool ExtractText { get; set; } = true;
        public bool IdentifySections { get; set; } = true;
        public bool IdentifyComponents { get; set; } = true;
        public bool SuggestAreaAssignments { get; set; } = true;
        public bool GenerateTemplates { get; set; } = true;
        public List<string> AreaKeywords { get; set; } = new List<string>();
        public Dictionary<string, List<string>> AreaMappings { get; set; } = new Dictionary<string, List<string>>();
        public double MinConfidence { get; set; } = 0.7;
        public string Language { get; set; } = "es";
    }

    /// <summary>
    /// Plantilla generada para una sección específica
    /// </summary>
    public class GeneratedSectionTemplate
    {
        public string SectionId { get; set; } = string.Empty;
        public string SectionTitle { get; set; } = string.Empty;
        public int AreaId { get; set; }
        public string AreaName { get; set; } = string.Empty;
        public List<ComponentTemplate> Components { get; set; } = new List<ComponentTemplate>();
        public Dictionary<string, object> Configuration { get; set; } = new Dictionary<string, object>();
        public string Instructions { get; set; } = string.Empty;
        public List<string> RequiredDataSources { get; set; } = new List<string>();
    }

    /// <summary>
    /// Plantilla para un componente específico
    /// </summary>
    public class ComponentTemplate
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public ComponentType Type { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Dictionary<string, object> Configuration { get; set; } = new Dictionary<string, object>();
        public List<string> DataFields { get; set; } = new List<string>();
        public bool Required { get; set; } = true;
        public int Order { get; set; }
        public string DefaultValue { get; set; } = string.Empty;
    }
} 