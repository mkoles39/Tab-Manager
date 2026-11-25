// Main popup script - initializes the UI Controller

document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup loaded');
  
  // Initialize UI Controller
  const uiController = new UIController();
  uiController.init();
});
