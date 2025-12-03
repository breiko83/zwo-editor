import React, { useState, useEffect, useRef } from 'react';
import './TimePicker.css';

interface TimePickerProps {
  value?: { format: (format: string) => string };
  placeholder?: string;
  className?: string;
  onChange: (value: { format: (format: string) => string } | null) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, placeholder = "00:00:00", className, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const [seconds, setSeconds] = useState('00');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const timeString = value.format("HH:mm:ss");
      const [h, m, s] = timeString.split(':');
      setHours(h);
      setMinutes(m);
      setSeconds(s);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTimeChange = (newHours: string, newMinutes: string, newSeconds: string) => {
    setHours(newHours);
    setMinutes(newMinutes);
    setSeconds(newSeconds);

    const timeString = `${newHours}:${newMinutes}:${newSeconds}`;
    onChange({
      format: (format: string) => timeString
    });
  };

  const displayValue = value ? value.format("HH:mm:ss") : '';

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHours('00');
    setMinutes('00');
    setSeconds('00');
    onChange(null);
    setIsOpen(false);
  };

  return (
    <div className={`time-picker ${className || ''}`} ref={containerRef}>
      <input
        type="text"
        value={displayValue}
        placeholder={placeholder}
        readOnly
        onClick={() => setIsOpen(!isOpen)}
        className="time-picker-input"
      />
      {displayValue && (
        <span className="time-picker-clear" onClick={handleClear}>
          ×
        </span>
      )}
      {isOpen && (
        <div className="time-picker-panel">
          <div className="time-picker-panel-inner">
            <div className="time-picker-panel-selects">
              <TimeColumn
                value={parseInt(hours)}
                max={23}
                onChange={(val) => handleTimeChange(val.padStart(2, '0'), minutes, seconds)}
              />
              <TimeColumn
                value={parseInt(minutes)}
                max={59}
                onChange={(val) => handleTimeChange(hours, val.padStart(2, '0'), seconds)}
              />
              <TimeColumn
                value={parseInt(seconds)}
                max={59}
                onChange={(val) => handleTimeChange(hours, minutes, val.padStart(2, '0'))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface TimeColumnProps {
  value: number;
  max: number;
  onChange: (value: string) => void;
}

const TimeColumn: React.FC<TimeColumnProps> = ({ value, max, onChange }) => {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (listRef.current) {
      const selectedItem = listRef.current.querySelector('.time-picker-panel-select-option-selected');
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [value]);

  return (
    <div className="time-picker-panel-select">
      <ul ref={listRef}>
        {Array.from({ length: max + 1 }, (_, i) => (
          <li
            key={i}
            className={`time-picker-panel-select-option ${i === value ? 'time-picker-panel-select-option-selected' : ''}`}
            onClick={() => onChange(i.toString())}
          >
            {i.toString().padStart(2, '0')}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TimePicker;
