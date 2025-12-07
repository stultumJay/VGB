// Main JavaScript - Entry Point
import { initAuth, login, register, logout, getUserRole, getCurrentUserData } from './services/auth.js';
import { gameAPI, reviewAPI } from './services/api.js';
import { createFilterBar } from './components/filterBar.js';
import { renderGameGrid } from './components/gameCard.js';
import { initCalendar } from './components/calendar.js';
import { displayReviews } from './components/reviewForm.js';
import { showMessage, showError, showLoading } from './utils/helpers.js';

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🎮 VGB Frontend initialized');
  
  // Initialize authentication
  await initAuth();
  
  // Update welcome message with username
  updateWelcomeMessage();
  
  // Check current page and initialize
  const currentPage = window.location.pathname.split('/').pop();
  
  if (currentPage.includes('index') || currentPage === '' || currentPage === 'index.html') {
    initHomePage();
  } else if (currentPage.includes('user_index')) {
    initUserHomePage();
  } else if (currentPage.includes('calendar')) {
    initCalendarPage();
  } else if (currentPage.includes('reviews')) {
    initReviewsPage();
  }
  
  // Setup auth buttons
  setupAuthButtons();
  setupNavigationButtons();
});

// Update welcome message
function updateWelcomeMessage() {
  const welcomeElement = document.getElementById('welcomeMessage');
  if (welcomeElement) {
    const userData = getCurrentUserData();
    if (userData && userData.username) {
      welcomeElement.textContent = `Welcome, ${userData.username}!`;
    }
  }
}

// Initialize guest home page
const initHomePage = async () => {
  createFilterBar('filter-container');
  
  // Load featured games by default
  try {
    showLoading(true);
    const games = await gameAPI.getAll();
    renderGameGrid(games, 'games-container');
  } catch (error) {
    showError('Failed to load games: ' + error.message);
  } finally {
    showLoading(false);
  }
  
  // Featured Games button
  document.getElementById('featuredGames')?.addEventListener('click', async function() {
    // Remove active class from all buttons
    document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    
    document.getElementById('section-title').textContent = 'Featured Games';
    try {
      showLoading(true);
      const games = await gameAPI.getAll();
      renderGameGrid(games, 'games-container');
    } catch (error) {
      showError('Failed to load games');
    } finally {
      showLoading(false);
    }
  });
  
  // Anticipated Games button
  document.getElementById('anticipatedGames')?.addEventListener('click', async function() {
    document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    
    document.getElementById('section-title').textContent = 'Anticipated Games';
    try {
      showLoading(true);
      const games = await gameAPI.filter({ status: 'upcoming' });
      renderGameGrid(games, 'games-container');
    } catch (error) {
      showError('Failed to load anticipated games');
    } finally {
      showLoading(false);
    }
  });
};

// Initialize user home page
const initUserHomePage = async () => {
  try {
    showLoading(true);
    const games = await gameAPI.getAll();
    renderGameGrid(games, 'games-container');
  } catch (error) {
    showError('Failed to load games: ' + error.message);
  } finally {
    showLoading(false);
  }
};

// Initialize calendar page
const initCalendarPage = async () => {
  console.log('📅 Calendar page initialized');
  try {
    await initCalendar();
  } catch (error) {
    console.error('Failed to initialize calendar:', error);
  }
};

// Initialize reviews page
const initReviewsPage = async () => {
  console.log('⭐ Reviews page initialized');
  try {
    showLoading(true);
    const reviews = await reviewAPI.getAll();
    displayReviews(reviews, 'all-reviews-container');
  } catch (error) {
    showError('Failed to load reviews: ' + error.message);
  } finally {
    showLoading(false);
  }
};

// Setup navigation buttons
const setupNavigationButtons = () => {
  // My Favorites button
  document.getElementById('myFavorites')?.addEventListener('click', () => {
    window.location.href = 'my-favorites.html';
  });
  
  // My Reviews buttons
  document.querySelectorAll('#myReviews').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = 'my-reviews.html';
    });
  });
};

// Setup authentication buttons
const setupAuthButtons = () => {
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const logoutBtn = document.querySelector('.logout');
  const loginModal = document.getElementById('loginModal');
  const signupModal = document.getElementById('signupModal');
  
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      loginModal.style.display = 'block';
    });
  }
  
  if (signupBtn) {
    signupBtn.addEventListener('click', () => {
      signupModal.style.display = 'block';
    });
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const result = await logout();
      if (result.success) {
        showMessage('Logged out successfully');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      }
    });
  }
  
  document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
      this.closest('.modal').style.display = 'none';
    });
  });
  
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });
  
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      showLoading(true);
      const result = await login(email, password);
      showLoading(false);
      
      if (result.success) {
        const userData = result.userData;
        showMessage(`Welcome back, ${userData?.username || 'User'}!`);
        if (loginModal) {
          loginModal.style.display = 'none';
          loginForm.reset();
        }
        
        setTimeout(() => {
          if (userData?.administrator) {
            window.location.href = 'admin_index.html';
          } else {
            window.location.href = 'user_index.html';
          }
        }, 1000);
      } else {
        showError(result.error || 'Login failed');
      }
    });
  }
  
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('signupUsername').value;
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;
      
      showLoading(true);
      const result = await register(email, password, username);
      showLoading(false);
      
      if (result.success) {
        showMessage(`Welcome ${result.username || username}! Account created successfully!`);
        if (signupModal) {
          signupModal.style.display = 'none';
          signupForm.reset();
        }
        setTimeout(() => {
          window.location.href = 'user_index.html';
        }, 1500);
      } else {
        showError(result.error || 'Registration failed');
      }
    });
  }
};