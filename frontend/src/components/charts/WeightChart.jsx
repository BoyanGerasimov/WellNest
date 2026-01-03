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
        <p className="text-slate-500">Update your weight in profile to see progress</p>
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
        borderColor: 'rgb(20, 184, 166)',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(20, 184, 166)',
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
        beginAtZero: false,
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
          text: 'Weight (kg)',
          font: {
            size: 12,
            weight: '600'
          },
          color: '#374151'
        }
      }
    }
  };

  if (!user || !user.currentWeight) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-8 h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-3">⚖️</div>
          <p className="text-slate-500 font-medium">Update your weight in profile to see progress</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 h-80">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">Weight Progress</h3>
        <p className="text-sm text-slate-500 mt-1">Current vs Goal Weight</p>
      </div>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default WeightChart;

