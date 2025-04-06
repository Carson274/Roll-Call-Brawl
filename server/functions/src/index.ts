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
import { User, Class, Classmate } from "./types";
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
      classes: []
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
  try {
    logger.log("Incoming request data:", req.body);
    
    const { title, location, total, dates, username } = req.body;
    
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
    
    // Create new class
    const newClass: Class = {
      title,
      location,
      total,
      dates,
      students: [username],
      numberOfClasses: dates.length
    };
    
    // Use a transaction to ensure both operations succeed or fail together
    await db.runTransaction(async (transaction) => {
      // Add the new class
      const classRef = db.collection('classes').doc();
      transaction.set(classRef, newClass);
      
      // Update the user's classes array
      const updatedClasses = [...userData.classes, classRef.id];
      transaction.update(userDoc.ref, {
        classes: updatedClasses
      });
      
      // Return the class ID for the response
      return classRef.id;
    }).then(async (classId) => {
      logger.info(`Class created with ID: ${classId}`, {
        classId,
        title
      });
      
      res.status(201).json({
        success: true,
        classId,
        class: newClass
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