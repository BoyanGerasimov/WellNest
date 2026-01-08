import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { ChartIcon } from '../icons/Icons';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CalorieChart = ({ mealStats, workoutStats }) => {
  // Combine meal and workout data by date
  const dateMap = new Map();

  // Add meal calories (intake)
  if (mealStats?.meals) {
    mealStats.meals.forEach(meal => {
      const date = new Date(meal.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dateMap.has(date)) {
        dateMap.set(date, { date, intake: 0, burned: 0 });
      }
      dateMap.get(date).intake += meal.totalCalories || 0;
    });
  }

  // Add workout calories (burned)
  if (workoutStats?.workouts) {
    workoutStats.workouts.forEach(workout => {
      const date = new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dateMap.has(date)) {
        dateMap.set(date, { date, intake: 0, burned: 0 });
      }
      dateMap.get(date).burned += workout.caloriesBurned || 0;
    });
  }

  const sortedData = Array.from(dateMap.values()).sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  const labels = sortedData.map(d => d.date);
  const intakeData = sortedData.map(d => Math.round(d.intake));
  const burnedData = sortedData.map(d => Math.round(d.burned));

  const data = {
    labels,
    datasets: [
      {
        label: 'Calories Intake',
        data: intakeData,
        borderColor: 'rgb(20, 184, 166)',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(20, 184, 166)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true
      },
      {
        label: 'Calories Burned',
        data: burnedData,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 13
        },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6B7280',
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        },
        padding: {
          bottom: 10
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6B7280'
        },
        title: {
          display: true,
          text: 'Calories',
          font: {
            size: 12,
            weight: '600'
          },
          color: '#374151'
        },
        padding: {
          top: 10
        }
      }
    }
  };

  if (labels.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-8 h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <ChartIcon className="w-16 h-16" />
          </div>
          <p className="text-slate-500 font-medium">No calorie data available yet</p>
          <p className="text-sm text-slate-400 mt-1">Start logging meals and workouts to see your progress</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">Calorie Intake vs Burned</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Track your daily calorie balance</p>
      </div>
      <div className="h-64 w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default CalorieChart;

