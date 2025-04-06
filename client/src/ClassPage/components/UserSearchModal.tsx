import React, { useState, useEffect } from 'react';
import './UserSearchModal.css';
import { User } from '../../types'; // Only import User type here

interface UserSearchModalProps {
  onClose: () => void;
  onSelectUser: (username: string) => void; // Changed to just pass username
  excludedUsernames?: string[]; // Now expects usernames directly
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({
  onClose,
  onSelectUser,
  excludedUsernames = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_GET_ALL_USERS_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Filter out excluded users immediately
        const filteredUsers = data.users.filter((user: User) => 
          !excludedUsernames.includes(user.username)
        );
        
        setAllUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, [excludedUsernames]);

  const filteredUsers = searchTerm 
    ? allUsers.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allUsers;

  const handleSelectUser = (username: string) => {
    onSelectUser(username);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Add User</h3>
        <input
          type="text"
          placeholder="Search for a user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ul className="search-results">
          {loading ? (
            <li>Loading users...</li>
          ) : error ? (
            <li className="error">{error}</li>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <li key={index} onClick={() => handleSelectUser(user.username)}>
                {user.username}
              </li>
            ))
          ) : searchTerm ? (
            <li>No users found matching "{searchTerm}"</li>
          ) : (
            <li>No users available to add</li>
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