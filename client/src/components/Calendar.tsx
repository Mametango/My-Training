import React from 'react';
import Calendar from 'react-calendar';
import { Workout } from '../types';

interface CalendarProps {
  selectedDate: Date;
  workouts: Workout[];
  onDateChange: (value: any) => void;
}

const CalendarComponent: React.FC<CalendarProps> = ({
  selectedDate,
  workouts,
  onDateChange,
}) => {
  // Get unique dates that have workouts
  const workoutDates = Array.from(new Set(workouts.map(w => w.date)));

  // Custom tile content to show workout indicators
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0];
      const hasWorkout = workoutDates.includes(dateString);
      
      return (
        <div className="relative h-full w-full">
          {hasWorkout && <div className="workout-indicator" />}
        </div>
      );
    }
    return null;
  };

  // Show only day numbers without "日" suffix
  const formatDay = (locale: string | undefined, date: Date) => {
    return date.getDate().toString();
  };

  // Hide weekday headers
  const formatShortWeekday = () => '';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">カレンダー</h2>
      <Calendar
        onChange={onDateChange}
        value={selectedDate}
        tileContent={tileContent}
        formatDay={formatDay}
        formatShortWeekday={formatShortWeekday}
        calendarType="US"
        className="w-full"
        locale="ja-JP"
      />
      <div className="mt-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>トレーニング記録あり</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent; 