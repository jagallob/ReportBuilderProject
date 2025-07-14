using Microsoft.Extensions.Options;
using ReportBuilderAPI.Services.MCP.Interfaces;
using ReportBuilderAPI.Configuration;
using ReportBuilderAPI.Services.MCP.Models;
using System.Text.Json;

namespace ReportBuilderAPI.Services.MCP.Implementation
{
    public class MCPClientService : IMCPClientService
    {
        private readonly HttpClient _httpClient;
        private readonly AISettings _settings;
        private readonly ILogger<MCPClientService> _logger;
        private readonly Dictionary<int, MCPContext> _contextCache;

        public MCPClientService(HttpClient httpClient, IOptions<AISettings> settings, ILogger<MCPClientService> logger)
        {
            _httpClient = httpClient;
            _settings = settings.Value;
            _logger = logger;
            _contextCache = new Dictionary<int, MCPContext>();
        }

        public async Task<bool> InitializeAsync()
        {
            try
            {
                _logger.LogInformation("Inicializando MCP Client Service");

                // Configurar HttpClient para MCP
                _httpClient.BaseAddress = new Uri("http://localhost:8000"); // URL del MCP Server
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "ReportBuilder-MCP-Client/1.0");

                // Verificar conectividad
                var health = await HealthCheckAsync();

                _logger.LogInformation($"MCP Client inicializado. Estado: {health.Message}");
                return health.Healthy;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inicializando MCP Client");
                return false;
            }
        }

        public async Task<MCPResponse> SendRequestAsync(MCPRequest request)
        {
            try
            {
                _logger.LogInformation($"Enviando request MCP: {request.Method}");

                var requestJson = JsonSerializer.Serialize(request);
                var content = new StringContent(requestJson, System.Text.Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("/api/mcp/process", content);

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var mcpResponse = JsonSerializer.Deserialize<MCPResponse>(responseContent);

                    _logger.LogInformation($"MCP request completado exitosamente: {request.Method}");
                    return mcpResponse ?? new MCPResponse { Success = false, Error = "Respuesta vacía" };
                }
                else
                {
                    _logger.LogWarning($"MCP request falló: {response.StatusCode}");
                    return new MCPResponse
                    {
                        Success = false,
                        Error = $"HTTP {response.StatusCode}: {response.ReasonPhrase}"
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error en MCP request: {request.Method}");
                return new MCPResponse
                {
                    Success = false,
                    Error = ex.Message
                };
            }
        }

        public async Task<bool> UpdateContextAsync(MCPContextUpdateRequest request)
        {
            try
            {
                _logger.LogInformation($"Actualizando contexto MCP para ReportId: {request.ReportId}");

                var contextToCache = new MCPContext
                {
                    ReportId = request.ReportId,
                    ReportType = request.ReportType,
                    HistoricalData = request.HistoricalData,
                    Templates = request.Templates,
                    Prompts = request.Prompts,
                    LastUpdated = DateTime.UtcNow
                };

                // Actualizar cache local
                _contextCache[request.ReportId] = contextToCache;

                // Enviar al servidor MCP
                var apiRequest = new MCPRequest
                {
                    Method = "update_context",
                    Parameters = new Dictionary<string, object>
                    {
                        ["report_id"] = request.ReportId,
                        ["context"] = contextToCache // Se envía el objeto completo
                    }
                };

                var response = await SendRequestAsync(apiRequest);

                if (response.Success)
                {
                    _logger.LogInformation($"Contexto MCP actualizado para ReportId: {request.ReportId}");
                    return true;
                }
                else
                {
                    _logger.LogWarning($"Error actualizando contexto MCP: {response.Error}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error actualizando contexto MCP para ReportId: {request.ReportId}");
                return false;
            }
        }

        public async Task<MCPContext> GetContextAsync(int reportId)
        {
            try
            {
                if (_contextCache.TryGetValue(reportId, out var cachedContext))
                {
                    _logger.LogDebug($"Contexto MCP obtenido del cache para ReportId: {reportId}");
                    return cachedContext;
                }

                _logger.LogInformation($"Obteniendo contexto MCP para ReportId: {reportId}");
                var request = new MCPRequest
                {
                    Method = "get_context",
                    Parameters = new Dictionary<string, object> { ["report_id"] = reportId }
                };

                var response = await SendRequestAsync(request);

                if (response.Success && response.Metadata.ContainsKey("context"))
                {
                    var context = JsonSerializer.Deserialize<MCPContext>(response.Metadata["context"].ToString() ?? "{}");
                    if (context != null)
                    {
                        _contextCache[reportId] = context;
                        _logger.LogInformation($"Contexto MCP obtenido para ReportId: {reportId}");
                        return context;
                    }
                }

                return new MCPContext { ReportId = reportId }; // Devuelve un contexto por defecto
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo contexto MCP para ReportId: {reportId}");
                return new MCPContext { ReportId = reportId };
            }
        }

        public async Task<MCPQueryResult> QueryAsync(MCPQueryRequest request)
        {
            try
            {
                _logger.LogInformation($"Ejecutando consulta MCP para ReportId: {request.ReportId}");

                var apiRequest = new MCPRequest
                {
                    Method = "query",
                    Parameters = new Dictionary<string, object>
                    {
                        ["report_id"] = request.ReportId,
                        ["query"] = request.Query
                    }
                };

                var response = await SendRequestAsync(apiRequest);

                if (response.Success)
                {
                    return new MCPQueryResult
                    {
                        Success = true,
                        Content = response.Content,
                        Metadata = response.Metadata
                    };
                }
                else
                {
                    return new MCPQueryResult
                    {
                        Success = false,
                        ErrorMessage = response.Error
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error en consulta MCP para ReportId: {request.ReportId}");
                return new MCPQueryResult
                {
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        public async Task<MCPHealth> HealthCheckAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("/api/mcp/health");

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var health = JsonSerializer.Deserialize<MCPHealth>(content);

                    return health ?? new MCPHealth
                    {
                        Healthy = false,
                        Message = "Respuesta inválida desde el servicio de salud."
                    };
                }
                else
                {
                    return new MCPHealth
                    {
                        Healthy = false,
                        Message = $"El servicio no está disponible. Código de estado: {response.StatusCode}"
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verificando health de MCP");

                return new MCPHealth
                {
                    Healthy = false,
                    Message = $"Excepción al contactar el servicio: {ex.Message}"
                };
            }
        }
    }
}