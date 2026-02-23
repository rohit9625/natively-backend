import type { Request, Response } from "express";
import { translateText, translationQueue } from "../services/translate.service.js";
import redis from "../config/redis.js";

interface RequestBody {
  text?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  fcmToken?: string;
}

interface TranslationData {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

/**
 * Controller to handle text translation requests
 *
 * Expected body:
 * {
 *   text: string;
 *   sourceLocale?: string | null;
 *   targetLocale: string;
 * }
 */
export async function translateController(
  req: Request,
  res: Response,
) {
  try {
    const { text, sourceLanguage = null, targetLanguage } = req.body as RequestBody;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Request body must include required fields",
        }
      });
    }

    const translatedText = await translateText(text, {
      sourceLocale: sourceLanguage,
      targetLocale: targetLanguage,
      fast: true,
    });

    return res.status(200).json({
      success: true,
      data: {
        originalText: text,
        translatedText,
        sourceLanguage,
        targetLanguage,
      },
    });
  } catch (error) {
    console.error("[translateController] Error translating text", error);

    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      }
    });
  }
}

export async function getTranslationForJob(
  req: Request,
  res: Response
) {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Missing Job Id",
        }
      });
    }

    const exists = await redis.exists(`translation:${jobId}`);

    if (!exists) {
      return res.status(202).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Translation not exists",
        },
      });
    }

    const result = await redis.get(`translation:${jobId}`);

    const data = JSON.parse(result!!) as TranslationData;

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    console.error("[triggerTranslationJob] Cannot start translation job", error);

    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      }
    });
  }
}

export async function triggerTranslationJob(
  req: Request,
  res: Response,
) {
  try {
    const { text, sourceLanguage = null, targetLanguage, fcmToken } = req.body as RequestBody;

    if (!text || !targetLanguage || !fcmToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Request body must include required fields",
        }
      });
    }

    const result = await translationQueue.add(
      "translate",
      {
        originalText: text,
        sourceLanguage,
        targetLanguage,
        fcmToken,
      },
      {
        removeOnComplete: true,
        attempts: 3,
      }
    );

    return res.status(201).json({
      success: true,
      data: {
        jobId: result.id,
        status: "QUEUED",
      }
    });
  } catch (error) {
    console.error("[triggerTranslationJob] Cannot start translation job", error);

    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      }
    });
  }
}
