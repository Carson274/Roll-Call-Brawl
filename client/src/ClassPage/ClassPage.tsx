import { useState } from 'react';
import { useParams } from 'react-router-dom';
import './ClassPage.css';
import UserSearchModal from './components/UserSearchModal';
import CheckInButton from './components/CheckInButton';
import { Class, Classmate } from '../types'; 

function ClassPage() {
//   const { classId } = useParams<{ classId: string }>();
  const currentUser = 'Carson';

const classStudents: Classmate[] = [
    {
        username: 'Carpettt',
        remainingBalance: 100,
        lostBalance: 0,
        attendance: 0,
    },
    {
        username: 'Mitokongdrya',
        remainingBalance: 100,
        lostBalance: 0,
        attendance: 0,
    },
    {
        username: 'Mokka',
        remainingBalance: 100,
        lostBalance: 0,
        attendance: 0,
    },
    {
        username: 'Chat',
        remainingBalance: 100,
        lostBalance: 0,
        attendance: 0,
    },
];

const currentClass: Class = {
    title: "Math 101",
    location: [1, 2],
    total: 100,
    dates: [],
    students: classStudents,
    numberOfClasses: 10
};

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [competitors, setCompetitors] = useState<Classmate[]>(currentClass.students);

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
    <h1>{currentClass.title.toUpperCase()}</h1>
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
      <button onClick={() => setIsModalOpen(true)}>Add Competitor</button>

      {isModalOpen && (
        <UserSearchModal
          onClose={() => setIsModalOpen(false)}
          onSelectUser={handleAddCompetitor}
          excludedUsers={competitors}
          allUsers={currentClass.students}
        />
        )}
        </div>
        );
}

export default ClassPage;
