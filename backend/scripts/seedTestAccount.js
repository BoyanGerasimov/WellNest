const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const TEST_EMAIL = 'test@test.com';
const TEST_PASSWORD = 'test1234';

// Sample data
const workoutTypes = [
  { name: 'Full Body Strength', exercises: ['Squats', 'Bench Press', 'Deadlifts', 'Pull-ups'], duration: 60, calories: 450 },
  { name: 'Cardio Blast', exercises: ['Running', 'Jump Rope', 'Burpees', 'Mountain Climbers'], duration: 45, calories: 500 },
  { name: 'Upper Body', exercises: ['Bench Press', 'Overhead Press', 'Rows', 'Bicep Curls'], duration: 50, calories: 380 },
  { name: 'Leg Day', exercises: ['Squats', 'Lunges', 'Leg Press', 'Calf Raises'], duration: 55, calories: 420 },
  { name: 'HIIT Workout', exercises: ['Burpees', 'Jump Squats', 'Push-ups', 'Plank'], duration: 30, calories: 350 },
  { name: 'Yoga Session', exercises: ['Sun Salutations', 'Warrior Poses', 'Tree Pose', 'Savasana'], duration: 60, calories: 200 },
  { name: 'Swimming', exercises: ['Freestyle', 'Backstroke', 'Breaststroke'], duration: 45, calories: 400 },
  { name: 'Cycling', exercises: ['Road Cycling'], duration: 60, calories: 500 }
];

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
const mealNames = {
  breakfast: ['Oatmeal with Berries', 'Scrambled Eggs & Toast', 'Greek Yogurt Bowl', 'Avocado Toast', 'Protein Smoothie'],
  lunch: ['Grilled Chicken Salad', 'Quinoa Bowl', 'Turkey Sandwich', 'Salmon & Vegetables', 'Pasta Primavera'],
  dinner: ['Grilled Salmon', 'Chicken Stir Fry', 'Beef Steak & Potatoes', 'Vegetable Curry', 'Pasta with Meatballs'],
  snack: ['Apple & Almonds', 'Protein Bar', 'Greek Yogurt', 'Trail Mix', 'Banana']
};

const foodItems = [
  { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, amount: 100 },
  { name: 'Salmon', calories: 208, protein: 20, carbs: 0, fat: 12, amount: 100 },
  { name: 'Brown Rice', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, amount: 100 },
  { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, amount: 100 },
  { name: 'Eggs', calories: 155, protein: 13, carbs: 1.1, fat: 11, amount: 100 },
  { name: 'Oatmeal', calories: 68, protein: 2.4, carbs: 12, fat: 1.4, amount: 100 },
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, amount: 100 },
  { name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, amount: 100 },
  { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fat: 50, amount: 100 },
  { name: 'Avocado', calories: 160, protein: 2, carbs: 9, fat: 15, amount: 100 }
];

const forumPosts = [
  {
    title: 'Best workout routine for beginners?',
    content: 'I\'m just starting my fitness journey and looking for advice on a good workout routine. Any recommendations?',
    category: 'workout',
    tags: ['beginner', 'routine', 'advice']
  },
  {
    title: 'Meal prep ideas for busy weekdays',
    content: 'Does anyone have good meal prep recipes that are quick to make and healthy? I struggle with finding time during the week.',
    category: 'nutrition',
    tags: ['meal-prep', 'recipes', 'healthy']
  },
  {
    title: 'How to stay motivated on tough days?',
    content: 'Some days I just don\'t feel like working out. What do you do to push through and stay motivated?',
    category: 'motivation',
    tags: ['motivation', 'mindset', 'tips']
  },
  {
    title: 'Protein intake question',
    content: 'How much protein should I be eating daily? I\'m 75kg and moderately active.',
    category: 'nutrition',
    tags: ['protein', 'nutrition', 'question']
  }
];

async function seedTestAccount() {
  try {
    console.log('🌱 Starting test account seeding...\n');

    // 1. Create or find test user
    let user = await prisma.user.findUnique({
      where: { email: TEST_EMAIL }
    });

    if (user) {
      console.log('✅ Test user already exists, skipping seed (to avoid duplicate data)');
      console.log('   If you want to reseed, delete the user first or modify this script');
      return;
    }

    console.log('📝 Creating new test user...');
      
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
    user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: TEST_EMAIL,
        password: hashedPassword,
        dateOfBirth: new Date('1995-05-15'),
        gender: 'male',
        height: 175,
        currentWeight: 75,
        goalWeight: 70,
        activityLevel: 'moderately_active',
        dailyCalorieGoal: 2200,
        isEmailVerified: true
      }
    });
    console.log(`✅ User created/updated: ${user.email}\n`);

    // 2. Create workouts (past 30 days)
    console.log('💪 Creating workouts...');
    const workouts = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip some days (not every day has a workout)
      if (Math.random() > 0.3) {
        const workoutType = workoutTypes[Math.floor(Math.random() * workoutTypes.length)];
        const exercises = workoutType.exercises.map(ex => ({
          name: ex,
          sets: Math.floor(Math.random() * 3) + 3,
          reps: Math.floor(Math.random() * 10) + 8,
          weight: Math.floor(Math.random() * 50) + 20
        }));

        const workout = await prisma.workout.create({
          data: {
            userId: user.id,
            name: workoutType.name,
            date: date,
            exercises: exercises,
            totalDuration: workoutType.duration,
            caloriesBurned: workoutType.calories,
            notes: `Great ${workoutType.name.toLowerCase()} session!`,
            tags: ['fitness', workoutType.name.toLowerCase().replace(' ', '-')]
          }
        });
        workouts.push(workout);
      }
    }
    console.log(`✅ Created ${workouts.length} workouts\n`);

    // 3. Create meals (past 30 days)
    console.log('🍽️  Creating meals...');
    const meals = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Create 2-4 meals per day
      const mealsPerDay = Math.floor(Math.random() * 3) + 2;
      
      for (let j = 0; j < mealsPerDay; j++) {
        const mealType = mealTypes[j % mealTypes.length];
        const mealName = mealNames[mealType][Math.floor(Math.random() * mealNames[mealType].length)];
        
        // Create 2-4 food items per meal
        const numItems = Math.floor(Math.random() * 3) + 2;
        const selectedFoods = [];
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFats = 0;

        for (let k = 0; k < numItems; k++) {
          const food = foodItems[Math.floor(Math.random() * foodItems.length)];
          const amount = Math.floor(Math.random() * 150) + 50; // 50-200g
          const multiplier = amount / food.amount;
          
          selectedFoods.push({
            name: food.name,
            amount: amount,
            unit: 'g',
            calories: Math.round(food.calories * multiplier),
            protein: parseFloat((food.protein * multiplier).toFixed(1)),
            carbs: parseFloat((food.carbs * multiplier).toFixed(1)),
            fat: parseFloat((food.fat * multiplier).toFixed(1))
          });
          
          totalCalories += Math.round(food.calories * multiplier);
          totalProtein += parseFloat((food.protein * multiplier).toFixed(1));
          totalCarbs += parseFloat((food.carbs * multiplier).toFixed(1));
          totalFats += parseFloat((food.fat * multiplier).toFixed(1));
        }

        const meal = await prisma.meal.create({
          data: {
            userId: user.id,
            name: mealName,
            type: mealType,
            date: date,
            foodItems: selectedFoods,
            totalCalories: Math.round(totalCalories),
            totalProtein: parseFloat(totalProtein.toFixed(1)),
            totalCarbs: parseFloat(totalCarbs.toFixed(1)),
            totalFats: parseFloat(totalFats.toFixed(1)),
            notes: `Delicious ${mealType}!`
          }
        });
        meals.push(meal);
      }
    }
    console.log(`✅ Created ${meals.length} meals\n`);

    // 4. Create achievements
    console.log('🏆 Creating achievements...');
    const achievements = [
      {
        type: 'workout_streak',
        title: '7 Day Streak',
        description: 'Completed workouts for 7 consecutive days',
        icon: '🔥',
        points: 50
      },
      {
        type: 'workout_count',
        title: 'First Workout',
        description: 'Logged your first workout',
        icon: '💪',
        points: 10
      },
      {
        type: 'workout_count',
        title: '10 Workouts',
        description: 'Completed 10 workouts',
        icon: '🎯',
        points: 25
      },
      {
        type: 'calorie_goal',
        title: 'Calorie Master',
        description: 'Met your daily calorie goal 5 times',
        icon: '⭐',
        points: 30
      },
      {
        type: 'milestone',
        title: 'Consistency King',
        description: 'Logged activities for 30 days',
        icon: '👑',
        points: 100
      }
    ];

    for (const achievement of achievements) {
      await prisma.achievement.create({
        data: {
          userId: user.id,
          ...achievement,
          unlockedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        }
      });
    }
    console.log(`✅ Created ${achievements.length} achievements\n`);

    // 5. Create forum posts
    console.log('📝 Creating forum posts...');
    const createdPosts = [];
    for (const post of forumPosts) {
      const createdPost = await prisma.forumPost.create({
        data: {
          userId: user.id,
          ...post,
          views: Math.floor(Math.random() * 100) + 10,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        }
      });
      createdPosts.push(createdPost);
    }
    console.log(`✅ Created ${createdPosts.length} forum posts\n`);

    // 6. Create chat messages
    console.log('💬 Creating chat messages...');
    const chatMessages = [
      { message: 'What\'s a good workout for beginners?', response: 'I recommend starting with full-body workouts 3 times a week. Focus on compound movements like squats, push-ups, and planks. Start light and gradually increase intensity.' },
      { message: 'How many calories should I eat?', response: 'Based on your profile (75kg, moderately active), you should aim for around 2200-2400 calories per day for maintenance. For weight loss, aim for 1700-2000 calories.' },
      { message: 'Best protein sources?', response: 'Great protein sources include chicken breast, fish, eggs, Greek yogurt, legumes, and lean beef. Aim for 0.8-1g of protein per kg of body weight daily.' }
    ];

    for (const chat of chatMessages) {
      await prisma.chatMessage.create({
        data: {
          userId: user.id,
          ...chat,
          timestamp: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000)
        }
      });
    }
    console.log(`✅ Created ${chatMessages.length} chat messages\n`);

    console.log('✨ Test account seeding completed successfully!');
    console.log('\n📋 Account Details:');
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(`   Password: ${TEST_PASSWORD}`);
    console.log(`\n📊 Data Summary:`);
    console.log(`   Workouts: ${workouts.length}`);
    console.log(`   Meals: ${meals.length}`);
    console.log(`   Achievements: ${achievements.length}`);
    console.log(`   Forum Posts: ${createdPosts.length}`);
    console.log(`   Chat Messages: ${chatMessages.length}`);

  } catch (error) {
    console.error('❌ Error seeding test account:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedTestAccount()
  .then(() => {
    console.log('\n✅ Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });

