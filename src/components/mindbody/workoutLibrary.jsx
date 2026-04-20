// Bodyweight / no-equipment workout library for Mind-Body Recovery

export const WORKOUT_CATEGORIES = [
  {
    id: "walking",
    label: "Walking",
    emoji: "🚶",
    color: "#7A9E7E",
    desc: "Simple, clears the head",
  },
  {
    id: "swimming",
    label: "Swimming",
    emoji: "🏊",
    color: "#7B8FA8",
    desc: "Full body, low impact",
  },
  {
    id: "core",
    label: "Core",
    emoji: "🔥",
    color: "#B8823A",
    desc: "Planks, sit-ups",
  },
  {
    id: "stretching",
    label: "Stretching",
    emoji: "🧘",
    color: "#9B8AB8",
    desc: "Mobility & release",
  },
  {
    id: "full_body",
    label: "Full Body",
    emoji: "💪",
    color: "#C9534F",
    desc: "Push-ups, squats, lunges",
  },
];

export const WORKOUTS = {
  walking: [
    {
      name: "Easy Walk",
      levels: {
        beginner:     { duration: 10, instruction: "10-minute steady walk. Focus on your breath." },
        intermediate: { duration: 20, instruction: "20-minute walk. Keep a moderate pace." },
        advanced:     { duration: 30, instruction: "30-minute brisk walk. Let your mind settle." },
      },
    },
  ],
  swimming: [
    {
      name: "Open Swim",
      levels: {
        beginner:     { duration: 15, instruction: "15 minutes of easy swimming. Any stroke." },
        intermediate: { duration: 25, instruction: "25 minutes mixed strokes. Rest as needed." },
        advanced:     { duration: 40, instruction: "40 minutes. Add intervals if comfortable." },
      },
    },
  ],
  core: [
    {
      name: "Plank",
      levels: {
        beginner:     { duration: 5,  instruction: "20 seconds × 3 rounds. Rest 30s between." },
        intermediate: { duration: 8,  instruction: "45 seconds × 3 rounds. Rest 30s between." },
        advanced:     { duration: 12, instruction: "60–90 seconds × 4 rounds. Rest 45s between." },
      },
    },
    {
      name: "Sit-Ups",
      levels: {
        beginner:     { duration: 5,  instruction: "10 reps × 3 rounds." },
        intermediate: { duration: 8,  instruction: "20 reps × 3 rounds." },
        advanced:     { duration: 12, instruction: "30 reps × 4 rounds." },
      },
    },
  ],
  stretching: [
    {
      name: "Full Body Stretch",
      levels: {
        beginner:     { duration: 5,  instruction: "Hold each stretch 20s. Hamstrings, back, shoulders." },
        intermediate: { duration: 10, instruction: "Hold each stretch 30s. Add hip openers." },
        advanced:     { duration: 15, instruction: "Flow through a mobility sequence." },
      },
    },
  ],
  full_body: [
    {
      name: "Push-Ups",
      levels: {
        beginner:     { duration: 5,  instruction: "5 reps × 3 rounds. Knees down is fine." },
        intermediate: { duration: 8,  instruction: "10 reps × 3 rounds." },
        advanced:     { duration: 12, instruction: "20 reps × 4 rounds." },
      },
    },
    {
      name: "Squats",
      levels: {
        beginner:     { duration: 5,  instruction: "10 reps × 3 rounds. Go to a comfortable depth." },
        intermediate: { duration: 8,  instruction: "15 reps × 3 rounds." },
        advanced:     { duration: 12, instruction: "25 reps × 4 rounds." },
      },
    },
    {
      name: "Lunges",
      levels: {
        beginner:     { duration: 5,  instruction: "5 each leg × 3 rounds." },
        intermediate: { duration: 8,  instruction: "10 each leg × 3 rounds." },
        advanced:     { duration: 12, instruction: "15 each leg × 4 rounds." },
      },
    },
  ],
};

export const LOW_ENERGY_ROUTINE = {
  name: "Low Energy Reset",
  duration: 5,
  instruction: "5 minutes of gentle movement: shoulder rolls, neck stretches, slow breathing, a short walk.",
};

export const NUTRITION = {
  gut_health: {
    label: "Gut Health",
    emoji: "🌱",
    color: "#7A9E7E",
    items: ["Yogurt", "Kefir", "Berries", "Banana", "Leafy greens", "Sauerkraut", "Kimchi", "Miso"],
  },
  alkaline: {
    label: "Alkaline",
    emoji: "🥬",
    color: "#5F9E8A",
    items: ["Spinach", "Kale", "Avocado", "Cucumber", "Lemon water", "Celery", "Broccoli", "Almonds"],
  },
  balanced: {
    label: "Balanced Plate",
    emoji: "🍽️",
    color: "#B8823A",
    items: ["Whole grains", "Lean protein", "Fruits", "Vegetables", "Healthy fats", "Legumes"],
  },
};

export const LIMIT_FOODS = [
  { label: "Processed foods",   note: "Chips, packaged snacks, fast food" },
  { label: "Excess sugar",      note: "Sodas, candy, sweetened drinks" },
  { label: "Heavy fried foods", note: "Deep-fried meals, greasy takeout" },
];