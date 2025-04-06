import { useState, useEffect } from 'react';
import AddClassModal from './components/AddClassModal';
import NotificationModal from './components/NotificationModal';
import './HomePage.css';
import { Class, User } from '../../../server/functions/src/types';

function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false); // State for notification modal
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  // Fetch user and their classes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data
        const userResponse = await fetch(import.meta.env.VITE_GET_USER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'carpettt' }),
        });

        if (!userResponse.ok) throw new Error('Failed to fetch user');
        const userData = await userResponse.json();

        if (!userData.user || !userData.user.classes) {
          throw new Error('Invalid user data structure');
        }

        setCurrentUser(userData.user);

        // Fetch classes if user has any
        if (userData.user.classes.length > 0) {
          const classesResponse = await fetch(import.meta.env.VITE_GET_CLASSES_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classIds: userData.user.classes }),
          });

          if (!classesResponse.ok) throw new Error('Failed to fetch classes');
          const classesData = await classesResponse.json();

          if (classesData.classes && Array.isArray(classesData.classes)) {
            setClasses(classesData.classes);
          } else {
            console.warn('Unexpected classes data structure:', classesData);
          }
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pendingInvites = 3; // Example pending invites count

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!currentUser) return <div>No user found</div>;

  return (
    <div className="homepage">
      <h1>Roll Call Brawl</h1>
      <p className="welcome-message">Welcome, {currentUser.username}!</p>
      <p>Balance: ${currentUser.balance.toFixed(2)}</p>

      <div className="classes-header">
        <h3>Classes</h3>
        <button className="add-class-circle" onClick={() => setIsModalOpen(true)}>+</button>
      </div>

      <div className="notification-bell">
        {/* This should be a simple bell icon component that triggers the modal */}
        <button onClick={() => setIsNotificationModalOpen(true)}>
          {/* Your bell icon here */}
          🔔
          {pendingInvites > 0 && <span className="badge">{pendingInvites}</span>}
        </button>
      </div>

      {isNotificationModalOpen && (
        <NotificationModal
          notifications={Array(pendingInvites).fill({})}
          onClose={() => setIsNotificationModalOpen(false)}
        />
      )}

      <ul className="class-list">
        {classes.map((classItem) => (
          <li key={classItem.id}>
            <button
              className="class-link"
              onClick={() => setSelectedClass(classItem)}
            >
              {classItem.title} - ${classItem.total}
            </button>
          </li>
        ))}
        {classes.length === 0 && (
          <li className="empty-classes">No classes yet. Add your first class!</li>
        )}
      </ul>

      {isModalOpen && (
        <AddClassModal
          onClose={() => setIsModalOpen(false)}
          username={currentUser.username}
        />
      )}

      {isNotificationModalOpen && (
        <NotificationModal
          notifications={Array(pendingInvites).fill({})}
          onClose={() => setIsNotificationModalOpen(false)}
        />
      )}
    </div>
  );
}

export default HomePage;