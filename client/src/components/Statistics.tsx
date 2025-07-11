import React from 'react';
import { Statistics as StatisticsType } from '../types';

interface StatisticsProps {
  statistics: StatisticsType[];
  startDate: string;
  endDate: string;
}

const Statistics: React.FC<StatisticsProps> = ({ statistics, startDate, endDate }) => {
  const totalWorkouts = statistics.reduce((sum, stat) => sum + stat.workout_count, 0);
  const totalWeight = statistics.reduce((sum, stat) => sum + (stat.total_reps * stat.avg_weight), 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">統計</h2>
      
      <div className="mb-4 text-sm text-gray-600">
        <p>期間: {startDate} 〜 {endDate}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalWorkouts}</div>
          <div className="text-sm text-blue-800">総トレーニング数</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{totalWeight.toFixed(1)}</div>
          <div className="text-sm text-green-800">総重量 (kg)</div>
        </div>
      </div>

      <div className="space-y-3">
        {statistics.map((stat) => (
          <div key={stat.muscle_group} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800">{stat.muscle_group}</h3>
              <span className="text-sm text-gray-600">{stat.workout_count}回</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">総回数: </span>
                <span className="font-medium">{stat.total_reps}回</span>
              </div>
              <div>
                <span className="text-gray-600">平均重量: </span>
                <span className="font-medium">{stat.avg_weight.toFixed(1)}kg</span>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-gray-600 text-sm">総重量: </span>
              <span className="text-blue-600 font-bold text-sm">
                {(stat.total_reps * stat.avg_weight).toFixed(1)}kg
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistics; 