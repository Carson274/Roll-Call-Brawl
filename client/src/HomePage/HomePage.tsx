import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AddClassModal from './components/AddClassModal';
import './HomePage.css';
import { Class, User } from '../../../server/functions/src/types';


const defaultUser: User = {
  username: 'John Cena',
  phone: '123-456-7890',
  balance: 500.0,
  classes: ['class1', [1,2], 100, ['2023-09-01', '9:00', '10:00'], [], 1]
};

const defaultClasses: Class[] = [
  {
    title: 'Math 101',
    location: [40.7128, -74.0060], // Example coordinates
    total: 100,
    dates: [
      { date: '2023-09-01', startTime: '9:00 AM', endTime: '10:00 AM' },
    ],
    students: [
      { username: 'student1', remainingBalance: 50, lostBalance: 0, attendance: 5 },
    ],
    numberOfClasses: 10,
  },
  {
    title: 'History 201',
    location: [34.0522, -118.2437], // Example coordinates
    total: 150,
    dates: [
      { date: '2023-09-02', startTime: '10:00 AM', endTime: '11:00 AM' },
    ],
    students: [
      { username: 'student2', remainingBalance: 75, lostBalance: 0, attendance: 8 },
    ],
    numberOfClasses: 12,
  },
];


function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classes, setClasses] = useState<Class[]>(defaultClasses); // Initialize with default classes
  const [user, setUser] = useState<User>(defaultUser); // Initialize user state

  const handleAddClass = (newClass: Class) => {
    setClasses([...classes, newClass]); // Add the new class to the classes array
    setUser((prevUser) => ({
      ...prevUser,
      classes: [...prevUser.classes, newClass.title], // Add the class title to the user's classes
    }));
  };

  return (
    <div className="homepage">
      <h1>Roll Call Brawl</h1>
      <p className="welcome-message">Welcome, {user.username}!</p> {/* Add welcome message */}
      <p>Balance: ${user.balance.toFixed(2)}</p>
      <div className="classes-header">
        <h3>Classes</h3>
        <button className="add-class-circle" onClick={() => setIsModalOpen(true)}>+</button>
      </div>
      <ul className="class-list">
        {classes.map((classItem, index) => (
          <li key={index}>
            <Link to={`/class/${classItem.title.replace(/\s+/g, '').toLowerCase()}`}>
              {classItem.title} - ${classItem.total}
            </Link>
          </li>
        ))}
        {classes.length === 0 && (
          <li className="empty-classes">No classes yet. Add your first class!</li>
        )}
      </ul>

      {isModalOpen && (
        <AddClassModal
          onClose={() => setIsModalOpen(false)}
          onAddClass={handleAddClass}
        />
      )}
    </div>
  );
}

export default HomePage;