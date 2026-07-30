export const MET_TABLE = {
  'Running (Fast)': 11.5,
  'Running (Jogging)': 8.0,
  'Cycling (Heavy)': 8.5,
  'Cycling (Moderate)': 6.8,
  'Weightlifting (Heavy)': 6.0,
  'Weightlifting (Light)': 3.5,
  'Swimming': 7.0,
  'HIIT Workout': 9.0,
  'Jump Rope': 12.0,
  'Push Ups / Pull Ups': 8.0,
  'Yoga': 3.0,
  'Stretching': 2.5,
  'Walking': 3.8,
  'Cardio': 7.5,
  'Core Workout': 4.5,
  'Custom': 5.0
};

export const calculateCaloriesBurned = (weightKg, metValue, durationMinutes) => {
  const met = metValue || 5.0;
  const weight = weightKg || 70;
  const hours = (durationMinutes || 0) / 60;
  
  // Standard MET formula: Calories = MET * Weight (kg) * Time (hours)
  const calories = met * weight * hours;
  return Math.round(calories * 10) / 10;
};
