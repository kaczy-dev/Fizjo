import { useState, useEffect, useCallback } from 'react';
import { Exercise } from '../types';
import {
  getCachedExerciseEntries,
  cacheExerciseInPWA,
  removeExerciseFromPWACache,
  cacheAllExercisesInPWA,
  clearAllPWACache,
  PWA_CACHE_EVENT,
  PWA_CACHE_META_KEY,
  ExerciseCacheEntry,
  ExerciseCacheMeta
} from '../services/exerciseCacheService';

export function useExerciseCache() {
  const [entries, setEntries] = useState<Record<string, ExerciseCacheEntry>>(() => getCachedExerciseEntries());
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; isRunning: boolean }>({
    current: 0,
    total: 0,
    isRunning: false
  });

  const refreshEntries = useCallback(() => {
    setEntries(getCachedExerciseEntries());
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === PWA_CACHE_META_KEY) {
        refreshEntries();
      }
    };

    const handleCustom = () => {
      refreshEntries();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(PWA_CACHE_EVENT, handleCustom);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(PWA_CACHE_EVENT, handleCustom);
    };
  }, [refreshEntries]);

  const isCached = useCallback((exerciseId: string): boolean => {
    return Boolean(entries[exerciseId]);
  }, [entries]);

  const isDownloading = useCallback((exerciseId: string): boolean => {
    return downloadingIds.has(exerciseId);
  }, [downloadingIds]);

  const cacheExercise = useCallback(async (exercise: Exercise) => {
    setDownloadingIds(prev => new Set(prev).add(exercise.id));
    try {
      // Simulate visual feedback time for user to see downloading status
      await new Promise(r => setTimeout(r, 450));
      await cacheExerciseInPWA(exercise);
      refreshEntries();
    } finally {
      setDownloadingIds(prev => {
        const next = new Set(prev);
        next.delete(exercise.id);
        return next;
      });
    }
  }, [refreshEntries]);

  const removeExercise = useCallback(async (exerciseId: string) => {
    await removeExerciseFromPWACache(exerciseId);
    refreshEntries();
  }, [refreshEntries]);

  const cacheAll = useCallback(async (exercises: Exercise[]) => {
    setBulkProgress({ current: 0, total: exercises.length, isRunning: true });
    try {
      await cacheAllExercisesInPWA(exercises, (completed, total) => {
        setBulkProgress({ current: completed, total, isRunning: true });
      });
      refreshEntries();
    } finally {
      setBulkProgress(prev => ({ ...prev, isRunning: false }));
    }
  }, [refreshEntries]);

  const clearCache = useCallback(async () => {
    await clearAllPWACache();
    refreshEntries();
  }, [refreshEntries]);

  const cachedCount = Object.keys(entries).length;

  return {
    entries,
    isCached,
    isDownloading,
    cacheExercise,
    removeExercise,
    cacheAll,
    clearCache,
    bulkProgress,
    cachedCount
  };
}
