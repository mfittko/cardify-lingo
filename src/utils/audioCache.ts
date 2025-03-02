// Audio cache utility for storing ElevenLabs responses locally

// Define the cache entry structure
interface AudioCacheEntry {
  blob: Blob;
  timestamp: number;
  expiresAt: number;
}

// Serialized blob for storage
interface SerializedBlob {
  data: string;
  type: string;
}

// Serialized cache entry for storage
interface SerializedCacheEntry {
  serializedBlob: SerializedBlob;
  timestamp: number;
  expiresAt: number;
}

// Cache configuration
const CACHE_CONFIG = {
  // Default expiration time: 30 days in milliseconds
  DEFAULT_EXPIRATION: 30 * 24 * 60 * 60 * 1000,
  // Maximum cache size in bytes (default: 50MB)
  MAX_CACHE_SIZE: 50 * 1024 * 1024,
  // Storage key for the cache
  STORAGE_KEY: 'elevenlabs_audio_cache',
  // Storage key for cache metadata
  METADATA_KEY: 'elevenlabs_audio_cache_metadata'
};

// Cache metadata to track size and usage
interface CacheMetadata {
  totalSize: number;
  lastCleanup: number;
}

// Initialize cache metadata
const initCacheMetadata = (): CacheMetadata => {
  try {
    const metadataJson = localStorage.getItem(CACHE_CONFIG.METADATA_KEY);
    if (metadataJson) {
      return JSON.parse(metadataJson);
    }
  } catch (error) {
    console.error('Error loading cache metadata:', error);
  }
  
  // Default metadata
  return {
    totalSize: 0,
    lastCleanup: Date.now()
  };
};

// Save cache metadata
const saveCacheMetadata = (metadata: CacheMetadata): void => {
  try {
    localStorage.setItem(CACHE_CONFIG.METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('Error saving cache metadata:', error);
  }
};

// Generate a cache key from the request parameters
export const generateCacheKey = (
  text: string,
  voiceId: string,
  modelId: string,
  language: string
): string => {
  // Create a deterministic key from the parameters
  return `${voiceId}:${modelId}:${language}:${text}`;
};

// Store audio in cache
export const cacheAudio = async (
  key: string,
  blob: Blob,
  expirationMs: number = CACHE_CONFIG.DEFAULT_EXPIRATION
): Promise<void> => {
  try {
    // Get current cache
    const cache = loadCache();
    const metadata = initCacheMetadata();
    
    // Create cache entry
    const entry: AudioCacheEntry = {
      blob,
      timestamp: Date.now(),
      expiresAt: Date.now() + expirationMs
    };
    
    // Update metadata with new blob size
    metadata.totalSize += blob.size;
    
    // Store in cache
    cache[key] = entry;
    
    // Check if we need to clean up the cache
    if (metadata.totalSize > CACHE_CONFIG.MAX_CACHE_SIZE) {
      cleanupCache(cache, metadata);
    }
    
    // Save cache and metadata
    await saveCacheWithBlobs(cache);
    saveCacheMetadata(metadata);
  } catch (error) {
    console.error('Error caching audio:', error);
  }
};

// Get audio from cache
export const getCachedAudio = (key: string): Blob | null => {
  try {
    const cache = loadCache();
    const entry = cache[key];
    
    // Check if entry exists and is not expired
    if (entry && entry.expiresAt > Date.now()) {
      return entry.blob;
    }
    
    // If expired, remove it
    if (entry) {
      delete cache[key];
      saveCacheWithBlobs(cache);
      
      // Update metadata
      const metadata = initCacheMetadata();
      metadata.totalSize -= entry.blob.size;
      saveCacheMetadata(metadata);
    }
  } catch (error) {
    console.error('Error retrieving cached audio:', error);
  }
  
  return null;
};

// Convert a Blob to a base64 string
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Load the cache from localStorage
const loadCache = (): Record<string, AudioCacheEntry> => {
  try {
    const cacheJson = localStorage.getItem(CACHE_CONFIG.STORAGE_KEY);
    if (cacheJson) {
      const parsedCache = JSON.parse(cacheJson);
      const cache: Record<string, AudioCacheEntry> = {};
      
      // Convert stored data back to Blobs
      Object.keys(parsedCache).forEach(key => {
        const entry = parsedCache[key];
        if (entry && entry.serializedBlob) {
          // Convert serialized blob back to Blob
          const serializedBlob = entry.serializedBlob as SerializedBlob;
          const base64Data = serializedBlob.data;
          
          // Extract the base64 data (remove the data URL prefix)
          const base64Content = base64Data.split(',')[1];
          const byteCharacters = atob(base64Content);
          const byteArrays = [];
          
          for (let i = 0; i < byteCharacters.length; i++) {
            byteArrays.push(byteCharacters.charCodeAt(i));
          }
          
          const byteArray = new Uint8Array(byteArrays);
          const blob = new Blob([byteArray], { type: serializedBlob.type });
          
          cache[key] = {
            blob,
            timestamp: entry.timestamp,
            expiresAt: entry.expiresAt
          };
        }
      });
      
      return cache;
    }
  } catch (error) {
    console.error('Error loading audio cache:', error);
  }
  
  return {};
};

// Save the cache to localStorage with serialized blobs
const saveCacheWithBlobs = async (cache: Record<string, AudioCacheEntry>): Promise<void> => {
  try {
    // Create a serializable version of the cache
    const serializableCache: Record<string, SerializedCacheEntry> = {};
    
    // Process each entry
    for (const key of Object.keys(cache)) {
      const entry = cache[key];
      const base64Data = await blobToBase64(entry.blob);
      
      serializableCache[key] = {
        serializedBlob: {
          data: base64Data,
          type: entry.blob.type
        },
        timestamp: entry.timestamp,
        expiresAt: entry.expiresAt
      };
    }
    
    localStorage.setItem(CACHE_CONFIG.STORAGE_KEY, JSON.stringify(serializableCache));
  } catch (error) {
    console.error('Error saving audio cache:', error);
  }
};

// Clean up the cache by removing oldest entries first
const cleanupCache = (
  cache: Record<string, AudioCacheEntry>,
  metadata: CacheMetadata
): void => {
  try {
    // Sort entries by timestamp (oldest first)
    const entries = Object.entries(cache).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );
    
    // Remove oldest entries until we're under the size limit
    while (metadata.totalSize > CACHE_CONFIG.MAX_CACHE_SIZE && entries.length > 0) {
      const [key, entry] = entries.shift()!;
      metadata.totalSize -= entry.blob.size;
      delete cache[key];
    }
    
    metadata.lastCleanup = Date.now();
  } catch (error) {
    console.error('Error cleaning up cache:', error);
  }
};

// Clear the entire cache
export const clearAudioCache = (): void => {
  try {
    localStorage.removeItem(CACHE_CONFIG.STORAGE_KEY);
    
    // Reset metadata
    saveCacheMetadata({
      totalSize: 0,
      lastCleanup: Date.now()
    });
  } catch (error) {
    console.error('Error clearing audio cache:', error);
  }
};

// Get cache statistics
export const getAudioCacheStats = (): {
  entryCount: number;
  totalSize: number;
  oldestEntry: number | null;
} => {
  try {
    const cache = loadCache();
    const metadata = initCacheMetadata();
    const entries = Object.values(cache);
    
    let oldestTimestamp = null;
    if (entries.length > 0) {
      oldestTimestamp = Math.min(...entries.map(entry => entry.timestamp));
    }
    
    return {
      entryCount: entries.length,
      totalSize: metadata.totalSize,
      oldestEntry: oldestTimestamp
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      entryCount: 0,
      totalSize: 0,
      oldestEntry: null
    };
  }
}; 