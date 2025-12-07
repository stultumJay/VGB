import { auth, db } from '../config/firebase.js';

// Create user
export const createUser = async (req, res) => {
  try {
    const { email, password, username, isAdmin } = req.body;
    
    // Create Firebase Auth user first
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: username
    });
    
    console.log('✅ Firebase Auth user created:', userRecord.uid);
    
    // Store user data in Realtime Database using the UID from Firebase Auth
    const userData = {
      userId: userRecord.uid,  // Use Firebase UID
      username,
      email,
      guest: false,
      registered: true,
      administrator: isAdmin || false,
      registrationDate: new Date().toISOString().split('T')[0]
    };
    
    // IMPORTANT: Store in Realtime Database under users/{uid}
    await db.ref(`users/${userRecord.uid}`).set(userData);
    
    console.log('✅ User data saved to Realtime Database:', userRecord.uid);
    
    res.status(201).json({ 
      message: 'User created successfully', 
      userId: userRecord.uid,
      username: username
    });
  } catch (error) {
    console.error('❌ Create user error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create user' 
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('🔍 Looking for user:', userId);
    
    const snapshot = await db.ref(`users/${userId}`).once('value');
    const userData = snapshot.val();
    
    if (!userData) {
      console.log('❌ User not found in database:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✅ User found:', userData);
    res.json({ id: userId, ...userData });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email } = req.body;
    
    const updateData = {};
    
    if (username) updateData.username = username;
    if (email) {
      updateData.email = email;
      // Update in Firebase Auth too
      await auth.updateUser(userId, { email });
    }
    
    await db.ref(`users/${userId}`).update(updateData);
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Verify admin status
export const verifyAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const snapshot = await db.ref(`users/${userId}`).once('value');
    const userData = snapshot.val();
    
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ isAdmin: userData.administrator === true });
  } catch (error) {
    console.error('Verify admin error:', error);
    res.status(500).json({ error: 'Failed to verify admin status' });
  }
};