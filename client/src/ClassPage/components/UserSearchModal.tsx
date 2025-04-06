import React, { useState, useEffect } from 'react';
import './UserSearchModal.css';
import { Classmate } from '../../types';

interface UserSearchModalProps {
  onClose: () => void;
  onSelectUser: (competitor: Classmate) => void;
  excludedUsers?: Classmate[];
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({
  onClose,
  onSelectUser,
  excludedUsers = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<Classmate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_GET_ALL_USERS_URL);
        const data = await response.json();
        setAllUsers(data.users); // assuming the response is { users: Classmate[] }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  const filteredUsers = allUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !excludedUsers.some((excludedUser) => excludedUser.username === user.username)
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
          {loading ? (
            <li>Loading users...</li>
          ) : filteredUsers.length > 0 ? (
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
