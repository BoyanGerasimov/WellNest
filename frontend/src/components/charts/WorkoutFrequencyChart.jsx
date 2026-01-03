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
  if (!workouts || workouts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-64 flex items-center justify-center">
        <p className="text-slate-500">No workout data available yet</p>
      </div>
    );
  }

  // Group workouts by date
  const dateMap = new Map();
  workouts.forEach(workout => {
    const date = new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });

  const sortedData = Array.from(dateMap.entries())
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .slice(-7); // Last 7 days

  const labels = sortedData.map(([date]) => date);
  const data = sortedData.map(([, count]) => count);

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
          color: '#6B7280'
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
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 h-80">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">Workout Frequency</h3>
        <p className="text-sm text-slate-500 mt-1">Last 7 days activity</p>
      </div>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default WorkoutFrequencyChart;

