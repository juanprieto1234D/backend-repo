import multer from "multer";
import path from "path";
import fs from "fs";

// Crear carpeta uploads en la raíz si no existe
const carpetaUploads = path.join(process.cwd(), "uploads");
if (!fs.existsSync(carpetaUploads)) {
  fs.mkdirSync(carpetaUploads, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, carpetaUploads);
  },
  filename: (_req, file, cb) => {
    // Genera un nombre seguro: 1712345678-nombre_archivo.pdf
    const ext = path.extname(file.originalname);
    const nombreBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    cb(null, `${Date.now()}-${nombreBase}${ext}`);
  },
});

export const subirArchivo = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // Máximo 15 MB por documento
});