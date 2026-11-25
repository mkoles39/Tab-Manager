// New Tab page script - initializes the UI Controller for full page view

document.addEventListener('DOMContentLoaded', () => {
  console.log('New Tab page loaded');

  // Initialize UI Controller
  const uiController = new UIController();
  uiController.init();
});
