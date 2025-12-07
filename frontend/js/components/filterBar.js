// Filter Bar Component
import { gameAPI } from '../services/api.js';
import { renderGameGrid } from './gameCard.js';
import { showError, showLoading, debounce } from '../utils/helpers.js';

let currentFilters = {};

export const createFilterBar = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div class="filter-bar">
      <div class="filter-group">
        <input type="text" id="search-input" placeholder="Search games..." class="search-input">
      </div>
      
      <div class="filter-group">
        <select id="platform-filter" class="filter-select">
          <option value="">All Platforms</option>
          <option value="PC">PC</option>
          <option value="PS5">PlayStation 5</option>
          <option value="Xbox Series X">Xbox Series X</option>
          <option value="Nintendo Switch">Nintendo Switch</option>
        </select>
      </div>
      
      <div class="filter-group">
        <select id="genre-filter" class="filter-select">
          <option value="">All Genres</option>
          <option value="Action">Action</option>
          <option value="RPG">RPG</option>
          <option value="Strategy">Strategy</option>
          <option value="Horror">Horror</option>
          <option value="Racing">Racing</option>
          <option value="Adventure">Adventure</option>
          <option value="FPS">FPS</option>
          <option value="Platformer">Platformer</option>
        </select>
      </div>
      
      <div class="filter-group">
        <select id="status-filter" class="filter-select">
          <option value="">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="released">Released</option>
        </select>
      </div>
      
      <div class="filter-group">
        <select id="rating-filter" class="filter-select">
          <option value="">All Ratings</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
        </select>
      </div>
      
      <button id="clear-filters" class="btn-secondary">Clear Filters</button>
    </div>
  `;
  
  initializeFilterListeners();
};

const initializeFilterListeners = () => {
  const searchInput = document.getElementById('search-input');
  const platformFilter = document.getElementById('platform-filter');
  const genreFilter = document.getElementById('genre-filter');
  const statusFilter = document.getElementById('status-filter');
  const ratingFilter = document.getElementById('rating-filter');
  const clearBtn = document.getElementById('clear-filters');
  
  // Debounced search
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      currentFilters.title = e.target.value;
      applyFilters();
    }, 500));
  }
  
  // Filter changes
  if (platformFilter) {
    platformFilter.addEventListener('change', (e) => {
      currentFilters.platform = e.target.value;
      applyFilters();
    });
  }
  
  if (genreFilter) {
    genreFilter.addEventListener('change', (e) => {
      currentFilters.genre = e.target.value;
      applyFilters();
    });
  }
  
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      currentFilters.status = e.target.value;
      applyFilters();
    });
  }
  
  if (ratingFilter) {
    ratingFilter.addEventListener('change', (e) => {
      currentFilters.minRating = e.target.value;
      applyFilters();
    });
  }
  
  // Clear filters
  if (clearBtn) {
    clearBtn.addEventListener('click', clearFilters);
  }
};

const applyFilters = async () => {
  try {
    showLoading(true);
    
    // Remove empty filters
    const cleanFilters = Object.fromEntries(
      Object.entries(currentFilters).filter(([_, v]) => v !== '')
    );
    
    let games;
    
    // If only title search, use search endpoint
    if (Object.keys(cleanFilters).length === 1 && cleanFilters.title) {
      games = await gameAPI.search(cleanFilters.title);
    } 
    // If no filters, get all
    else if (Object.keys(cleanFilters).length === 0) {
      games = await gameAPI.getAll();
    }
    // Otherwise use filter endpoint
    else {
      games = await gameAPI.filter(cleanFilters);
    }
    
    renderGameGrid(games, 'games-container');
  } catch (error) {
    showError('Failed to filter games: ' + error.message);
  } finally {
    showLoading(false);
  }
};

const clearFilters = () => {
  currentFilters = {};
  
  document.getElementById('search-input').value = '';
  document.getElementById('platform-filter').value = '';
  document.getElementById('genre-filter').value = '';
  document.getElementById('status-filter').value = '';
  document.getElementById('rating-filter').value = '';
  
  applyFilters();
};