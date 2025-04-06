import { useState } from 'react';
import { useParams } from 'react-router-dom';
import './ClassPage.css';
import UserSearchModal from './components/UserSearchModal';
import CheckInButton from './components/CheckInButton';

function ClassPage() {
  const { classId } = useParams<{ classId: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [competitors, setCompetitors] = useState<string[]>([
    'Carpettt',
    'Mitokongdrya',
    'Mokka',
    'Chat',
  ]);

  const handleAddCompetitor = (name: string) => {
    if (!competitors.includes(name)) {
      setCompetitors((prev) => [...prev, name]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="classpage">
    <h1>Class: {classId?.toUpperCase()}</h1>
    <CheckInButton />

      <h3>Competitors</h3>
      <ul>
        {competitors.map((competitor, index) => (
          <li key={index}>{competitor}</li>
        ))}
      </ul>
      <button onClick={() => setIsModalOpen(true)}>Add Competitor</button>

        {isModalOpen && (
        <UserSearchModal
            onClose={() => setIsModalOpen(false)}
            onSelectUser={handleAddCompetitor}
            excludedUsers={competitors}
        />
        )}
        </div>
        );
}

export default ClassPage;
