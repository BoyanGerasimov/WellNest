import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WorkoutFrequencyChart = ({ workouts }) => {
  // Generate date range for last 7 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateMap = new Map();
  
  // Initialize all dates in the range with 0 values
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format for consistent sorting
    dateMap.set(dateKey, { 
      dateKey, 
      date: new Date(date), 
      count: 0 
    });
  }

  // Group workouts by date
  if (workouts && workouts.length > 0) {
    workouts.forEach(workout => {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      const dateKey = workoutDate.toISOString().split('T')[0];
      if (dateMap.has(dateKey)) {
        dateMap.get(dateKey).count += 1;
      }
    });
  }

  // Sort by date and format labels
  const sortedData = Array.from(dateMap.values())
    .sort((a, b) => a.date - b.date);

  const labels = sortedData.map(d => d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  const data = sortedData.map(d => d.count);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Workouts',
        data: data,
        backgroundColor: 'rgba(20, 184, 166, 0.8)',
        borderColor: 'rgba(20, 184, 166, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
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
          minRotation: 0
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
          stepSize: 1,
          font: {
            size: 11
          },
          color: '#6B7280'
        },
        title: {
          display: true,
          text: 'Number of Workouts',
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

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">Workout Frequency</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Last 7 days activity</p>
      </div>
      <div className="h-64 w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default WorkoutFrequencyChart;

