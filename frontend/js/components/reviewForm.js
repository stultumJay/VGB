// Review Form Component
import { reviewAPI } from '../services/api.js';
import { showMessage, showError } from '../utils/helpers.js';
import { getCurrentUserData } from '../services/auth.js';

export const createReviewForm = (gameId, containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const userData = getCurrentUserData();
  if (!userData) {
    container.innerHTML = '<p>Please log in to write a review.</p>';
    return;
  }
  
  container.innerHTML = `
    <div class="review-form">
      <h3>Write Your Review</h3>
      <form id="reviewSubmitForm">
        <div class="rating-input">
          <label>Rating:</label>
          <div class="star-rating-input">
            <input type="radio" name="rating" value="5" id="star5">
            <label for="star5">⭐</label>
            <input type="radio" name="rating" value="4" id="star4">
            <label for="star4">⭐</label>
            <input type="radio" name="rating" value="3" id="star3">
            <label for="star3">⭐</label>
            <input type="radio" name="rating" value="2" id="star2">
            <label for="star2">⭐</label>
            <input type="radio" name="rating" value="1" id="star1">
            <label for="star1">⭐</label>
          </div>
        </div>
        
        <div class="review-text-input">
          <label>Review (optional):</label>
          <textarea 
            id="reviewText" 
            placeholder="Share your thoughts about this game..."
            rows="5"
          ></textarea>
        </div>
        
        <button type="submit" class="btn-primary">Submit Review</button>
      </form>
    </div>
  `;
  
  document.getElementById('reviewSubmitForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitReview(gameId, userData.userId);
  });
};

const submitReview = async (gameId, userId) => {
  const rating = document.querySelector('input[name="rating"]:checked')?.value;
  const text = document.getElementById('reviewText').value.trim();
  
  if (!rating && !text) {
    showError('Please provide either a rating or review text');
    return;
  }
  
  try {
    await reviewAPI.create({
      userId,
      gameId,
      text: text || null,
      rating: rating ? parseInt(rating) : null
    });
    
    showMessage('Review submitted successfully!');
    
    // Reset form
    document.getElementById('reviewSubmitForm').reset();
    
    // Reload reviews
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (error) {
    showError('Failed to submit review: ' + error.message);
  }
};

export const displayReviews = (reviews, containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (reviews.length === 0) {
    container.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to review!</p>';
    return;
  }
  
  container.innerHTML = reviews.map(review => `
    <div class="review-card">
      <div class="review-header">
        <span class="review-author">User ${review.userId.substring(0, 8)}</span>
        ${review.rating ? `<span class="review-rating">${'⭐'.repeat(review.rating)}</span>` : ''}
        <span class="review-date">${new Date(review.dateTimePosted).toLocaleDateString()}</span>
      </div>
      ${review.text ? `<p class="review-text">${review.text}</p>` : ''}
    </div>
  `).join('');
};