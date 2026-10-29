// src/infraestructura/documentacion/swagger.ts
import fs from "fs";
import path from "path";
import YAML from "yaml"; // npm i yaml

export function cargarDocumentoOpenApi() {
  const ruta = path.join(__dirname, "../../../openapi.yaml");
  const contenido = fs.readFileSync(ruta, "utf8");
  return YAML.parse(contenido);
}
