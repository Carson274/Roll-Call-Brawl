import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';


function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [newClassName, setNewClassName] = useState('');

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewClassName('');
  };

  const handleAddClass = () => {
    if (newClassName.trim()) {
      setClasses([...classes, newClassName]);
      handleCloseModal();
    }
  };

  return (
    <div className="homepage">
      <h1>Roll Call Brawl</h1>
      <p>$52.31</p>
      <div className="classes-header">
        <h3>Classes</h3>
        <button className="add-class-circle" onClick={handleOpenModal}>+</button>
      </div>
      <ul>
        {classes.map((className, index) => (
          <li key={index}>
            <Link to={`/class/${className.replace(/\s+/g, '')}`}>{className}</Link>
          </li>
        ))}
      </ul>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add a New Class</h3>
            <input
              type="text"
              placeholder="Enter class name"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={handleCloseModal}>Cancel</button>
              <button onClick={handleAddClass}>Add Class</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;