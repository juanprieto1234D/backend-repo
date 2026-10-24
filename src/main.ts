import express from "express";
import rutasTareas from "./infraestructura/http/rutasTareas";
import cors from "cors";
import dotenv from "dotenv";
import rutasAutenticacion from "./infraestructura/http/rutasAutenticacion";
import rutasAdmin from "./infraestructura/http/rutasAdmin";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import { sembrarAdminInicial } from "./infraestructura/seedAdmin";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.json({ message: "TaskUp backend funcionando" });
});

app.use("/auth", rutasAutenticacion);
app.use("/tareas", rutasTareas);
app.use("/admin", rutasAdmin);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  await sembrarAdminInicial();
});