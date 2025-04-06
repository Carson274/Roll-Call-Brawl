import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AddClassModal.css';
import { Building } from "../../types";

interface AddClassModalProps {
  onClose: () => void;
  onAddClass: (newClass: {
    title: string;
    location: [number, number];
    total: number;
    dates: { date: string; startTime: string; endTime: string }[];
    students: [];
    numberOfClasses: number;
  }) => void;
}

import.meta.env.VITE_GET_BUILDINGS_URL

const AddClassModal: React.FC<AddClassModalProps> = ({ onClose, onAddClass }) => {
  const [title, setTitle] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [buildings, setBuildings] = useState<Building[]>([]);

  // Fetch buildings from the server
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_GET_BUILDINGS_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        
        if (data.buildings) {
          setBuildings(data.buildings);
          console.log('Fetched buildings:', data.buildings);
        } else {
          console.warn('Unexpected response format:', data);
        }
      } catch (error) {
        console.error('Error fetching buildings:', error);
      }
    };
    
    fetchBuildings();
  }, []);

  const handleAddClass = () => {
    if (title.trim() && total > 0 && selectedBuilding) {
      onAddClass({
        title,
        location: selectedBuilding.location,
        total,
        dates: [
          {
            date: startDate.toLocaleDateString(),
            startTime: startDate.toLocaleTimeString(),
            endTime: endDate.toLocaleTimeString(),
          },
        ],
        students: [],
        numberOfClasses: 1,
      });
      onClose();
    }
  };

  return (
    <div className="add-class-modal">
      <div className="modal" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h3>Add a New Class</h3>
          <div className="input-group">
            <label htmlFor="title">Class Title</label>
            <input
              id="title"
              type="text"
              placeholder="Enter class title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="building">Building</label>
            <select
              id="building"
              value={selectedBuilding?.name || ''}
              onChange={(e) => {
                const building = buildings.find((b) => b.name === e.target.value);
                setSelectedBuilding(building || null);
              }}
            >
              <option value="" disabled>
                Select a building
              </option>
              {buildings.map((building) => (
                <option key={building.name} value={building.name}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="total">Total Cost</label>
            <input
              id="total"
              type="number"
              placeholder="Enter total cost"
              value={total}
              onChange={(e) => setTotal(parseFloat(e.target.value))}
            />
          </div>
          <div className="input-group">
            <label htmlFor="start-date">Start Date and Time</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date || new Date())}
              showTimeSelect
              dateFormat="Pp"
            />
          </div>
          <div className="input-group">
            <label htmlFor="end-date">End Date and Time</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date || new Date())}
              showTimeSelect
              dateFormat="Pp"
            />
          </div>
          <div className="modal-actions">
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="add-btn" onClick={handleAddClass}>
              Add Class
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddClassModal;