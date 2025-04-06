// src/components/AddUserModal.tsx
import React, { useState } from 'react';
import './UserSearchModal.css';

interface UserSearchModalProps {
  onClose: () => void;
  onSelectUser: (name: string) => void;
  excludedUsers?: string[];
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
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = allUsers.filter(
    (user) =>
      user.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !excludedUsers.includes(user)
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
                {user}
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
