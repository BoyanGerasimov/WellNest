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
        <p className="text-gray-500">No workout data available yet</p>
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
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1
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
        display: true,
        text: 'Workout Frequency (Last 7 Days)'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        title: {
          display: true,
          text: 'Number of Workouts'
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default WorkoutFrequencyChart;

