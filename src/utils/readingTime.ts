import { KnowledgeArticle } from '../types';

/**
 * Average adult reading speed:
 * Standard publishing platforms (Medium, dev.to, Wikipedia) use ~200-220 words per minute.
 * For educational and clinical texts with anatomical terms, 180-200 WPM is ideal.
 */
export const DEFAULT_WORDS_PER_MINUTE = 200;

export interface ReadingTimeInfo {
  /** Estimated reading time in minutes (minimum 1 minute) */
  minutes: number;
  /** Exact total word count across all article textual sections */
  wordCount: number;
  /** Word count of the primary content paragraphs */
  contentWordCount: number;
  /** Formatted indicator string matching user request, e.g. '3 min read' */
  displayText: string;
  /** Localized Polish indicator string, e.g. '3 min czytania' */
  polishText: string;
}

/**
 * Counts whitespace-delimited words in a string or string array.
 */
export function countWords(input: string | string[] | undefined | null): number {
  if (!input) return 0;
  const rawText = Array.isArray(input) ? input.join(' ') : input;
  const trimmed = rawText.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter((token) => token.length > 0).length;
}

/**
 * Calculates estimated reading time indicator based on word count of the article content.
 *
 * @param article The article object containing content paragraphs and optional supplementary text.
 * @param wordsPerMinute Reading pace in words per minute (defaults to 200).
 */
export function calculateReadingTime(
  article: Pick<KnowledgeArticle, 'content'> &
    Partial<Pick<KnowledgeArticle, 'summary' | 'keyTakeaways' | 'practicalTips' | 'title' | 'subtitle'>>,
  wordsPerMinute: number = DEFAULT_WORDS_PER_MINUTE
): ReadingTimeInfo {
  const contentWordCount = countWords(article.content);
  const supplementaryWordCount = countWords([
    article.summary || '',
    article.title || '',
    article.subtitle || '',
    ...(article.keyTakeaways || []),
    ...(article.practicalTips || []),
  ]);

  const totalWordCount = contentWordCount + supplementaryWordCount;

  // Calculate estimated reading time, rounding up to nearest whole minute (at least 1 min)
  const minutes = Math.max(1, Math.ceil(totalWordCount / wordsPerMinute));

  return {
    minutes,
    wordCount: totalWordCount,
    contentWordCount,
    displayText: `${minutes} min read`,
    polishText: `${minutes} min czytania`,
  };
}

export const calculateArticleReadingTime = calculateReadingTime;

