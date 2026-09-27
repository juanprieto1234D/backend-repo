import { Router } from "express";
import { crear, listar, actualizar, eliminar, completar } from "./controladorTareas";

const router = Router();

router.post("/", crear);
router.get("/:usuarioId", listar);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);
router.patch("/:id/completar", completar);

export default router;