import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AddClassModal.css';
import { Building } from "../../types";

const buildings: Building[] = [
  { name: 'Building A', location: [40.7128, -74.0060] },
  { name: 'Building B', location: [34.0522, -118.2437] },
  { name: 'Building C', location: [51.5074, -0.1278] },
];

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

const AddClassModal: React.FC<AddClassModalProps> = ({ onClose, onAddClass }) => {
  const [title, setTitle] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleAddClass = () => {
    if (title.trim() && total > 0 && selectedBuilding) {
      onAddClass({
        title,
        location: selectedBuilding.location, // Use the selected building's location
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