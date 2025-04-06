import { useState } from 'react';
import { useParams } from 'react-router-dom';
import './ClassPage.css';
import UserSearchModal from './components/UserSearchModal';

function ClassPage() {
  const { classId } = useParams<{ classId: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
      <h2>Welcome to the {classId?.toUpperCase()} class page!</h2>
      

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
