/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import { User, Class, Classmate, Notification } from "./types";
import * as admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert('./secrets/key.json'),
  databaseURL: 'https://rcb-db.firebaseio.com' 
});

// Initialize Firestore
const db = getFirestore("rcb-db");

// Example function
export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

/**
 * Creates a new user in Firestore
 * @param {string} username - The user's unique username
 * @param {string} phone - The user's phone number
 * @returns {object} - The created user object with ID
 */
export const createUser = onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    logger.log("Incoming request data:", req.body);

    const { username, phone } = req.body;
    
    // Validate required fields
    if (!username || !phone) {
      res.status(400).json({ error: "Username and phone number are required" });
      return;
    }
    
    // Check if username already exists
    const userSnapshot = await db.collection('users').where('username', '==', username).get();
    if (!userSnapshot.empty) {
      res.status(400).json({ error: "Username already exists" });
      return;
    }
    
    // Create new user with initial balance of 0
    const newUser: User = {
      username,
      phone,
      balance: 50.00,
      classes: [],
      notifications: [],
    };
    
    const userRef = await db.collection('users').add(newUser);
    
    logger.info(`User created with ID: ${userRef.id}`, {
      userId: userRef.id,
      username
    });
    
    res.status(201).json({
      success: true,
      userId: userRef.id,
      user: newUser
    });
  } catch (error: any) {
    logger.error("Error creating user:", error);
    res.status(500).json({ error: `Failed to create user: ${error.message}` });
  }
});

/**
 * Creates a new class in Firestore
 * @param {string} title - The class title
 * @param {[number, number]} location - The class location coordinates
 * @param {number} total - The total price for the class
 * @param {ClassDate[]} dates - Array of class dates
 * @returns {object} - The created class object with ID
 */
export const createClass = onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    logger.log("Incoming request data:", req.body);
    
    const { title, location, total, dates, username, building } = req.body;
    
    // Validate required fields
    if (!title || !location || total === undefined || !dates || !Array.isArray(dates) || dates.length === 0 || !username) {
      res.status(400).json({ error: "Title, location, total price, and dates are required" });
      return;
    }
    
    // Get the user document first
    const userSnapshot = await db.collection('users').where('username', '==', username).limit(1).get();
    if (userSnapshot.empty) {
      res.status(400).json({ error: "User not found" });
      return;
    }
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data() as User;

    // Create new student
    const newStudent: Classmate = {
      username,
      remainingBalance: userData.balance,
      lostBalance: 0,
      attendance: 0
    };
    
    // Use a transaction to ensure both operations succeed or fail together
    await db.runTransaction(async (transaction) => {
      // Create a new document reference with auto-generated ID
      const classRef = db.collection('classes').doc();
      
      // Create new class with the ID included
      const newClass: Class = {
        id: classRef.id, // Add the document ID to the class data
        title,
        location,
        total,
        dates,
        students: [newStudent],
        numberOfClasses: dates.length,
        building,
      };
      
      // Set the class document
      transaction.set(classRef, newClass);
      
      // Update the user's classes array
      const updatedClasses = [...userData.classes, classRef.id];
      transaction.update(userDoc.ref, {
        classes: updatedClasses
      });
      
      // Return the class data for the response
      return { classId: classRef.id, classData: newClass };
    }).then(async ({ classId, classData }) => {
      logger.info(`Class created with ID: ${classId}`, {
        classId,
        title
      });
      
      res.status(201).json({
        success: true,
        classId,
        class: classData
      });
    });
  } catch (error: any) {
    logger.error("Error creating class:", error);
    res.status(500).json({ error: `Failed to create class: ${error.message}` });
  }
});

/**
 * Adds a user to a class
 * @param {string} username - The username to add
 * @param {string} classId - The class ID to add the user to
 * @returns {object} - Success message
 */
export const addUserToClass = onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    logger.log("Incoming request data:", req.body);
    
    const { username, classId } = req.body;
    
    // Validate required fields
    if (!username || !classId) {
      res.status(400).json({ error: "Username and class ID are required" });
      return;
    }
    
    // Transaction to ensure data consistency
    await db.runTransaction(async (transaction) => {
      // Get user
      const userQuery = db.collection('users').where('username', '==', username).limit(1);
      const userSnapshot = await transaction.get(userQuery);
      
      if (userSnapshot.empty) {
        throw new Error(`User with username ${username} not found`);
      }
      
      const userDoc = userSnapshot.docs[0];
      const userId = userDoc.id;
      const userData = userDoc.data() as User;
      
      // Get class
      const classRef = db.collection('classes').doc(classId);
      const classSnapshot = await transaction.get(classRef);
      
      if (!classSnapshot.exists) {
        throw new Error(`Class with ID ${classId} not found`);
      }
      
      const classData = classSnapshot.data() as Class;
      
      // Check if user is already in the class
      const existingStudent = classData.students.find(student => student.username === username);
      if (existingStudent) {
        throw new Error(`User ${username} is already enrolled in this class`);
      }
      
      // Add user to class
      const newClassmate: Classmate = {
        username,
        remainingBalance: userData.balance >= classData.total ? classData.total : userData.balance,
        lostBalance: 0,
        attendance: 0
      };
      
      // Update user's balance
      const deductedAmount = Math.min(userData.balance, classData.total);
      const newBalance = userData.balance - deductedAmount;
      
      // Add class to user's classes array
      const updatedClasses = [...userData.classes, classId];
      
      // Update user document
      transaction.update(db.collection('users').doc(userId), {
        balance: newBalance,
        classes: updatedClasses
      });
      
      // Update class document
      transaction.update(classRef, {
        students: [...classData.students, newClassmate]
      });
    });
    
    logger.info(`User ${username} added to class ${classId}`);
    
    res.status(200).json({
      success: true,
      message: `User ${username} successfully added to class`
    });
  } catch (error: any) {
    logger.error("Error adding user to class:", error);
    res.status(500).json({ error: `Failed to add user to class: ${error.message}` });
  }
});

/**
 * Fetches all users from Firestore
 * @returns {object} - Array of all users with their IDs
 */
export const getAllUsers = onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    // Get all users from Firestore
    const usersSnapshot = await db.collection('users').get();
    
    // Map through documents to create array of users with their IDs
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as User
    }));
    
    logger.info(`Fetched ${users.length} users`);
    
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error: any) {
    logger.error("Error fetching users:", error);
    res.status(500).json({ 
      error: `Failed to fetch users: ${error.message}` 
    });
  }
});

/**
 * Fetches multiple classes by their IDs
 * @param {string[]} classIds - Array of class IDs to fetch
 * @returns {object} - Array of the requested class objects
 */
export const getClassesByIds = onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { classIds } = req.body;

    // Validate required field
    if (!classIds || !Array.isArray(classIds)) {
      res.status(400).json({ error: "classIds array is required" });
      return;
    }

    // Remove duplicates and filter out empty values
    const uniqueClassIds = [...new Set(classIds.filter(id => id))];

    if (uniqueClassIds.length === 0) {
      res.status(200).json({
        success: true,
        count: 0,
        classes: []
      });
      return;
    }

    // Get all classes in parallel
    const classPromises = uniqueClassIds.map(id => 
      db.collection('classes').doc(id).get()
    );
    const classSnapshots = await Promise.all(classPromises);

    // Process results - no need to add id separately since it's now included in the document
    const classes = classSnapshots
      .filter(snapshot => snapshot.exists)
      .map(snapshot => snapshot.data() as Class);

    logger.info(`Fetched ${classes.length} of ${uniqueClassIds.length} requested classes`);

    res.status(200).json({
      success: true,
      requestedCount: uniqueClassIds.length,
      returnedCount: classes.length,
      classes
    });
  } catch (error: any) {
    logger.error("Error fetching classes by IDs:", error);
    res.status(500).json({ 
      error: `Failed to fetch classes: ${error.message}` 
    });
  }
});

/**
 * Adds multiple buildings to the buildings collection
 * @param {Building[]} buildings - Array of building objects to add
 * @returns {object} - Result with count and document IDs
 */
export const addBuildings = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { buildings } = req.body;

    if (!buildings || !Array.isArray(buildings)) {
      res.status(400).json({ error: "buildings array is required" });
      return;
    }

    const validBuildings = buildings.filter(building =>
      building?.name &&
      Array.isArray(building.location) &&
      building.location.length === 2 &&
      typeof building.location[0] === 'number' &&
      typeof building.location[1] === 'number'
    );

    if (validBuildings.length === 0) {
      res.status(400).json({ error: "No valid buildings provided" });
      return;
    }

    const buildingsRef = db.collection('buildings').doc('all');

    // Get existing buildings (if any)
    const docSnapshot = await buildingsRef.get();
    const existingBuildings = docSnapshot.exists ? docSnapshot.data()?.buildings || [] : [];

    // Merge buildings
    const updatedBuildings = [...existingBuildings, ...validBuildings];

    // Save the updated list
    await buildingsRef.set({ buildings: updatedBuildings });

    logger.info(`Stored ${updatedBuildings.length} total buildings`);

    res.status(201).json({
      success: true,
      addedCount: validBuildings.length,
      totalCount: updatedBuildings.length
    });

  } catch (error: any) {
    logger.error("Error adding buildings:", error);
    res.status(500).json({
      error: `Failed to add buildings: ${error.message}`
    });
  }
});


/**
 * Retrieves all buildings from the buildings collection
 * @returns {object} - Array of all building documents
 */
export const getAllBuildings = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const docSnapshot = await db.collection('buildings').doc('all').get();

    if (!docSnapshot.exists) {
      res.status(200).json({ success: true, count: 0, buildings: [] });
      return;
    }

    const buildings = docSnapshot.data()?.buildings || [];

    logger.info(`Fetched ${buildings.length} buildings`);

    res.status(200).json({
      success: true,
      count: buildings.length,
      buildings
    });

  } catch (error: any) {
    logger.error("Error fetching buildings:", error);
    res.status(500).json({
      error: `Failed to fetch buildings: ${error.message}`
    });
  }
});

/**
 * Gets a user by their username
 * @param {string} username - The username to search for
 * @returns {object} - The user object with ID if found
 */
export const getUserByUsername = onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    let username: string;
    
    // Handle both GET and POST requests
    if (req.method === 'GET') {
      username = req.query.username as string;
    } else if (req.method === 'POST') {
      username = req.body.username;
    } else {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    // Validate required field
    if (!username) {
      res.status(400).json({ error: "Username is required" });
      return;
    }

    // Find user by username
    const usersSnapshot = await db.collection('users')
      .where('username', '==', username)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data() as User;

    logger.info(`Retrieved user ${username}`);

    res.status(200).json({
      success: true,
      user: {
        id: userDoc.id,
        ...userData
      }
    });

  } catch (error: any) {
    logger.error("Error fetching user by username:", error);
    res.status(500).json({ 
      error: `Failed to fetch user: ${error.message}` 
    });
  }
});

/**
 * Sends a notification to a user
 * @param {string} username - The username to send notification to
 * @param {number} amount - The amount related to the notification
 * @param {string} classId - The class ID related to the notification
 * @param {string} className - The class name related to the notification
 * @returns {object} - Success message
 */
export const sendNotification = onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    logger.log("Incoming request data:", req.body);
    
    const { username, amount, classId, className } = req.body;
    
    // Validate required fields
    if (!username || amount === undefined || !classId) {
      res.status(400).json({ error: "Username, amount, and class ID are required" });
      return;
    }
    
    // Get the user document
    const userQuery = db.collection('users').where('username', '==', username).limit(1);
    const userSnapshot = await userQuery.get();
    
    if (userSnapshot.empty) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data() as User;
    
    // Create new notification
    const newNotification: Notification = {
      amount,
      classId,
      className,
    };
    
    // Update user's notifications array
    const updatedNotifications = [...(userData.notifications || []), newNotification];
    
    await userDoc.ref.update({
      notifications: updatedNotifications
    });
    
    logger.info(`Notification sent to user ${username}`, {
      userId: userDoc.id,
      notification: newNotification
    });
    
    res.status(200).json({
      success: true,
      message: "Notification sent successfully",
      notification: newNotification
    });
  } catch (error: any) {
    logger.error("Error sending notification:", error);
    res.status(500).json({ error: `Failed to send notification: ${error.message}` });
  }
});

/**
 * Gets all notifications for a user
 * @param {string} username - The username to get notifications for
 * @returns {object} - Array of notifications
 */
export const getUserNotifications = onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    let username: string;
    
    // Handle both GET and POST requests
    if (req.method === 'GET') {
      username = req.query.username as string;
    } else if (req.method === 'POST') {
      username = req.body.username;
    } else {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    // Validate required field
    if (!username) {
      res.status(400).json({ error: "Username is required" });
      return;
    }

    // Find user by username
    const usersSnapshot = await db.collection('users')
      .where('username', '==', username)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data() as User;

    logger.info(`Retrieved notifications for user ${username}`);

    res.status(200).json({
      success: true,
      notifications: userData.notifications || []
    });

  } catch (error: any) {
    logger.error("Error fetching user notifications:", error);
    res.status(500).json({ 
      error: `Failed to fetch notifications: ${error.message}` 
    });
  }
});