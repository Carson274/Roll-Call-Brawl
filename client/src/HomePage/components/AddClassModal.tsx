import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AddClassModal.css';

interface AddClassModalProps {
  onClose: () => void;
  onAddClass: (newClass: {
    name: string;
    rate: string;
    location: string;
    date: string;
    days: { [key: string]: boolean };
    repeatUntil: string;
  }) => void;
}

const AddClassModal: React.FC<AddClassModalProps> = ({ onClose, onAddClass }) => {
  const [newClassName, setNewClassName] = useState('');
  const [rate, setRate] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [repeatUntil, setRepeatUntil] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState({
    Sun: false,
    Mon: false,
    Tue: false,
    Wed: false,
    Thu: false,
    Fri: false,
    Sat: false,
  });

  const handleDaySelect = (day: string) => {
    setSelectedDays({
      ...selectedDays,
      [day]: !selectedDays[day],
    });
  };

  const handleAddClass = () => {
    if (newClassName.trim() && rate.trim() && location.trim()) {
      onAddClass({
        name: newClassName,
        rate,
        location,
        date: startDate.toLocaleString(),
        days: selectedDays,
        repeatUntil: repeatUntil.toLocaleString(),
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
            <label htmlFor="class-name">Class Name</label>
            <input
                id="class-name"
                type="text"
                placeholder="Enter class name"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
            />
            </div>

            <div className="input-group">
            <label htmlFor="rate">Rate per Person</label>
            <div className="price-input">
                <span className="currency-symbol">$</span>
                <input
                id="rate"
                type="text"
                placeholder="0.00"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                />
            </div>
            </div>

            <div className="input-group">
            <label htmlFor="location">Location</label>
            <input
                id="location"
                type="text"
                placeholder="Enter location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
            />
            </div>

            <div className="input-group date-group">
            <label htmlFor="date-time">Date and Time</label>
            <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date || new Date())}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMM d, yyyy h:mm aa"
            className="custom-datepicker"
            calendarClassName="custom-datepicker"
            popperClassName="custom-popper"
            placeholderText="Select date and time"
            />
            </div>

            <div className="recurring-options">
            <div className="input-group">
                <label>Select Days</label>
                <div className="weekday-select">
                {Object.keys(selectedDays).map((day) => (
                    <div
                    key={day}
                    className={`day-circle ${selectedDays[day] ? 'active' : ''}`}
                    onClick={() => handleDaySelect(day)}
                    >
                    {day.charAt(0)}
                    </div>
                ))}
                </div>
            </div>

            <div className="input-group date-group">
                <label htmlFor="repeat-until">Repeat Until</label>
                <DatePicker
                selected={repeatUntil}
                onChange={(date) => setRepeatUntil(date || new Date())}
                className="custom-datepicker"
                calendarClassName="custom-datepicker"
                popperClassName="custom-popper"
                minDate={startDate}
                dateFormat="MMM d, yyyy"
                placeholderText="Select end date"
                />
            </div>
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