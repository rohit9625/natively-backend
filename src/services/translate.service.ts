import { Queue } from "bullmq";
import "dotenv/config";
import {LingoDotDevEngine} from "lingo.dev/sdk";
import redisConnection from "../config/redis.js";

const apiKey = process.env.LINGODOTDEV_API_KEY;
if (!apiKey) {
  throw new Error("LINGODOTDEV_API_KEY is missing");
}

const lingo = new LingoDotDevEngine({ apiKey });
const TRANSLATION_JOB_QUEUE = "translations";

export const translationQueue = new Queue(
  TRANSLATION_JOB_QUEUE,
  { connection: redisConnection }
);

export interface TranslateOptions {
  sourceLocale: string | null;
  targetLocale: string;
  fast?: boolean;
}

/**
 * Translates text using lingodotdev
 *
 * @returns Translated text string
 * @throws Error when translation fails
 */
export async function translateText(
  text: string,
  { sourceLocale, targetLocale, fast = false }: TranslateOptions
): Promise<string> {
  try {
    const result = await lingo.localizeText(text, {
      sourceLocale,
      targetLocale,
      fast,
    });

    if (typeof result !== "string") {
      throw new Error("Invalid translation response");
    }

    return result;
  } catch (err: any) {
    console.error("[translateText] Trasnlation failed:", err?.messsage ?? "UNKNOWN_ERROR");
    throw new Error("Translation failed");
  }
}
