import React, { useState } from 'react';
import './UserSearchModal.css';
import { Classmate } from '../../types'; 


interface UserSearchModalProps {
  onClose: () => void;
  onSelectUser: (competitor: Classmate) => void;
  excludedUsers?: Classmate[]; // Users already in the class
  allUsers: Classmate[];
}

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

const UserSearchModal: React.FC<UserSearchModalProps> = ({
  onClose,
  onSelectUser,
  excludedUsers = [],
  allUsers,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = allUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) && // Filter by username
      !excludedUsers.some((excludedUser) => excludedUser.username === user.username) // Exclude already added users
  );
  
  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Add Competitor</h3>
        <input
          type="text"
          placeholder="Search for a user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ul className="search-results">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <li key={index} onClick={() => onSelectUser(user)}>
                {user.username}
              </li>
            ))
          ) : (
            <li>No users found</li>
          )}
        </ul>
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
