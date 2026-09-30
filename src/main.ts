import express from "express";
import rutasTareas from "./infraestructura/http/rutasTareas";
import cors from "cors";
import dotenv from "dotenv";
import rutasAutenticacion from "./infraestructura/http/rutasAutenticacion";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});