import { db, firestore } from '../config/firebase.js';

// Get all games
export const getAllGames = async (req, res) => {
  try {
    const snapshot = await db.ref('games').once('value');
    const games = [];
    
    snapshot.forEach((child) => {
      games.push({ id: child.key, ...child.val() });
    });
    
    res.json(games);
  } catch (error) {
    console.error('Get all games error:', error);
    res.status(500).json({ error: 'Failed to retrieve games' });
  }
};

// Get single game by ID
export const getGameById = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const gameSnapshot = await db.ref(`games/${gameId}`).once('value');
    const gameData = gameSnapshot.val();
    
    if (!gameData) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Get reviews from Firestore
    const reviewsSnapshot = await firestore.collection('reviews')
      .where('gameId', '==', gameId)
      .orderBy('dateTimePosted', 'desc')
      .get();
    
    const reviews = [];
    reviewsSnapshot.forEach(doc => {
      reviews.push({ reviewId: doc.id, ...doc.data() });
    });
    
    res.json({ game: { id: gameId, ...gameData }, reviews });
  } catch (error) {
    console.error('Get game by ID error:', error);
    res.status(500).json({ error: 'Failed to retrieve game' });
  }
};

// Search games by title
export const searchGames = async (req, res) => {
  try {
    const { title } = req.query;
    
    if (!title) {
      return res.status(400).json({ error: 'Title parameter required' });
    }
    
    const snapshot = await db.ref('games').once('value');
    const games = [];
    
    snapshot.forEach((child) => {
      const game = child.val();
      if (game.title && game.title.toLowerCase().includes(title.toLowerCase())) {
        games.push({ id: child.key, ...game });
      }
    });
    
    res.json(games);
  } catch (error) {
    console.error('Search games error:', error);
    res.status(500).json({ error: 'Failed to search games' });
  }
};

// Multi-criteria filter
export const filterGames = async (req, res) => {
  try {
    const { platform, genre, status, minRating, startDate, endDate } = req.query;
    
    const snapshot = await db.ref('games').once('value');
    let games = [];
    
    snapshot.forEach((child) => {
      games.push({ id: child.key, ...child.val() });
    });
    
    // Apply filters
    if (platform) {
      games = games.filter(game => 
        game.platform && game.platform.toLowerCase().includes(platform.toLowerCase())
      );
    }
    
    if (genre) {
      games = games.filter(game => 
        game.genre && game.genre.toLowerCase().includes(genre.toLowerCase())
      );
    }
    
    if (status === 'upcoming') {
      games = games.filter(game => game.upcoming === true);
    } else if (status === 'released') {
      games = games.filter(game => game.released === true);
    }
    
    if (minRating) {
      const minRatingNum = parseFloat(minRating);
      games = games.filter(game => 
        game.averageRating && game.averageRating >= minRatingNum
      );
    }
    
    if (startDate && endDate) {
      games = games.filter(game => 
        game.releaseDate && 
        game.releaseDate >= startDate && 
        game.releaseDate <= endDate
      );
    }
    
    res.json(games);
  } catch (error) {
    console.error('Filter games error:', error);
    res.status(500).json({ error: 'Failed to filter games' });
  }
};

// Add game (Admin only) - WITH BASE64 IMAGE
export const addGame = async (req, res) => {
  try {
    const { 
      gameId, 
      title, 
      description, 
      releaseDate, 
      platform, 
      genre, 
      upcoming, 
      released,
      imageBase64  // Base64 string from frontend
    } = req.body;
    
    // Validate image size (limit to ~1MB base64 = ~750KB actual)
    if (imageBase64 && imageBase64.length > 1400000) {
      return res.status(400).json({ 
        error: 'Image too large. Please use image under 1MB' 
      });
    }
    
    const gameData = {
      gameId,
      title,
      description,
      releaseDate,
      platform,
      genre,
      imageBase64: imageBase64 || '',  // Store Base64 directly
      upcoming: upcoming === 'true' || upcoming === true,
      released: released === 'true' || released === true,
      averageRating: 0,
      totalRatings: 0
    };
    
    await db.ref(`games/${gameId}`).set(gameData);
    
    res.status(201).json({ 
      message: 'Game added successfully', 
      gameId
    });
  } catch (error) {
    console.error('Add game error:', error);
    res.status(500).json({ error: 'Failed to add game' });
  }
};

// Update game (Admin only) - WITH BASE64 IMAGE
export const updateGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { 
      title, 
      description, 
      releaseDate, 
      platform, 
      genre, 
      upcoming, 
      released,
      imageBase64
    } = req.body;
    
    const updateData = {
      title,
      description,
      releaseDate,
      platform,
      genre,
      upcoming: upcoming === 'true' || upcoming === true,
      released: released === 'true' || released === true
    };
    
    // Update image if provided
    if (imageBase64) {
      if (imageBase64.length > 1400000) {
        return res.status(400).json({ 
          error: 'Image too large. Please use image under 1MB' 
        });
      }
      updateData.imageBase64 = imageBase64;
    }
    
    await db.ref(`games/${gameId}`).update(updateData);
    
    res.json({ message: 'Game updated successfully' });
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({ error: 'Failed to update game' });
  }
};

// Delete game (Admin only) - SIMPLIFIED (no storage deletion)
export const deleteGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    // Check if game exists
    const gameSnapshot = await db.ref(`games/${gameId}`).once('value');
    if (!gameSnapshot.exists()) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Delete all reviews for this game
    const reviewsSnapshot = await firestore.collection('reviews')
      .where('gameId', '==', gameId)
      .get();
    
    const batch = firestore.batch();
    reviewsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    // Delete favorites
    const favoritesSnapshot = await db.ref('favorites')
      .orderByChild('gameId')
      .equalTo(gameId)
      .once('value');
    
    const favoriteUpdates = {};
    favoritesSnapshot.forEach(child => {
      favoriteUpdates[child.key] = null;
    });
    
    if (Object.keys(favoriteUpdates).length > 0) {
      await db.ref('favorites').update(favoriteUpdates);
    }
    
    // Delete game (image is deleted automatically with the game data)
    await db.ref(`games/${gameId}`).remove();
    
    res.json({ message: 'Game and related data deleted successfully' });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ error: 'Failed to delete game' });
  }
};