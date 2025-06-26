import React, { useState, useCallback, useEffect } from "react";
import {
  Brain,
  FileText,
  Download,
  Loader2,
  TrendingUp,
  BarChart3,
  AlertCircle,
} from "lucide-react";

const NarrativeGenerator = ({ excelData, onNarrativeGenerated }) => {
  const [data, setData] = useState(excelData || null);
  const [analysis, setAnalysis] = useState(null);
  const [narrative, setNarrative] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(excelData ? 2 : 1);
  const [error, setError] = useState("");

  // Si excelData cambia, actualizar data y saltar al paso 2 automáticamente
  useEffect(() => {
    if (excelData) {
      setData(excelData);
      setStep(2);
    }
  }, [excelData]);

  // Llamar a backend para análisis IA
  const analyzeExcelData = useCallback(async () => {
    if (!data) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/analytics/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!response.ok) throw new Error("Error en análisis IA");
      const result = await response.json();
      setAnalysis(result);
      setStep(3);
    } catch (err) {
      setError("Error en análisis IA: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [data]);

  // Llamar a backend para generar narrativa
  const generateNarrative = useCallback(async () => {
    if (!analysis) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/narrative/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis }),
      });
      if (!response.ok) throw new Error("Error generando narrativa");
      const result = await response.json();
      setNarrative(result.narrative || result);
      setStep(4);
    } catch (err) {
      setError("Error generando narrativa: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [analysis]);

  // Cuando la narrativa esté lista y el callback esté definido, pásala automáticamente
  useEffect(() => {
    if (step === 4 && narrative && typeof onNarrativeGenerated === "function") {
      onNarrativeGenerated(narrative);
    }
  }, [step, narrative, onNarrativeGenerated]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-blue-600" />
          Generador de Narrativas con IA
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Genera automáticamente narrativas profesionales con análisis
          inteligente
        </p>
      </div>
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
      )}
      {/* Progress Steps */}
      <div className="flex justify-center items-center space-x-4 mb-8">
        {[2, 3, 4].map((stepNum) => (
          <React.Fragment key={stepNum}>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold
              ${
                step >= stepNum
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {stepNum - 1}
            </div>
            {stepNum < 4 && (
              <div
                className={`w-12 h-1 ${
                  step > stepNum ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      {/* Step 2: Data Preview */}
      {step === 2 && data && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Paso 1: Vista Previa de Datos
          </h2>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                Archivo: {data.fileName || "-"}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Hojas detectadas: {data.sheets ? data.sheets.join(", ") : "-"}
              </p>
              {/* Data Preview (ajusta según estructura real) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Ejemplo para ventas */}
                {data.data && data.data.ventas && (
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-medium text-blue-600 mb-2">
                      Datos de Ventas
                    </h4>
                    <div className="text-sm space-y-1">
                      {data.data.ventas.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.mes}</span>
                          <span className="text-green-600">
                            ${item.valor.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Ejemplo para costos */}
                {data.data && data.data.costos && (
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-medium text-orange-600 mb-2">
                      Análisis de Costos
                    </h4>
                    <div className="text-sm space-y-1">
                      {data.data.costos.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.categoria}</span>
                          <span
                            className={
                              item.variacion < 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {item.variacion > 0 ? "+" : ""}
                            {item.variacion}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Ejemplo para satisfacción */}
                {data.data && data.data.satisfaccion && (
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-medium text-purple-600 mb-2">
                      Satisfacción Cliente
                    </h4>
                    <div className="text-sm space-y-1">
                      {data.data.satisfaccion.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.trimestre}</span>
                          <span className="text-green-600">
                            {item.puntuacion}/10
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={analyzeExcelData}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analizando datos con IA...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  Analizar Datos con IA
                </>
              )}
            </button>
          </div>
        </div>
      )}
      {/* Step 3: Analysis Results */}
      {step === 3 && analysis && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Paso 2: Resultados del Análisis IA
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tendencias */}
            {analysis.trends && (
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tendencias Principales
                </h3>
                <ul className="space-y-2">
                  {analysis.trends.map((trend, idx) => (
                    <li
                      key={idx}
                      className="text-green-700 flex items-start gap-2"
                    >
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      {trend}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Anomalías */}
            {analysis.anomalies && (
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="font-semibold text-orange-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Anomalías Detectadas
                </h3>
                <ul className="space-y-2">
                  {analysis.anomalies.map((anomaly, idx) => (
                    <li
                      key={idx}
                      className="text-orange-700 flex items-start gap-2"
                    >
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                      {anomaly}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Métricas Clave */}
            {analysis.keyMetrics && (
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-4">
                  Métricas Clave
                </h3>
                <div className="space-y-3">
                  {Object.entries(analysis.keyMetrics).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center"
                    >
                      <span className="text-blue-700 font-medium">{key}</span>
                      <span className="text-blue-900 font-bold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Recomendaciones */}
            {analysis.recommendations && (
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-4">
                  Recomendaciones
                </h3>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, idx) => (
                    <li
                      key={idx}
                      className="text-purple-700 flex items-start gap-2"
                    >
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <button
            onClick={generateNarrative}
            disabled={loading}
            className="w-full mt-6 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generando narrativa...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Generar Narrativa Automática
              </>
            )}
          </button>
        </div>
      )}
      {/* Step 4: Generated Narrative */}
      {step === 4 && narrative && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Paso 3: Narrativa Generada
          </h2>
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="prose max-w-none mb-4">
              <textarea
                className="w-full min-h-[250px] p-3 rounded border border-gray-300 text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                placeholder="Edita la narrativa generada aquí..."
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                const blob = new Blob([narrative], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "narrativa-generada.txt";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Descargar Narrativa
            </button>
            <button
              onClick={() => {
                setStep(2);
                setAnalysis(null);
                setNarrative("");
              }}
              className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
            >
              Reiniciar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NarrativeGenerator;
