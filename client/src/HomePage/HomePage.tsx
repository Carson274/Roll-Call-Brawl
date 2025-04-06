import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AddClassModal from './components/AddClassModal';
import './HomePage.css';

function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);

  const handleAddClass = (newClass) => {
    setClasses([...classes, newClass]);
  };

  return (
    <div className="homepage">
      <h1>Roll Call Brawl</h1>
      <p>$52.31</p>
      <div className="classes-header">
        <h3>Classes</h3>
        <button className="add-class-circle" onClick={() => setIsModalOpen(true)}>+</button>
      </div>
      <ul className="class-list">
        {classes.map((classItem, index) => (
          <li key={index}>
            <Link to={`/class/${classItem.name.replace(/\s+/g, '').toLowerCase()}`}>
              {classItem.name} - {classItem.location} - ${classItem.rate}/person
            </Link>
          </li>
        ))}
        {classes.length === 0 && (
          <li className="empty-classes">No classes yet. Add your first class!</li>
        )}
      </ul>

      {isModalOpen && (
        <AddClassModal
          onClose={() => setIsModalOpen(false)}
          onAddClass={handleAddClass}
        />
      )}
    </div>
  );
}

export default HomePage;