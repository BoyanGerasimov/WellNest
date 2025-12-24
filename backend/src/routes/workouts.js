const express = require('express');
const router = express.Router();
const {
  getWorkouts,
  getWorkout,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getWorkoutStats
} = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');
const { validateWorkout } = require('../middleware/validator');

router.use(protect); // All routes require authentication

router.get('/stats', getWorkoutStats);
router.get('/', getWorkouts);
router.get('/:id', getWorkout);
router.post('/', validateWorkout, createWorkout);
router.put('/:id', validateWorkout, updateWorkout);
router.delete('/:id', deleteWorkout);

module.exports = router;

