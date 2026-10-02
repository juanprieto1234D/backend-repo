// rutasAutenticacion.ts
import { Router } from "express";
import { registrar, login } from "./controladorAutenticacion";

const router = Router();

router.post("/register", registrar); // antes: "/registro"
router.post("/login", login);

export default router;