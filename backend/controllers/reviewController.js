import { firestore, db } from '../config/firebase.js';
import { updateGameRating } from '../utils/ratingCalculator.js';

// Get all reviews
export const getAllReviews = async (req, res) => {
  try {
    const snapshot = await firestore.collection('reviews')
      .orderBy('dateTimePosted', 'desc')
      .get();
    
    const reviews = [];
    snapshot.forEach(doc => {
      reviews.push({ reviewId: doc.id, ...doc.data() });
    });
    
    res.json(reviews);
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ error: 'Failed to retrieve reviews' });
  }
};

// Get reviews by game ID
export const getReviewsByGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const snapshot = await firestore.collection('reviews')
      .where('gameId', '==', gameId)
      .orderBy('dateTimePosted', 'desc')
      .get();
    
    const reviews = [];
    snapshot.forEach(doc => {
      reviews.push({ reviewId: doc.id, ...doc.data() });
    });
    
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews by game error:', error);
    res.status(500).json({ error: 'Failed to retrieve reviews' });
  }
};

// Get reviews by user ID
export const getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const snapshot = await firestore.collection('reviews')
      .where('userId', '==', userId)
      .orderBy('dateTimePosted', 'desc')
      .get();
    
    const reviews = [];
    snapshot.forEach(doc => {
      reviews.push({ reviewId: doc.id, ...doc.data() });
    });
    
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews by user error:', error);
    res.status(500).json({ error: 'Failed to retrieve reviews' });
  }
};

// Add review
export const addReview = async (req, res) => {
  try {
    const { userId, gameId, text, rating } = req.body;
    
    // Validate input
    if (!text && !rating) {
      return res.status(400).json({ 
        error: 'Must provide either text, rating, or both' 
      });
    }
    
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }
    
    // Check if game exists
    const gameSnapshot = await db.ref(`games/${gameId}`).once('value');
    if (!gameSnapshot.exists()) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Add review
    const reviewData = {
      userId,
      gameId,
      text: text || null,
      rating: rating ? parseInt(rating) : null,
      dateTimePosted: new Date().toISOString()
    };
    
    const reviewRef = await firestore.collection('reviews').add(reviewData);
    
    // Update game rating if rating was provided
    if (rating) {
      await updateGameRating(gameId);
    }
    
    res.status(201).json({ 
      message: 'Review added successfully', 
      reviewId: reviewRef.id 
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId, text, rating } = req.body;
    
    // Get review
    const reviewDoc = await firestore.collection('reviews').doc(reviewId).get();
    
    if (!reviewDoc.exists) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const reviewData = reviewDoc.data();
    
    // Check ownership
    if (reviewData.userId !== userId) {
      return res.status(403).json({ 
        error: 'User can only edit their own reviews' 
      });
    }
    
    // Validate input
    if (!text && !rating) {
      return res.status(400).json({ 
        error: 'Must provide either text, rating, or both' 
      });
    }
    
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }
    
    // Update review
    const updateData = {
      text: text || null,
      rating: rating ? parseInt(rating) : null
    };
    
    await firestore.collection('reviews').doc(reviewId).update(updateData);
    
    // Recalculate rating if changed
    if (rating !== reviewData.rating) {
      await updateGameRating(reviewData.gameId);
    }
    
    res.json({ message: 'Review updated successfully' });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId, isAdmin } = req.body;
    
    const reviewDoc = await firestore.collection('reviews').doc(reviewId).get();
    
    if (!reviewDoc.exists) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const reviewData = reviewDoc.data();
    
    // Check permissions
    if (!isAdmin && reviewData.userId !== userId) {
      return res.status(403).json({ 
        error: 'User can only delete their own reviews' 
      });
    }
    
    const gameId = reviewData.gameId;
    const hadRating = reviewData.rating !== null;
    
    // Delete review
    await firestore.collection('reviews').doc(reviewId).delete();
    
    // Update game rating if review had a rating
    if (hadRating) {
      await updateGameRating(gameId);
    }
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};