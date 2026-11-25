// Session Manager - Handles session operations and rendering

class SessionManager {
  constructor() {
    this.sessions = [];
    this.sortBy = 'date'; // 'date', 'name', 'tabCount'
    this.sortOrder = 'desc'; // 'asc', 'desc'
  }

  // Load sessions from storage
  async loadSessions() {
    try {
      const response = await sendMessage('getSessions');
      this.sessions = response.sessions || [];
      this.sortSessions();
      return this.sessions;
    } catch (error) {
      console.error('Error loading sessions:', error);
      throw error;
    }
  }

  // Save a new session
  async saveSession(name, tabs) {
    try {
      const response = await sendMessage('saveSession', { name, tabs });
      await this.loadSessions();
      this.renderSessions();
      return response.session;
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  }

  // Delete a session
  async deleteSession(sessionId) {
    try {
      await sendMessage('deleteSession', { sessionId });
      await this.loadSessions();
      this.renderSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  // Rename a session
  async renameSession(sessionId, newName) {
    try {
      // Update session name in storage
      const session = this.sessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error('Session bulunamadı');
      }

      session.name = newName;
      
      // Save updated sessions
      const storageManager = new StorageManager();
      await storageManager.saveSessions(this.sessions);
      
      this.renderSessions();
    } catch (error) {
      console.error('Error renaming session:', error);
      throw error;
    }
  }

  // Restore a session
  async restoreSession(sessionId, newWindow = false) {
    try {
      await sendMessage('restoreSession', { sessionId, newWindow });
    } catch (error) {
      console.error('Error restoring session:', error);
      throw error;
    }
  }

  // Sort sessions
  sortSessions() {
    this.sessions.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'tr');
          break;
        case 'tabCount':
          comparison = a.tabCount - b.tabCount;
          break;
        case 'date':
        default:
          comparison = a.createdAt - b.createdAt;
          break;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  // Change sort settings
  setSortBy(sortBy, sortOrder = null) {
    this.sortBy = sortBy;
    if (sortOrder) {
      this.sortOrder = sortOrder;
    }
    this.sortSessions();
    this.renderSessions();
  }

  // Render sessions in the UI
  renderSessions() {
    const container = document.getElementById('sessions-container');
    
    if (!container) {
      console.error('Sessions container not found');
      return;
    }

    // Clear container
    container.innerHTML = '';

    // Check if there are sessions
    if (this.sessions.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💾</div>
          <div class="empty-state-text">
            Henüz kaydedilmiş session yok.<br>
            Mevcut sekmelerinizi kaydetmek için 💾 butonuna tıklayın.
          </div>
        </div>
      `;
      return;
    }

    // Render each session
    this.sessions.forEach(session => {
      const sessionElement = this.createSessionElement(session);
      container.appendChild(sessionElement);
    });
  }

  // Create a session element
  createSessionElement(session) {
    const sessionItem = document.createElement('div');
    sessionItem.className = 'session-item';
    sessionItem.dataset.sessionId = session.id;

    // Session header
    const sessionHeader = document.createElement('div');
    sessionHeader.className = 'session-header';

    const sessionName = document.createElement('h3');
    sessionName.className = 'session-name';
    sessionName.textContent = session.name;

    const sessionDate = document.createElement('span');
    sessionDate.className = 'session-date';
    sessionDate.textContent = formatDate(session.createdAt);

    sessionHeader.appendChild(sessionName);
    sessionHeader.appendChild(sessionDate);

    // Session info
    const sessionInfo = document.createElement('div');
    sessionInfo.className = 'session-info';

    const tabCount = document.createElement('span');
    tabCount.className = 'session-tab-count';
    tabCount.textContent = `${session.tabCount} sekme`;

    sessionInfo.appendChild(tabCount);

    // Session actions
    const sessionActions = document.createElement('div');
    sessionActions.className = 'session-actions';

    // Restore button
    const restoreBtn = document.createElement('button');
    restoreBtn.className = 'btn-secondary session-restore';
    restoreBtn.textContent = 'Geri Yükle';
    restoreBtn.addEventListener('click', async () => {
      try {
        await this.restoreSession(session.id, false);
        if (window.uiController) {
          window.uiController.showNotification('Session geri yüklendi', 'success');
        }
      } catch (error) {
        if (window.uiController) {
          window.uiController.showNotification('Session geri yüklenemedi', 'error');
        }
      }
    });

    // Restore in new window button
    const restoreNewBtn = document.createElement('button');
    restoreNewBtn.className = 'btn-secondary session-restore-new';
    restoreNewBtn.textContent = 'Yeni Pencerede Aç';
    restoreNewBtn.addEventListener('click', async () => {
      try {
        await this.restoreSession(session.id, true);
        if (window.uiController) {
          window.uiController.showNotification('Session yeni pencerede açıldı', 'success');
        }
      } catch (error) {
        if (window.uiController) {
          window.uiController.showNotification('Session açılamadı', 'error');
        }
      }
    });

    // Rename button
    const renameBtn = document.createElement('button');
    renameBtn.className = 'btn-icon session-rename';
    renameBtn.title = 'Yeniden Adlandır';
    renameBtn.textContent = '✏️';
    renameBtn.addEventListener('click', () => {
      if (window.uiController) {
        window.uiController.showRenameSessionModal(session);
      }
    });

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-icon session-delete';
    deleteBtn.title = 'Sil';
    deleteBtn.textContent = '🗑️';
    deleteBtn.addEventListener('click', () => {
      if (window.uiController) {
        window.uiController.showDeleteSessionModal(session);
      }
    });

    sessionActions.appendChild(restoreBtn);
    sessionActions.appendChild(restoreNewBtn);
    sessionActions.appendChild(renameBtn);
    sessionActions.appendChild(deleteBtn);

    // Assemble
    sessionItem.appendChild(sessionHeader);
    sessionItem.appendChild(sessionInfo);
    sessionItem.appendChild(sessionActions);

    return sessionItem;
  }

  // Get session by ID
  getSessionById(sessionId) {
    return this.sessions.find(s => s.id === sessionId);
  }
}
