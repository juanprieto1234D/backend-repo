import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rutasAutenticacion from "./infraestructura/http/rutasAutenticacion";
import rutasTareas from "./infraestructura/http/rutasTareas";
import swaggerUi from "swagger-ui-express";
import { cargarDocumentoOpenApi } from "./infraestructura/documentacion/swagger";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(cargarDocumentoOpenApi())); // ← aquí, después de crear app

app.get("/", (req, res) => {
  res.json({ message: "TaskUp backend funcionando" });
});

app.use("/api/auth", rutasAutenticacion);
app.use("/api/tareas", rutasTareas);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});