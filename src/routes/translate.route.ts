import {Router} from "express";
import { getTranslationForJob, translateController, triggerTranslationJob } from "../controllers/translate.controller.js";

const router = Router();

router.post("/translate", translateController);
router.post("/translation/trigger", triggerTranslationJob);
router.get("/translation/:jobId", getTranslationForJob);

export default router;