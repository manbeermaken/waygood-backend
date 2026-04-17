import { Router } from "express";

import { listPopularUniversities, listUniversities } from "../controllers/universityController.js";

const router = Router();

router.get("/", listUniversities);
router.get("/popular", listPopularUniversities);

export default router;
