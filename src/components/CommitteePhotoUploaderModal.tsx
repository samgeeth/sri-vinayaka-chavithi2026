import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Camera,
  Upload,
  CheckCircle2,
  Trash2,
  Sparkles,
  Info,
  Save,
  Download,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { COMMITTEE_MEMBERS } from '../data/mockData';
import {
  getAllCustomPhotos,
  saveCustomPhoto,
  removeCustomPhoto,
  fileToOptimizedDataUrl,
  syncAllToProjectDisk,
  fetchAndMergeServerPhotos,
} from '../lib/committeePhotos';

interface CommitteePhotoUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMemberId?: string | null;
}

// Lineup visual hints based on user's uploaded WhatsApp images
const PHOTO_HINTS: Record<string, string> = {
  c1: 'Grey/Charcoal long-sleeve shirt, red tilak, standing at temple doorway',
  c2: 'Black striped collared shirt, red tilak, temple background',
  c3: 'Sunglasses, white/grey plaid shirt, garden & lush plants',
  c4: 'Sunglasses, black sport zip jacket, sunroof of car',
  c5: 'Bright sky-blue shirt, hands in pockets, twilight sky',
  c6: 'Black t-shirt with "I DON\'T SLEEP", sunset highway background',
  c7: 'White cap, beige polo, black sports bike in palm field',
  c8: 'Green hoodie, earbud, seated on black scooter, pink flowers',
  c9: 'Plaid shirt, white pants, seated on KTM bike by bridge',
  c10: 'Clear transparent glasses, full beard, festival lights',
  c11: 'Maroon check shirt, gold chain, terrace with blue roof & hills',
};

export const CommitteePhotoUploaderModal: React.FC<CommitteePhotoUploaderModalProps> = ({
  isOpen,
  onClose,
  targetMemberId,
}) => {
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>({});
  const [loadingMemberId, setLoadingMemberId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // First load local photos
      setCustomPhotos(getAllCustomPhotos());
      // Then merge from server disk and sync any local photos to project directory
      fetchAndMergeServerPhotos().then((photos) => {
        setCustomPhotos(photos);
        syncAllToProjectDisk();
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (memberId: string, file: File) => {
    try {
      setLoadingMemberId(memberId);
      const dataUrl = await fileToOptimizedDataUrl(file, 800, 1000, 0.88);
      await saveCustomPhoto(memberId, dataUrl);
      setCustomPhotos((prev) => ({ ...prev, [memberId]: dataUrl }));
      const member = COMMITTEE_MEMBERS.find((m) => m.id === memberId);
      setStatusMessage(`Photo for ${member?.name || 'member'} saved permanently into project build!`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Error optimizing photo:', err);
    } finally {
      setLoadingMemberId(null);
    }
  };

  const handleRemovePhoto = async (memberId: string) => {
    await removeCustomPhoto(memberId);
    setCustomPhotos((prev) => {
      const next = { ...prev };
      delete next[memberId];
      return next;
    });
    setStatusMessage('Custom photo removed and restored to default.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    const result = await syncAllToProjectDisk();
    setIsSyncing(false);
    setStatusMessage(`Saved permanently! ${result.count} committee photo(s) are stored in website build & ready for publishing.`);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleExportBackup = () => {
    const photos = getAllCustomPhotos();
    const blob = new Blob([JSON.stringify(photos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maraigudem-committee-photos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Backup JSON exported successfully!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const raw = e.target?.result as string;
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object') {
          for (const [id, url] of Object.entries(parsed)) {
            await saveCustomPhoto(id, url as string);
          }
          await syncAllToProjectDisk();
          setCustomPhotos(getAllCustomPhotos());
          setStatusMessage('Backup restored and saved permanently into project build!');
          setTimeout(() => setStatusMessage(null), 4000);
        }
      } catch {
        setStatusMessage('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0f0f0f] border border-[#FFD700]/30 rounded-3xl shadow-2xl overflow-hidden text-white"
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#181818] to-[#111111]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center text-black font-bold shadow-lg">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <span>Committee Photo Lineup Manager</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30">
                    11 Leaders
                  </span>
                </h3>
                <p className="text-xs text-gray-400 font-sans">
                  Photos are automatically stored in the website build (<code className="text-[#FFD700] font-mono">/public/committee-photos</code>) so they remain permanently visible when published.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toast Alert */}
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </motion.div>
          )}

          {/* Quick Info & Action Bar */}
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-[#161616] border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-white">Publish Ready:</strong> Uploaded images are permanently saved into the project and stay visible after publishing.
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#FFD700]/15 hover:bg-[#FFD700]/25 text-[#FFD700] border border-[#FFD700]/30 transition-all cursor-pointer"
                title="Saves all committee photos directly to the website repository for publishing"
              >
                {isSyncing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                <span>{isSyncing ? 'Saving...' : 'Save Permanently to Website'}</span>
              </button>

              <button
                onClick={handleExportBackup}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all cursor-pointer"
                title="Download a backup copy of all photos"
              >
                <Download className="w-3 h-3" />
                <span>Backup JSON</span>
              </button>

              <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImportBackup(f);
                  }}
                />
                <span>Restore Backup</span>
              </label>

              <span className="text-gray-500 pl-2">
                <span className="font-bold text-[#FFD700]">{Object.keys(customPhotos).length}</span> / {COMMITTEE_MEMBERS.length}
              </span>
            </div>
          </div>

          {/* Member Photo List */}
          <div className="p-6 overflow-y-auto flex-1 space-y-3.5">
            {COMMITTEE_MEMBERS.map((member, idx) => {
              const hasCustom = !!customPhotos[member.id];
              const displayImage = customPhotos[member.id] || member.image;
              const isTarget = targetMemberId === member.id;
              const isLoading = loadingMemberId === member.id;
              const visualHint = PHOTO_HINTS[member.id];

              return (
                <div
                  key={member.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isTarget
                      ? 'bg-[#1e1905] border-[#FFD700]'
                      : hasCustom
                      ? 'bg-[#151515] border-emerald-500/30'
                      : 'bg-[#121212] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Thumbnail */}
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#1f1f1f] border border-white/15 shrink-0 shadow-md">
                      <img
                        src={displayImage}
                        alt={member.name}
                        className="w-full h-full object-cover object-top"
                      />
                      {hasCustom && (
                        <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-5 h-5 rounded-full bg-white/10 text-gray-300 text-[11px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-display font-bold text-white text-sm sm:text-base truncate">
                          {member.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFD700] text-black">
                          {member.role}
                        </span>
                      </div>

                      {visualHint && (
                        <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#FFA500] shrink-0" />
                          <span className="truncate">{visualHint}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Upload / Revert Controls */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <label className="relative cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={isLoading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(member.id, file);
                        }}
                      />
                      <span
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                          hasCustom
                            ? 'bg-white/10 hover:bg-white/20 text-white'
                            : 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black hover:opacity-90'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isLoading ? 'Uploading...' : hasCustom ? 'Replace Photo' : 'Upload Photo'}</span>
                      </span>
                    </label>

                    {hasCustom && (
                      <button
                        onClick={() => handleRemovePhoto(member.id)}
                        title="Revert to default"
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-[#111111] flex items-center justify-between">
            <div className="text-xs text-gray-400 font-sans">
              All 11 committee leaders configured in exact requested lineup.
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
