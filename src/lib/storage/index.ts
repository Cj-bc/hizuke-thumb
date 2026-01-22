// IndexedDB exports
export { db, generateId } from './indexeddb';

// Preset operations
export {
  savePreset,
  getPreset,
  getAllPresets,
  deletePreset,
  duplicatePreset,
  getDefaultPreset,
  setDefaultPreset,
  createNewPreset,
  updatePresetLayers,
  updatePresetName,
  updatePresetThumbnail,
} from './presets';

// Asset operations
export {
  // Images
  saveImage,
  getImage,
  deleteImage,
  getImageUrl,
  loadImageElement,
  uploadImage,
  getImageDimensions,
  // Fonts
  saveFont,
  getFont,
  getAllFonts,
  deleteFont,
  registerFont,
  uploadFont,
  registerFontsForPreset,
  // Settings
  saveSetting,
  getSetting,
  deleteSetting,
} from './assets';
