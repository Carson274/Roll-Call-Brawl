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
//   const classStudents: Classmate[] = [
//       {
//           username: 'Carpettt',
//           remainingBalance: 100,
//           lostBalance: 0,
//           attendance: 0,
//       },
//       {
//           username: 'Mitokongdrya',
//           remainingBalance: 100,
//           lostBalance: 0,
//           attendance: 0,
//       },
//       {
//           username: 'Mokka',
//           remainingBalance: 100,
//           lostBalance: 0,
//           attendance: 0,
//       },
//       {
//           username: 'Chat',
//           remainingBalance: 100,
//           lostBalance: 0,
//           attendance: 0,
//       },
//   ];

  // const currentClass: Class = {
  //     title: "Math 101",
  //     location: [1, 2],
  //     total: 100,
  //     dates: [],
  //     students: classStudents,
  //     numberOfClasses: 10
  // };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [competitors, setCompetitors] = useState<Classmate[]>(currentClass?.students || []);

  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const handleCheckIn = () => {
    setIsCheckedIn(true);
  };

  // Add competitor handler
  const handleAddCompetitor = (newCompetitor: Classmate) => {
    // Only add competitor if they are not already in the list
    if (!competitors.some((competitor) => competitor.username === newCompetitor.username)) {
      setCompetitors((prev) => [...prev, newCompetitor]);
    }
    setIsModalOpen(false); // Close modal after adding
  };

  return (
    <div className="classpage">
    <h1>{currentClass?.title.toUpperCase()}</h1>
    <CheckInButton isCheckedIn={isCheckedIn} onCheckIn={handleCheckIn} />

      <h3>Competitors</h3>
      <ul>
      <li
        key="current-user"
        className={`competitor-item current-user ${isCheckedIn ? 'checked-in' : ''}`}
        >
        <span>{currentUser} (You)</span>
        <span className="balance">
            $
            {
            competitors.find((c) => c.username === currentUser)?.remainingBalance ?? 0
            }
        </span>
        </li>
      {competitors.map((competitor, index) => (
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
          excludedUsers={competitors}
          allUsers={currentClass?.students || []}
        />
        )}
            <button className="home-button" onClick={() => navigate('/')}>
            ⬅ Back to Home
            </button>
        </div>
        );
}

export default ClassPage;
