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
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Calories Burned',
        data: burnedData,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Calorie Intake vs Burned'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Calories'
        }
      }
    }
  };

  if (labels.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-64 flex items-center justify-center">
        <p className="text-gray-500">No calorie data available yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 h-64">
      <Line data={data} options={options} />
    </div>
  );
};

export default CalorieChart;

