import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarComponentProps {
  value?: string;
  onChange: (date: string) => void;
}

export function CalendarComponent({ value, onChange }: CalendarComponentProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const selectedDate = value ? new Date(value) : null;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const selectDate = (date: Date) => {
    onChange(date.toISOString().split('T')[0]);
  };

  const renderCalendarDays = () => {
    const days = [];
    
    for (let i = 0; i < 42; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = cellDate.getMonth() === currentDate.getMonth();
      const isPast = cellDate < today;
      const isSelected = selectedDate && cellDate.toDateString() === selectedDate.toDateString();
      
      days.push(
        <button
          key={i}
          type="button"
          onClick={() => !isPast && isCurrentMonth && selectDate(cellDate)}
          disabled={isPast || !isCurrentMonth}
          className={`
            w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-colors
            ${!isCurrentMonth ? 'text-gray-400 cursor-not-allowed' : ''}
            ${isPast && isCurrentMonth ? 'text-gray-400 cursor-not-allowed' : ''}
            ${isSelected ? 'bg-primary text-white' : ''}
            ${!isPast && isCurrentMonth && !isSelected ? 'text-gray-900 hover:bg-gray-100' : ''}
          `}
        >
          {cellDate.getDate()}
        </button>
      );
    }
    
    return days;
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h4 className="text-lg font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {renderCalendarDays()}
      </div>
    </div>
  );
}
