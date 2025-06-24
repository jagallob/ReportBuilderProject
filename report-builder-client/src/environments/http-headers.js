// src/environments/http-headers.js
// Configuración centralizada de headers HTTP comunes

export const JSON_HEADERS = {
  "Content-Type": "application/json; charset=UTF-8",
  Accept: "application/json",
};

export const FORM_HEADERS = {
  // Para FormData, normalmente no se debe establecer Content-Type manualmente
  Accept: "application/json",
};
