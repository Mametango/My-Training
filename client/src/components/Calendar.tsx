import React, { useState, useRef, useCallback, useMemo } from 'react';
import Calendar from 'react-calendar';
import { Workout } from '../types';
import { getJSTDateString } from '../utils/dateUtils';
import * as japaneseHolidays from 'japanese-holidays';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const { t, language } = useLanguage();
  // currentViewをselectedDateから直接計算するように変更
  const currentView = useMemo(() => {
    const date = new Date(selectedDate);
    date.setDate(1);
    return date;
  }, [selectedDate]);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Get unique dates that have workouts
  const workoutDates = Array.from(new Set(workouts.map(w => w.date)));

  // 曜日の英語表記
  const weekdays = language === 'ja' 
    ? ['日', '月', '火', '水', '木', '金', '土']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // selectedDateが変更されたときにcurrentViewを同期（useMemoで自動計算されるため削除）



  // スワイプ検出のためのタッチイベントハンドラー
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(false);
    setSwipeDirection(null);
    setSwipeProgress(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
    
    // 縦方向のスワイプを無視（スクロールを妨げないため）
    const deltaX = Math.abs(touchEndX.current - touchStartX.current);
    const deltaY = Math.abs(touchEndY.current - touchStartY.current);
    
    if (deltaX > deltaY && deltaX > 20) {
      setIsSwiping(true);
      
      // スワイプ方向と進行度を計算
      const direction = touchEndX.current > touchStartX.current ? 'right' : 'left';
      const progress = Math.min(Math.abs(deltaX) / 150, 1); // 最大150pxで100%
      
      setSwipeDirection(direction);
      setSwipeProgress(progress);
      
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping || !touchStartX.current || !touchEndX.current) {
      touchStartX.current = 0;
      touchEndX.current = 0;
      setSwipeProgress(0);
      setSwipeDirection(null);
      return;
    }

    const deltaX = touchEndX.current - touchStartX.current;
    const minSwipeDistance = 80; // スワイプ距離を増加

    if (Math.abs(deltaX) > minSwipeDistance && swipeProgress > 0.3) {
      setIsAnimating(true);
      
      const newDate = new Date(currentView);
      
      if (deltaX > 0) {
        // 右スワイプ → 前月
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        // 左スワイプ → 翌月
        newDate.setMonth(newDate.getMonth() + 1);
      }
      
      // アニメーション完了後に状態を更新
      setTimeout(() => {
        // 新しい月の同じ日付を選択
        const newSelectedDate = new Date(newDate);
        const maxDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
        const selectedDay = Math.min(selectedDate.getDate(), maxDay);
        newSelectedDate.setDate(selectedDay);
        onDateChange(newSelectedDate);
        setIsAnimating(false);
        setSwipeProgress(0);
        setSwipeDirection(null);
      }, 300);
    } else {
      // スワイプが不十分な場合は元に戻す
      setSwipeProgress(0);
      setSwipeDirection(null);
    }

    // リセット
    touchStartX.current = 0;
    touchEndX.current = 0;
    setIsSwiping(false);
  }, [isSwiping, currentView, swipeProgress, onDateChange, selectedDate]);

  // マウスイベントハンドラー（デスクトップ対応）
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    setIsSwiping(false);
    setSwipeDirection(null);
    setSwipeProgress(0);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!touchStartX.current) return;
    
    touchEndX.current = e.clientX;
    touchEndY.current = e.clientY;
    
    // 縦方向のスワイプを無視
    const deltaX = Math.abs(touchEndX.current - touchStartX.current);
    const deltaY = Math.abs(touchEndY.current - touchStartY.current);
    
    if (deltaX > deltaY && deltaX > 20) {
      setIsSwiping(true);
      
      // スワイプ方向と進行度を計算
      const direction = touchEndX.current > touchStartX.current ? 'right' : 'left';
      const progress = Math.min(Math.abs(deltaX) / 150, 1);
      
      setSwipeDirection(direction);
      setSwipeProgress(progress);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isSwiping || !touchStartX.current || !touchEndX.current) {
      touchStartX.current = 0;
      touchEndX.current = 0;
      setSwipeProgress(0);
      setSwipeDirection(null);
      return;
    }

    const deltaX = touchEndX.current - touchStartX.current;
    const minSwipeDistance = 80;

    if (Math.abs(deltaX) > minSwipeDistance && swipeProgress > 0.3) {
      setIsAnimating(true);
      
      const newDate = new Date(currentView);
      
      if (deltaX > 0) {
        // 右スワイプ → 前月
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        // 左スワイプ → 翌月
        newDate.setMonth(newDate.getMonth() + 1);
      }
      
      // アニメーション完了後に状態を更新
      setTimeout(() => {
        // 新しい月の同じ日付を選択
        const newSelectedDate = new Date(newDate);
        const maxDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
        const selectedDay = Math.min(selectedDate.getDate(), maxDay);
        newSelectedDate.setDate(selectedDay);
        onDateChange(newSelectedDate);
        setIsAnimating(false);
        setSwipeProgress(0);
        setSwipeDirection(null);
      }, 300);
    } else {
      // スワイプが不十分な場合は元に戻す
      setSwipeProgress(0);
      setSwipeDirection(null);
    }

    // リセット
    touchStartX.current = 0;
    touchEndX.current = 0;
    setIsSwiping(false);
  }, [isSwiping, currentView, swipeProgress, onDateChange, selectedDate]);

  // 月の移動ハンドラー（useMemoで自動計算されるため削除）
  const handleActiveStartDateChange = useCallback(({ activeStartDate }: { activeStartDate: Date | null }) => {
    if (activeStartDate) {
      // currentViewはuseMemoで自動計算されるため、ここでは何もしない
    }
  }, []);

  // tileClassNameで記録ありの日付に青丸を付与、今日の日付を強調、土日を色分け
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateString = getJSTDateString(date);
      const today = getJSTDateString(new Date());
      const selected = getJSTDateString(selectedDate);
      const isToday = dateString === today;
      const isSelected = dateString === selected;
      const hasWorkout = workoutDates.includes(dateString);
      
      // 土日の判定
      const dayOfWeek = date.getDay();
      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6;
      
      // 祝日の判定
      const holiday = japaneseHolidays.isHoliday(date);
      const isHoliday = Boolean(holiday);
      
      let className = 'relative';
      
      // 今日の日付のスタイル
      if (isToday) {
        className += ' bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold shadow-lg';
        className += ' transform scale-110 z-10';
      }
      
      // 選択された日付のスタイル
      if (isSelected && !isToday) {
        className += ' bg-blue-500 text-white font-bold shadow-md';
        className += ' transform scale-105 z-5';
      }
      
      // 記録ありの日付のスタイル
      if (hasWorkout && !isToday && !isSelected) {
        className += ' bg-blue-100 border-2 border-blue-300';
      }
      
      // 土日・祝日の色分けを追加
      if (isSunday || isHoliday) {
        if (!isToday && !isSelected) {
          className += ' text-red-500';
        }
      } else if (isSaturday) {
        if (!isToday && !isSelected) {
          className += ' text-blue-500';
        }
      }
      
      return className;
    }
    return '';
  };

  // Show only day numbers without "日" suffix
  const formatDay = (locale: string | undefined, date: Date) => {
    return date.getDate().toString();
  };

  // スワイプオーバーレイのスタイル
  const getSwipeOverlayStyle = () => {
    if (!isSwiping || !swipeDirection) return {};
    
    const opacity = swipeProgress * 0.3;
    const transform = swipeDirection === 'right' 
      ? `translateX(${swipeProgress * 100}%)` 
      : `translateX(-${swipeProgress * 100}%)`;
    
    return {
      opacity,
      transform,
      transition: 'all 0.1s ease-out'
    };
  };

  // カレンダーコンテナのスタイル
  const getCalendarContainerStyle = () => {
    if (isAnimating) {
      return {
        transform: swipeDirection === 'right' ? 'translateX(-100%)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out'
      };
    }
    return {
      transform: 'translateX(0)',
      transition: 'transform 0.3s ease-in-out'
    };
  };

  // 今日の日付を取得
  const today = new Date();
  const isCurrentMonth = currentView.getMonth() === today.getMonth() && 
                        currentView.getFullYear() === today.getFullYear();

  return (
    <div className="relative bg-white rounded-lg shadow-lg p-2 overflow-hidden">
      {/* スワイプオーバーレイ */}
      {isSwiping && swipeDirection && (
        <div 
          className={`absolute inset-0 z-10 pointer-events-none ${
            swipeDirection === 'right' ? 'bg-blue-500' : 'bg-green-500'
          } rounded-lg`}
          style={getSwipeOverlayStyle()}
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-lg font-bold">
              {swipeDirection === 'right' ? (
                <div className="flex items-center gap-2">
                  <ChevronLeft size={24} />
                  <span>{language === 'ja' ? '前月' : 'Prev'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{language === 'ja' ? '翌月' : 'Next'}</span>
                  <ChevronRight size={24} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* スワイプ進行度インジケーター */}
      {isSwiping && swipeProgress > 0.1 && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-gray-200 rounded-full h-1 w-16">
            <div 
              className={`h-full rounded-full transition-all duration-100 ${
                swipeDirection === 'right' ? 'bg-blue-500' : 'bg-green-500'
              }`}
              style={{ width: `${swipeProgress * 100}%` }}
            />
          </div>
        </div>
      )}

      <div 
        ref={calendarRef}
        className="w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ touchAction: 'pan-y' }}
      >
        <div className="w-full">
          {/* カスタム曜日ヘッダー */}
          <div className="grid grid-cols-7 text-xs font-bold text-gray-700 py-2 border-b border-gray-200">
            {weekdays.map((day, index) => (
              <div 
                key={day}
                className={`text-center ${
                  index === 0 ? 'text-red-500' : 
                  index === 6 ? 'text-blue-500' : 
                  'text-gray-600'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
          <div 
            className="w-full"
            style={getCalendarContainerStyle()}
          >
            <Calendar
              onChange={onDateChange}
              value={selectedDate}
              activeStartDate={currentView}
              onActiveStartDateChange={handleActiveStartDateChange}
              formatDay={formatDay}
              calendarType="gregory"
              locale={language === 'ja' ? 'ja-JP' : 'en-US'}
              tileClassName={tileClassName}
              className="w-full text-xs min-h-[280px] [&_.react-calendar__month-view__weekdays]:hidden [&_.react-calendar__tile]:p-1 [&_.react-calendar__tile]:m-0 [&_.react-calendar__tile]:h-8 [&_.react-calendar__tile]:w-full [&_.react-calendar__tile]:text-xs [&_.react-calendar__tile--active]:bg-blue-500 [&_.react-calendar__tile--active]:text-white [&_.react-calendar__tile--now]:bg-yellow-100 [&_.react-calendar__tile--now]:border [&_.react-calendar__tile--now]:border-yellow-400 [&_.react-calendar__month-view__days__day]:text-xs [&_.react-calendar__month-view__days__day]:h-8 [&_.react-calendar__month-view__days__day]:w-full [&_.react-calendar__tile--today]:bg-green-100 [&_.react-calendar__tile--today]:border-2 [&_.react-calendar__tile--today]:border-green-400 [&_.react-calendar__tile--today]:font-bold [&_.react-calendar__tile--today-workout]:bg-green-100 [&_.react-calendar__tile--today-workout]:border-2 [&_.react-calendar__tile--today-workout]:border-green-400 [&_.react-calendar__tile--today-workout]:font-bold [&_.react-calendar__tile--today-workout]:relative [&_.react-calendar__tile--today-workout]:after:content-[''] [&_.react-calendar__tile--today-workout]:after:absolute [&_.react-calendar__tile--today-workout]:after:top-0 [&_.react-calendar__tile--today-workout]:after:right-0 [&_.react-calendar__tile--today-workout]:after:w-2 [&_.react-calendar__tile--today-workout]:after:h-2 [&_.react-calendar__tile--today-workout]:after:bg-blue-500 [&_.react-calendar__tile--today-workout]:after:rounded-full [&_.react-calendar__tile--weekend]:text-red-500 [&_.react-calendar__tile--saturday]:text-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* 今日の日付インジケーター */}
      {isCurrentMonth && (
        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-600">
          <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
          <span>{language === 'ja' ? '今日' : 'Today'}</span>
        </div>
      )}
      
      {/* スワイプヒント */}
      <div className="text-xs text-gray-500 text-center mt-2 opacity-60 flex items-center justify-center gap-2">
        <ChevronLeft size={12} />
        <span>{t('calendar.swipeHint')}</span>
        <ChevronRight size={12} />
      </div>
    </div>
  );
};

export default CalendarComponent;

// tailwindで青丸を付与するカスタムクラスをグローバルCSSに追加する必要あり
// .react-calendar__tile--workout-day { @apply relative after:content-[''] after:absolute after:top-0 after:right-0 after:w-2 after:h-2 after:bg-blue-500 after:rounded-full !important; } 