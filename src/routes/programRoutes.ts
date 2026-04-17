import { Router } from "express";

import { listPrograms } from "../controllers/programController.js";

const router = Router();

router.get("/", listPrograms);

export default router;
