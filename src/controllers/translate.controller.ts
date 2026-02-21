import type { Request, Response } from "express";
import { translateText } from "../services/translate.service.js";

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
    const { text, sourceLanguage = null, targetLanguage } = req.body as {
      text?: string,
      sourceLanguage?: string,
      targetLanguage?: string,
    };

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
