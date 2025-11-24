// Basic JavaScript example for AppDev Design Mode plugin
console.log('AppDev Design Mode Plugin - Basic Example Loaded');

// Sample data for the application
const sampleData = {
  features: [
    'No framework required',
    'Works with vanilla HTML',
    'Automatic source mapping',
    'Lightweight and fast',
  ],
  actions: {
    primary: 'Primary action triggered',
    secondary: 'Secondary action triggered',
    danger: 'Danger action triggered',
  },
};

// Interactive functionality
function initializeApp() {
  console.log('Initializing basic app...');

  // Add event listeners to buttons
  const buttons = document.querySelectorAll('[data-appdev-action]');
  buttons.forEach(button => {
    button.addEventListener('click', handleButtonClick);
  });

  // Add click handlers to list items
  const listItems = document.querySelectorAll('[data-appdev-item]');
  listItems.forEach((item, index) => {
    item.addEventListener('click', () => handleListItemClick(item, index));
  });

  // Simulate dynamic content addition
  addDynamicContent();
}

function handleButtonClick(event) {
  const action = event.target.getAttribute('data-appdev-action');
  const message = sampleData.actions[action] || 'Unknown action';

  console.log(`Button clicked: ${action}`);

  // Visual feedback
  event.target.style.background = '#48bb78';
  setTimeout(() => {
    event.target.style.background = '#4299e1';
  }, 200);

  showNotification(message);
}

function handleListItemClick(item, index) {
  console.log(`List item clicked: ${item.textContent}`);

  // Visual feedback
  item.style.background = '#e6fffa';
  setTimeout(() => {
    item.style.background = '';
  }, 300);

  showNotification(`Clicked: ${item.textContent}`);
}

function addDynamicContent() {
  const contentSection = document.querySelector(
    '[data-appdev-component="content-section"]'
  );
  if (!contentSection) return;

  const dynamicDiv = document.createElement('div');
  dynamicDiv.setAttribute('data-appdev-component', 'dynamic-content');
  dynamicDiv.setAttribute('data-dynamic', 'true');
  dynamicDiv.innerHTML = `
    <h4 data-appdev-element="dynamic-title">Dynamically Added Content</h4>
    <p data-appdev-element="dynamic-description">
      This content was added dynamically after page load.
    </p>
    <button class="button" data-appdev-action="dynamic" data-dynamic-button="true">
      Dynamic Button
    </button>
  `;

  contentSection.appendChild(dynamicDiv);

  // Add event listener to new button
  const newButton = dynamicDiv.querySelector('[data-appdev-action="dynamic"]');
  newButton.addEventListener('click', event => {
    console.log('Dynamic button clicked');
    showNotification('Dynamic action triggered!');
    event.target.style.background = '#ed8936';
    setTimeout(() => {
      event.target.style.background = '#4299e1';
    }, 200);
  });
}

function showNotification(message) {
  // Remove existing notification
  const existing = document.querySelector('.notification');
  if (existing) {
    existing.remove();
  }

  // Create new notification
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #48bb78;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(notification);

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Log plugin status
console.log('AppDev Design Mode Plugin: Basic example ready for testing');
