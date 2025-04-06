import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AddClassModal.css';
import { Building } from "../../types";

interface AddClassModalProps {
  onClose: () => void;
  username: string;
}

const AddClassModal: React.FC<AddClassModalProps> = ({ onClose, username }) => {
  const [title, setTitle] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [buildings, setBuildings] = useState<Building[]>([]);

  const [total, setTotal] = useState<number>(0);

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

  const handleAddClass = async () => {
    if (!title || !selectedBuilding || !total || total <= 0) {
      alert('Please fill in all fields correctly.');
      return;
    }
  
    // Generate class dates between start and end date
    const dates = [];
    const currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    while (currentDate <= endDateObj) {
      dates.push({
        date: currentDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().substring(0, 5),
        endTime: endDate.toTimeString().substring(0, 5),
        attended: false
      });
      currentDate.setDate(currentDate.getDate() + 7); // Weekly classes
    }
  
    try {
      const response = await fetch(import.meta.env.VITE_CREATE_CLASS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          location: selectedBuilding.location,
          total: Number(total), // Ensure it's a number
          dates,
          username,
          building: selectedBuilding.name
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create class');
      }
  
      alert('Class added successfully!');
      onClose();
    } catch (error) {
      console.error('Error adding class:', error);
      alert(error instanceof Error ? error.message : 'Error adding class');
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