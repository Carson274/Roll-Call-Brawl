import { useEffect, useState } from 'react';
import './ClassPage.css';
import UserSearchModal from './components/UserSearchModal';
import CheckInButton from './components/CheckInButton';
import { Class, Classmate } from '../types'; 
import { useNavigate } from 'react-router-dom';

function ClassPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [currentClass, setCurrentClass] = useState<Class | null>(null);

  useEffect(() => {
    setCurrentClass(classes[0]);
  }, [classes]);

  useEffect(() => {
    const fetchUserClasses = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_GET_CLASSES_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ classIds: ["Z1M07njJtWuKqBpRUa7C"] }),
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

  const currentUser = 'Carson';
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const handleCheckIn = () => {
    setIsCheckedIn(true);
  };

  const handleAddCompetitor = (newCompetitor: Classmate) => {
    if (!currentClass) return;
  
    // Check if the newCompetitor is already in the class
    const alreadyExists = currentClass.students.some(
      (student) => student.username === newCompetitor.username
    );
  
    if (!alreadyExists) {
      // Update currentClass with new student
      const updatedClass: Class = {
        ...currentClass,
        students: [...currentClass.students, newCompetitor],
      };
      setCurrentClass(updatedClass);
    }
  
    setIsModalOpen(false);
  };

  return (
    <div className="classpage">
      <h1>{currentClass?.title.toUpperCase()}</h1>

      {/* Display total money in the pot and location */}
      <div className="class-details">
        <p>Total Money in Pot: ${currentClass?.total}</p>
        <p>Location: {currentClass ? `(${currentClass.location[0]}, ${currentClass.location[1]})` : 'N/A'}</p>
      </div>

      <CheckInButton isCheckedIn={isCheckedIn} onCheckIn={handleCheckIn} location={[44.5678943, -123.2796066]} />

      <h3>Competitors</h3>
      <ul>
        <li
          key="current-user"
          className={`competitor-item current-user ${isCheckedIn ? 'checked-in' : ''}`}
        >
          <span>{currentUser} (You)</span>
          <span className="balance">
            ${currentClass?.students.find((c) => c.username === currentUser)?.remainingBalance ?? 0}
          </span>
        </li>

        {currentClass?.students
          .filter((competitor) => competitor.username !== currentUser)
          .map((competitor, index) => (
            <li key={index} className="competitor-item">
              <span>{competitor.username}</span>
              <span className="balance">${competitor.remainingBalance}</span>
            </li>
        ))}
      </ul>

      <button onClick={() => setIsModalOpen(true)}>Add User</button>

      {isModalOpen && (
        <UserSearchModal
          onClose={() => setIsModalOpen(false)}
          onSelectUser={handleAddCompetitor}
          excludedUsers={currentClass?.students || []}
        />
      )}

      <button className="home-button" onClick={() => navigate('/')}>
        ⬅ Back to Home
      </button>
    </div>
  );
}

export default ClassPage;
