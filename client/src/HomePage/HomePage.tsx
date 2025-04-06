import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AddClassModal from './components/AddClassModal';
import './HomePage.css';
import { Class, User } from '../../../server/functions/src/types';

function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<User>({
    username: "carpettt",
    phone: "1234567890",
    balance: 100.0,
    classes: ["Z1M07njJtWuKqBpRUa7C", "TqoQKBmHETBMteGMfgMd"],
  });

  const [classes, setClasses] = useState<Class[]>([]);

  // Function to handle adding a new class
  const handleAddClass = (newClass: Class) => {
    setClasses((prevClasses) => [...prevClasses, newClass]); // Add the new class to the state
    console.log('New class added:', newClass);
  };

  useEffect(() => {
    const fetchUserClasses = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_GET_CLASSES_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ classIds: currentUser.classes }),
        });
        const data = await response.json();
        setClasses(data.classes);
        console.log('Fetched classes:', data.classes);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };
    if (currentUser) {
      fetchUserClasses();
    }
  }, []);

  return (
    <div className="homepage">
      <h1>Roll Call Brawl</h1>
      <p className="welcome-message">Welcome, {currentUser.username}!</p>
      <p>Balance: ${currentUser.balance.toFixed(2)}</p>
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