import { useState } from 'react';
import './ClassPage.css';
import UserSearchModal from './components/UserSearchModal';
import CheckInButton from './components/CheckInButton';
import { Class, Classmate, ClassDate } from '../types'; 

interface ClassPageProps {
  currentClass: Class;
  onBack: () => void;
  currentUser: string;
}

function ClassPage({ currentClass, onBack, currentUser }: ClassPageProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortModalOpen, setSortModalOpen] = useState(false); 
  const [sortedStudents, setSortedStudents] = useState<Classmate[]>([]);

  const getNextClassDate = (): ClassDate | undefined => {
    const today = new Date();
    return currentClass.dates
      .map((d) => ({ ...d, parsedDate: new Date(`${d.date}T${d.startTime}`) }))
      .filter((d) => d.parsedDate >= today)
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())[0];
  };
  
  const nextClassDate = getNextClassDate();

  const getClassDateForToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return currentClass.dates.find(date => date.date === today);
  };
    
  const currentClassDate = getClassDateForToday(); 

  const handleCheckIn = () => {
    setIsCheckedIn(true);
  };

  const sortBy = (criteria: string) => {
    let sortedList = [...currentClass.students];
    switch (criteria) {
      case 'Alphabetically':
        sortedList.sort((a, b) => a.username.localeCompare(b.username));
        break;
      case 'Checked In':
        sortedList.sort((a, b) => (a.isCheckedIn === b.isCheckedIn ? 0 : a.isCheckedIn ? -1 : 1));
        break;
      case 'Amount of Money':
        sortedList.sort((a, b) => b.remainingBalance - a.remainingBalance);
        break;
      default:
        break;
    }
    setSortedStudents(sortedList);
    setSortModalOpen(false);
  };

  const getButtonColor = () => {
    if (!currentClassDate) return 'gray';
    
    const now = new Date();
    const startTime = new Date(`${currentClassDate.date}T${currentClassDate.startTime}`);
    const endTime = new Date(`${currentClassDate.date}T${currentClassDate.endTime}`);
    const checkInStart = new Date(startTime.getTime() - 5 * 60 * 1000);
    const checkInEnd = new Date(startTime.getTime() + 5 * 60 * 1000);

    if (now >= checkInStart && now <= checkInEnd) return 'green';
    if (now > checkInEnd && now < endTime) return 'yellow';
    return 'gray';
  };

  const handleAddCompetitor = async (username: string) => {
    console.log('Adding competitor:', username);
    try {
      // First get the user's data
      const userResponse = await fetch(import.meta.env.VITE_GET_USER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userResponse.json();
      const user = userData.user;

      console.log("Username:", user.username);
      console.log("Amount:", 10);
      console.log("Class ID:", currentClass.id);

      // Then send a notification to the added user
      const notificationResponse = await fetch(
        import.meta.env.VITE_SEND_NOTIFICATION_URL, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: user.username,
            amount: 10,
            classId: currentClass.id,
            className: currentClass.title,
          }),
        }
      );
  
      if (!notificationResponse.ok) {
        throw new Error('Failed to send notification');
      }
  
      const notificationData = await notificationResponse.json();
      console.log('Notification sent successfully:', notificationData);
      
      // You might want to show a success message to the current user
      alert(`${user.username} was added and notified successfully!`);
      
    } catch (error) {
      console.error('Error adding competitor:', error);
      alert('Failed to add user');
    }
  };

  return (
    <div className="classpage">
      <h1>{currentClass.title.toUpperCase()}</h1>

      <div className="class-details">
        {currentClass.building.name && (
          <p>Location: {currentClass.building.name}</p>
        )}
        {nextClassDate && (
          <p>Next Class: {nextClassDate.date} {nextClassDate.startTime}–{nextClassDate.endTime}</p>
        )}
        <p>Total Money in Pot: ${currentClass.total}</p>
      </div>

      <CheckInButton 
        isCheckedIn={isCheckedIn} 
        onCheckIn={handleCheckIn} 
        location={currentClass.location} 
        buttonColor={getButtonColor()} 
        bypassLocation={true} 
      />

      <h3>Competitors</h3>
      <ul>
        <li
          key="current-user"
          className={`competitor-item current-user ${isCheckedIn ? 'checked-in' : ''}`}
        >
          <span>{currentUser} (You)</span>
          <span className="balance">
            ${currentClass.students.find((c) => c.username === currentUser)?.remainingBalance ?? 0}
          </span>
        </li>

        {currentClass.students
          .filter((competitor) => competitor.username !== currentUser)
          .map((competitor, index) => (
            <li key={index} className="competitor-item">
              <span>{competitor.username}</span>
              <span className="balance">${competitor.remainingBalance}</span>
            </li>
          ))}
      </ul>

      <div className="button-group">
        <button onClick={() => setIsModalOpen(true)}>Add User</button>
        <button onClick={() => setSortModalOpen(true)}>Sort By</button>
      </div>

      {isModalOpen && (
        <UserSearchModal
          onClose={() => setIsModalOpen(false)}
          onSelectUser={handleAddCompetitor}
          excludedUsernames={currentClass.students.map(s => s.username)}
        />
      )}

      {sortModalOpen && (
        <div className="sort-modal">
          <h4>Sort By</h4>
          <select onChange={(e) => sortBy(e.target.value)}>
            <option value="Alphabetically">Alphabetically</option>
            <option value="Checked In">Checked In</option>
            <option value="Amount of Money">Amount of Money</option>
          </select>
          <button onClick={() => setSortModalOpen(false)}>Close</button>
        </div>
      )}

      <button className="home-button" onClick={onBack}>
        ⬅ Back to Home
      </button>
    </div>
  );
}

export default ClassPage;
