// Chrome Tab Manager - Service Worker
// This file handles background tasks and Chrome API interactions

console.log('Tab Manager Service Worker initialized');

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Tab Manager installed');
});

// Message handler for communication with popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  
  // Handle different message types
  switch (request.action) {
    case 'getAllTabs':
      handleGetAllTabs(sendResponse);
      return true; // Keep channel open for async response
      
    case 'closeTab':
      handleCloseTab(request.tabId, sendResponse);
      return true;
      
    case 'closeTabs':
      handleCloseTabs(request.tabIds, sendResponse);
      return true;
      
    case 'goToTab':
      handleGoToTab(request.tabId, sendResponse);
      return true;
      
    case 'moveTab':
      handleMoveTab(request.tabId, request.windowId, sendResponse);
      return true;
      
    case 'createTabGroup':
      handleCreateTabGroup(request.tabIds, request.groupName, request.color, sendResponse);
      return true;
      
    case 'saveSession':
      handleSaveSession(request.name, request.tabs, sendResponse);
      return true;
      
    case 'getSessions':
      handleGetSessions(sendResponse);
      return true;
      
    case 'deleteSession':
      handleDeleteSession(request.sessionId, sendResponse);
      return true;
      
    case 'restoreSession':
      handleRestoreSession(request.sessionId, request.newWindow, sendResponse);
      return true;
      
    case 'getGroups':
      handleGetGroups(sendResponse);
      return true;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Tab Management Functions
async function handleGetAllTabs(sendResponse) {
  try {
    const tabs = await chrome.tabs.query({});
    sendResponse({ success: true, tabs });
  } catch (error) {
    console.error('Error getting tabs:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleCloseTab(tabId, sendResponse) {
  try {
    await chrome.tabs.remove(tabId);
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error closing tab:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleCloseTabs(tabIds, sendResponse) {
  try {
    await chrome.tabs.remove(tabIds);
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error closing tabs:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleGoToTab(tabId, sendResponse) {
  try {
    const tab = await chrome.tabs.get(tabId);
    await chrome.tabs.update(tabId, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error going to tab:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleMoveTab(tabId, windowId, sendResponse) {
  try {
    await chrome.tabs.move(tabId, { windowId, index: -1 });
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error moving tab:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleCreateTabGroup(tabIds, groupName, color, sendResponse) {
  try {
    const groupId = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(groupId, {
      title: groupName,
      color: color
    });
    sendResponse({ success: true, groupId });
  } catch (error) {
    console.error('Error creating tab group:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Session Management Functions
async function handleSaveSession(name, tabs, sendResponse) {
  try {
    const sessionId = generateUUID();
    const session = {
      id: sessionId,
      name: name,
      createdAt: Date.now(),
      tabs: tabs.map(tab => ({
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl
      })),
      tabCount: tabs.length
    };
    
    const result = await chrome.storage.local.get(['sessions']);
    const sessions = result.sessions || [];
    sessions.push(session);
    
    await chrome.storage.local.set({ sessions });
    sendResponse({ success: true, session });
  } catch (error) {
    console.error('Error saving session:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleGetSessions(sendResponse) {
  try {
    const result = await chrome.storage.local.get(['sessions']);
    const sessions = result.sessions || [];
    sendResponse({ success: true, sessions });
  } catch (error) {
    console.error('Error getting sessions:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleDeleteSession(sessionId, sendResponse) {
  try {
    const result = await chrome.storage.local.get(['sessions']);
    const sessions = result.sessions || [];
    const filteredSessions = sessions.filter(s => s.id !== sessionId);
    
    await chrome.storage.local.set({ sessions: filteredSessions });
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleRestoreSession(sessionId, newWindow, sendResponse) {
  try {
    const result = await chrome.storage.local.get(['sessions']);
    const sessions = result.sessions || [];
    const session = sessions.find(s => s.id === sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    if (newWindow) {
      const window = await chrome.windows.create({ url: session.tabs[0].url });
      for (let i = 1; i < session.tabs.length; i++) {
        await chrome.tabs.create({ windowId: window.id, url: session.tabs[i].url });
      }
    } else {
      for (const tab of session.tabs) {
        await chrome.tabs.create({ url: tab.url });
      }
    }
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error restoring session:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Group Management Functions
async function handleGetGroups(sendResponse) {
  try {
    const groups = await chrome.tabGroups.query({});
    sendResponse({ success: true, groups });
  } catch (error) {
    console.error('Error getting groups:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Utility Functions
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
