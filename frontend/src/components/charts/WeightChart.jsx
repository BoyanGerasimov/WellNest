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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WeightChart = ({ user }) => {
  // For now, we'll show current weight vs goal weight
  // In the future, this could show weight history if we add a weight tracking feature
  if (!user || !user.currentWeight) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-64 flex items-center justify-center">
        <p className="text-gray-500">Update your weight in profile to see progress</p>
      </div>
    );
  }

  // Create a simple chart showing current vs goal
  const labels = ['Current', 'Goal'];
  const weights = [user.currentWeight, user.goalWeight || user.currentWeight];

  const data = {
    labels,
    datasets: [
      {
        label: 'Weight (kg)',
        data: weights,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
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
        display: false
      },
      title: {
        display: true,
        text: 'Weight Progress'
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Weight (kg)'
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 h-64">
      <Line data={data} options={options} />
    </div>
  );
};

export default WeightChart;

