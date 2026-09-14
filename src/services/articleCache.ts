import { KnowledgeArticle } from '../types';

const ARTICLES_CACHE_STORAGE_KEY = 'fizjo_rehab_cached_articles_v1';
const CACHE_METADATA_KEY = 'fizjo_rehab_articles_cache_meta_v1';

export interface CachedArticleEntry {
  article: KnowledgeArticle;
  cachedAt: string;
  source: 'first_open' | 'manual_preload';
}

export interface CacheMetadata {
  totalCached: number;
  lastUpdated: string;
  cachedArticleIds: string[];
}

/**
 * Retrieves all currently cached articles from localStorage.
 */
export function getCachedArticles(): Record<string, CachedArticleEntry> {
  try {
    const raw = localStorage.getItem(ARTICLES_CACHE_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[ArticleCache] Error reading cached articles from storage:', err);
    return {};
  }
}

/**
 * Checks if a specific article is already cached offline.
 */
export function isArticleCached(articleId: string): boolean {
  try {
    const cached = getCachedArticles();
    return Boolean(cached[articleId]);
  } catch {
    return false;
  }
}

/**
 * Gets a single cached article by ID if available.
 */
export function getCachedArticleById(articleId: string): KnowledgeArticle | null {
  try {
    const cached = getCachedArticles();
    return cached[articleId]?.article || null;
  } catch {
    return null;
  }
}

/**
 * Caches an individual article when opened by the user ("przy pierwszym otwarciu").
 * If the article is already in the cache, it retains the existing cache or refreshes timestamp.
 * Returns true if newly cached or updated.
 */
export function cacheArticleOnOpen(article: KnowledgeArticle): boolean {
  try {
    const cached = getCachedArticles();
    const isNew = !cached[article.id];

    cached[article.id] = {
      article,
      cachedAt: new Date().toISOString(),
      source: 'first_open'
    };

    localStorage.setItem(ARTICLES_CACHE_STORAGE_KEY, JSON.stringify(cached));

    const meta: CacheMetadata = {
      totalCached: Object.keys(cached).length,
      lastUpdated: new Date().toISOString(),
      cachedArticleIds: Object.keys(cached)
    };
    localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(meta));

    return isNew;
  } catch (err) {
    console.warn('[ArticleCache] Failed to cache article on open:', err);
    return false;
  }
}

/**
 * Pre-caches all articles for instant full offline readiness.
 */
export function cacheAllArticles(articles: KnowledgeArticle[]): number {
  try {
    const cached = getCachedArticles();
    let newlyCachedCount = 0;
    const now = new Date().toISOString();

    for (const art of articles) {
      if (!cached[art.id]) {
        newlyCachedCount++;
      }
      cached[art.id] = {
        article: art,
        cachedAt: now,
        source: 'manual_preload'
      };
    }

    localStorage.setItem(ARTICLES_CACHE_STORAGE_KEY, JSON.stringify(cached));

    const meta: CacheMetadata = {
      totalCached: Object.keys(cached).length,
      lastUpdated: now,
      cachedArticleIds: Object.keys(cached)
    };
    localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(meta));

    return newlyCachedCount;
  } catch (err) {
    console.warn('[ArticleCache] Failed to preload all articles into cache:', err);
    return 0;
  }
}

/**
 * Clears the article offline cache.
 */
export function clearArticleCache(): void {
  try {
    localStorage.removeItem(ARTICLES_CACHE_STORAGE_KEY);
    localStorage.removeItem(CACHE_METADATA_KEY);
  } catch (err) {
    console.warn('[ArticleCache] Failed to clear cache:', err);
  }
}

/**
 * Gets list of cached article IDs.
 */
export function getCachedArticleIds(): string[] {
  try {
    const cached = getCachedArticles();
    return Object.keys(cached);
  } catch {
    return [];
  }
}
