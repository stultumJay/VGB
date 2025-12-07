// Calendar Component with Game Releases
import { gameAPI } from '../services/api.js';
import { formatDate } from '../utils/helpers.js';

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let gamesByDate = {};

export const initCalendar = async () => {
  await loadGamesForMonth(currentYear, currentMonth);
  generateCalendar(currentYear, currentMonth);
  setupCalendarControls();
};

const loadGamesForMonth = async (year, month) => {
  try {
    // Get first and last day of month
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
    
    // Fetch games for this month
    const games = await gameAPI.filter({ startDate, endDate });
    
    // Group games by date
    gamesByDate = {};
    games.forEach(game => {
      const dateKey = game.releaseDate;
      if (!gamesByDate[dateKey]) {
        gamesByDate[dateKey] = [];
      }
      gamesByDate[dateKey].push(game);
    });
  } catch (error) {
    console.error('Failed to load games for calendar:', error);
  }
};

const generateCalendar = (year, month) => {
  const calendar = document.getElementById('calendar');
  const monthYear = document.getElementById('month-year');
  
  if (!calendar || !monthYear) return;
  
  calendar.innerHTML = '';
  
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
  monthYear.textContent = `${monthName} ${year}`;
  
  // Day headers
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  days.forEach(day => {
    const cell = document.createElement('div');
    cell.className = 'day header';
    cell.textContent = day;
    calendar.appendChild(cell);
  });
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    const cell = document.createElement('div');
    cell.className = 'day empty';
    calendar.appendChild(cell);
  }
  
  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    cell.className = 'day';
    
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const gamesOnThisDay = gamesByDate[dateKey] || [];
    
    // Day number
    const dayNum = document.createElement('div');
    dayNum.className = 'day-number';
    dayNum.textContent = d;
    cell.appendChild(dayNum);
    
    // Highlight today
    if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      cell.classList.add('today');
    }
    
    // Add games to this day
    if (gamesOnThisDay.length > 0) {
      cell.classList.add('has-games');
      
      const gamesContainer = document.createElement('div');
      gamesContainer.className = 'calendar-games';
      
      gamesOnThisDay.forEach(game => {
        const gameTag = document.createElement('div');
        gameTag.className = 'calendar-game-tag';
        gameTag.textContent = game.title;
        gameTag.title = `${game.title} - ${game.platform}`;
        gameTag.addEventListener('click', (e) => {
          e.stopPropagation();
          showGameDetails(game);
        });
        gamesContainer.appendChild(gameTag);
      });
      
      cell.appendChild(gamesContainer);
    }
    
    calendar.appendChild(cell);
  }
};

const setupCalendarControls = () => {
  window.prevMonth = async () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    await loadGamesForMonth(currentYear, currentMonth);
    generateCalendar(currentYear, currentMonth);
  };
  
  window.nextMonth = async () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    await loadGamesForMonth(currentYear, currentMonth);
    generateCalendar(currentYear, currentMonth);
  };
};

const showGameDetails = (game) => {
  window.location.href = `game-detail.html?id=${game.id || game.gameId}`;
};