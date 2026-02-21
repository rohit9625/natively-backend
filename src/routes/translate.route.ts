import {Router} from "express";
import { translateController } from "../controllers/translate.controller.js";

const router = Router();

router.post("/translate", translateController);

export default router;