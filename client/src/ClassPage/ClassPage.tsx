import { useState } from 'react';
import { useParams } from 'react-router-dom';
import './ClassPage.css';

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

  const allUsers = [
    'Carpettt',
    'Mitokongdrya',
    'Mokka',
    'Chat',
    'Skyler',
    'Max',
    'Alex',
    'Nova',
    'Quinn',
    'Jordan',
  ];

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSearchTerm('');
  };

  const handleAddCompetitor = (name: string) => {
    if (!competitors.includes(name)) {
      setCompetitors([...competitors, name]);
    }
    handleCloseModal();
  };

  const filteredUsers = allUsers.filter(
    (user) =>
      user.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !competitors.includes(user)
  );

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

      <button onClick={handleOpenModal}>Add Competitor</button>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Competitor</h3>
            <input
              type="text"
              placeholder="Search for a name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul className="search-results">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <li key={index} onClick={() => handleAddCompetitor(user)}>
                    {user}
                  </li>
                ))
              ) : (
                <li>No users found</li>
              )}
            </ul>
            <div className="modal-actions">
              <button onClick={handleCloseModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassPage;
