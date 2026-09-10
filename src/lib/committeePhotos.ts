import defaultBundledPhotos from '../data/committeePhotosCustom.json';

// Store and retrieve custom uploaded photos for committee members
const STORAGE_KEY = 'mvy_committee_photos_custom_2026';

export function getCustomPhoto(memberId: string): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const map = JSON.parse(raw);
      if (map[memberId]) return map[memberId];
    }
  } catch {
    // fallback to bundled
  }

  // Fallback to permanently bundled photos in website project
  const bundled = defaultBundledPhotos as Record<string, string>;
  return bundled[memberId] || null;
}

export function getAllCustomPhotos(): Record<string, string> {
  const merged: Record<string, string> = { ...(defaultBundledPhotos as Record<string, string>) };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const localMap = JSON.parse(raw);
      Object.assign(merged, localMap);
    }
  } catch {
    // ignore
  }

  return merged;
}

/**
 * Saves photo locally and permanently sends to project files (/public/committee-photos and committeePhotosCustom.json)
 */
export async function saveCustomPhoto(memberId: string, dataUrl: string): Promise<boolean> {
  try {
    // 1. Save to local storage for immediate UI update
    const current = getAllCustomPhotos();
    current[memberId] = dataUrl;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('committee-photo-updated', { detail: { memberId, dataUrl } }));

    // 2. Persist permanently to project directory for website publish
    try {
      const res = await fetch('/api/committee/save-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, dataUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          current[memberId] = data.url;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
          window.dispatchEvent(new CustomEvent('committee-photo-updated', { detail: { memberId, dataUrl: data.url } }));
        }
        return true;
      }
    } catch {
      // Offline / Static mode fallback
    }

    return true;
  } catch (err) {
    console.error('Failed to save committee photo:', err);
    return false;
  }
}

/**
 * Removes photo locally and from server project files
 */
export async function removeCustomPhoto(memberId: string): Promise<void> {
  try {
    const current = getAllCustomPhotos();
    delete current[memberId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('committee-photo-updated', { detail: { memberId } }));

    try {
      await fetch('/api/committee/remove-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });
    } catch {
      // ignore
    }
  } catch (err) {
    console.error('Failed to remove committee photo:', err);
  }
}

/**
 * Syncs all current localStorage photos into the project filesystem
 * so that when the user publishes, all images are preserved permanently.
 */
export async function syncAllToProjectDisk(): Promise<{ success: boolean; count: number }> {
  try {
    const photos = getAllCustomPhotos();
    if (Object.keys(photos).length === 0) return { success: true, count: 0 };

    const res = await fetch('/api/committee/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, count: data.count || Object.keys(photos).length };
    }
  } catch (e) {
    console.warn('API sync not available:', e);
  }
  return { success: false, count: 0 };
}

/**
 * Checks server for previously saved images and merges them
 */
export async function fetchAndMergeServerPhotos(): Promise<Record<string, string>> {
  try {
    const res = await fetch('/api/committee/photos');
    if (res.ok) {
      const data = await res.json();
      if (data.photos && typeof data.photos === 'object') {
        const merged = { ...getAllCustomPhotos(), ...data.photos };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('committee-photo-updated', { detail: { all: true } }));
        return merged;
      }
    }
  } catch {
    // ignore
  }
  return getAllCustomPhotos();
}

/**
 * Resizes and compresses an image file to a data URL
 */
export async function fileToOptimizedDataUrl(file: File, maxWidth = 800, maxHeight = 1000, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
