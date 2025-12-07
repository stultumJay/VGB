// Utility helper functions
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const showMessage = (message, type = 'success') => {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message message-${type}`;
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: ${type === 'success' ? '#00ff00' : '#ff4444'};
    color: ${type === 'success' ? '#000' : '#fff'};
    border-radius: 5px;
    z-index: 10000;
    font-weight: bold;
  `;
  
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
};

export const showError = (message) => {
  showMessage(message, 'error');
};

export const showLoading = (show = true) => {
  let loader = document.getElementById('loading-overlay');
  
  if (show) {
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'loading-overlay';
      loader.innerHTML = '<div class="spinner"></div>';
      loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      `;
      document.body.appendChild(loader);
    }
    loader.style.display = 'flex';
  } else {
    if (loader) {
      loader.style.display = 'none';
    }
  }
};

export const createStarRating = (rating) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  let stars = '';
  
  for (let i = 0; i < fullStars; i++) {
    stars += '⭐';
  }
  if (halfStar) {
    stars += '⭐';
  }
  
  return stars || '☆☆☆☆☆';
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};