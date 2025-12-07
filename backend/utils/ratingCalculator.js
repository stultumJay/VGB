import { firestore, db } from '../config/firebase.js';

// Update game's average rating
export const updateGameRating = async (gameId) => {
  try {
    const reviewsSnapshot = await firestore.collection('reviews')
      .where('gameId', '==', gameId)
      .where('rating', '!=', null)
      .get();
    
    let totalRating = 0;
    let count = 0;
    
    reviewsSnapshot.forEach(doc => {
      const review = doc.data();
      if (review.rating) {
        totalRating += review.rating;
        count++;
      }
    });
    
    const averageRating = count > 0 ? parseFloat((totalRating / count).toFixed(1)) : 0;
    
    await db.ref(`games/${gameId}`).update({
      averageRating,
      totalRatings: count
    });
    
    return { averageRating, totalRatings: count };
  } catch (error) {
    console.error('Update game rating error:', error);
    throw error;
  }
};