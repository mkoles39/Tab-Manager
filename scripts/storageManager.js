// Thin promise wrapper around chrome.storage.local
const StorageManager = {
  async get(key, fallback = null) {
    const res = await chrome.storage.local.get([key]);
    return res[key] === undefined ? fallback : res[key];
  },
  async set(key, value) {
    await chrome.storage.local.set({ [key]: value });
  },
  async remove(key) {
    await chrome.storage.local.remove(key);
  }
};
