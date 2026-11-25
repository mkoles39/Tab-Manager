// Storage Manager - Handles Chrome Storage API operations

class StorageManager {
  constructor() {
    this.STORAGE_KEYS = {
      SESSIONS: 'sessions',
      SETTINGS: 'settings'
    };
    
    this.DEFAULT_SETTINGS = {
      themeChoice: 'system',
      density: 'compact',
      defaultView: 'tabs',
      confirmBeforeClose: true,
      autoSaveSession: false
    };
  }

  // Session Management
  async saveSessions(sessions) {
    try {
      await chrome.storage.local.set({ [this.STORAGE_KEYS.SESSIONS]: sessions });
      return { success: true };
    } catch (error) {
      console.error('Error saving sessions:', error);
      throw new Error('Depolama alanına yazılamadı');
    }
  }

  async getSessions() {
    try {
      const result = await chrome.storage.local.get([this.STORAGE_KEYS.SESSIONS]);
      return result[this.STORAGE_KEYS.SESSIONS] || [];
    } catch (error) {
      console.error('Error getting sessions:', error);
      throw new Error('Depolama alanından okunamadı');
    }
  }

  async addSession(session) {
    try {
      const sessions = await this.getSessions();
      sessions.push(session);
      await this.saveSessions(sessions);
      return { success: true, session };
    } catch (error) {
      console.error('Error adding session:', error);
      throw error;
    }
  }

  async updateSession(sessionId, updates) {
    try {
      const sessions = await this.getSessions();
      const index = sessions.findIndex(s => s.id === sessionId);
      
      if (index === -1) {
        throw new Error('Session bulunamadı');
      }
      
      sessions[index] = { ...sessions[index], ...updates };
      await this.saveSessions(sessions);
      return { success: true, session: sessions[index] };
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }

  async deleteSession(sessionId) {
    try {
      const sessions = await this.getSessions();
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      await this.saveSessions(filteredSessions);
      return { success: true };
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  // Settings Management
  async getSettings() {
    try {
      const result = await chrome.storage.local.get([this.STORAGE_KEYS.SETTINGS]);
      return { ...this.DEFAULT_SETTINGS, ...result[this.STORAGE_KEYS.SETTINGS] };
    } catch (error) {
      console.error('Error getting settings:', error);
      return this.DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings) {
    try {
      await chrome.storage.local.set({ [this.STORAGE_KEYS.SETTINGS]: settings });
      return { success: true };
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Ayarlar kaydedilemedi');
    }
  }

  async updateSetting(key, value) {
    try {
      const settings = await this.getSettings();
      settings[key] = value;
      await this.saveSettings(settings);
      return { success: true };
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  }

  // Storage Info
  async getStorageInfo() {
    try {
      const bytesInUse = await chrome.storage.local.getBytesInUse();
      const quota = chrome.storage.local.QUOTA_BYTES || 5242880; // 5MB default
      
      return {
        bytesInUse,
        quota,
        percentUsed: (bytesInUse / quota) * 100,
        available: quota - bytesInUse
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }

  // Check if storage quota is exceeded
  async checkQuota() {
    const info = await this.getStorageInfo();
    if (!info) return true;
    
    if (info.percentUsed > 90) {
      console.warn('Storage quota nearly exceeded:', info.percentUsed + '%');
      return false;
    }
    
    return true;
  }

  // Clear all data (use with caution)
  async clearAllData() {
    try {
      await chrome.storage.local.clear();
      return { success: true };
    } catch (error) {
      console.error('Error clearing data:', error);
      throw new Error('Veriler temizlenemedi');
    }
  }

  // Export data
  async exportData() {
    try {
      const sessions = await this.getSessions();
      const settings = await this.getSettings();
      
      return {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        sessions,
        settings
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Veriler dışa aktarılamadı');
    }
  }

  // Import data
  async importData(data) {
    try {
      if (!data || !data.version) {
        throw new Error('Geçersiz veri formatı');
      }
      
      if (data.sessions) {
        await this.saveSessions(data.sessions);
      }
      
      if (data.settings) {
        await this.saveSettings(data.settings);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Veriler içe aktarılamadı');
    }
  }
}
