import { useEffect, useState } from 'react';
import './ClassPage.css';
import UserSearchModal from './components/UserSearchModal';
import CheckInButton from './components/CheckInButton';
import { Class, Classmate, ClassDate, ClassmateAttendance } from '../types'; 
import { useParams, useNavigate } from 'react-router-dom';

function ClassPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [currentClass, setCurrentClass] = useState<Class | null>(null);
  const { classId } = useParams();

  const getNextClassDate = (): ClassDate | undefined => {
    if (!currentClass) return;
  
    const today = new Date();
    return currentClass.dates
      .map((d) => ({ ...d, parsedDate: new Date(`${d.date}T${d.startTime}`) }))
      .filter((d) => d.parsedDate >= today)
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())[0]; // Get the soonest future class
  };
  
  const nextClassDate = getNextClassDate();

    // Get today's date and find the class date for today
    const getClassDateForToday = () => {
        const today = new Date().toISOString().split('T')[0]; // Get current date (YYYY-MM-DD)
        return currentClass?.dates.find(date => date.date === today);
      };
    
      const currentClassDate = getClassDateForToday(); 

  useEffect(() => {
    setCurrentClass(classes[0]);
  }, [classes]);

  useEffect(() => {
    const fetchClassById = async () => {
      try {
        if (!classId) return;
  
        const response = await fetch(import.meta.env.VITE_GET_CLASSES_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ classIds: [classId] }),
        });
  
        const data = await response.json();
        setClasses(data.classes);
        setCurrentClass(data.classes[0]); // Only one class expected
      } catch (error) {
        console.error('Error fetching class:', error);
      }
    };
  
    fetchClassById();
  }, [classId]);

  const currentUser = 'Carson';
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const handleCheckIn = () => {
    setIsCheckedIn(true);
  };

    // Helper function to determine the check-in button color based on class date times
    const getButtonColor = () => {
        if (!currentClass || !currentClassDate) return 'gray'; // Default if no class or date available
    
        const now = new Date();
        const startTime = new Date(`${currentClassDate.date}T${currentClassDate.startTime}`);
        const endTime = new Date(`${currentClassDate.date}T${currentClassDate.endTime}`);
    
        // 5 minutes before and 5 minutes after the start time
        const checkInStart = new Date(startTime.getTime() - 5 * 60 * 1000); // 5 minutes before start
        const checkInEnd = new Date(startTime.getTime() + 5 * 60 * 1000); // 5 minutes after start
    
        // If we're within the 5 minutes before or 5 minutes after the start time
        if (now >= checkInStart && now <= checkInEnd) {
          return 'green'; // Green if within the 5-minute window
        }
    
        // If we're between 5 minutes after the start time and the end time
        if (now > checkInEnd && now < endTime) {
          return 'yellow'; // Yellow if between the start+5 and the end time
        }
    
        return 'gray'; // Default gray if outside the check-in window
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
        <p>Location: {currentClass ? `(${currentClass.location[0]}, ${currentClass.location[1]})` : 'N/A'}</p>
        <p>{nextClassDate && `Next Class: ${nextClassDate.date} ${nextClassDate.startTime}–${nextClassDate.endTime}`}</p>
        <p>Total Money in Pot: ${currentClass?.total}</p>
        </div>

      <CheckInButton 
        isCheckedIn={isCheckedIn} 
        onCheckIn={handleCheckIn} 
        location={[44.5678943, -123.2796066]} 
        buttonColor={getButtonColor()} 
        bypassLocation={true} />

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
