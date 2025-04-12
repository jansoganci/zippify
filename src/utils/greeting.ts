/**
 * Utility functions for generating personalized greetings
 */

// Time-based greeting options
const morningGreetings = [
  "🌅 Good morning",
  "☀️ Rise and shine",
  "🌤️ Morning",
  "🌞 Hello, bright and early"
];

const afternoonGreetings = [
  "🌤️ Good afternoon",
  "☀️ Having a good day",
  "👋 Hello",
  "🌿 Afternoon"
];

const eveningGreetings = [
  "🌇 Good evening",
  "🌙 Evening",
  "✨ Good evening",
  "🌆 Hello"
];

const nightGreetings = [
  "🌃 Working late",
  "🌙 Good night",
  "✨ Night owl",
  "🌠 Hello night worker"
];

// Day-based greeting suffixes
const weekdaySuffixes = [
  "Ready to boost your Etsy shop?", // Monday
  "Let's make this Tuesday productive.",
  "Halfway through the week!",
  "Keep the momentum going!",
  "Almost to the weekend!",
  "Weekend project time!",
  "Perfect day for Etsy planning." // Sunday
];

/**
 * Get a personalized greeting based on time of day and user name
 */
export const getPersonalizedGreeting = (): string => {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Get user name from localStorage
  const userName = localStorage.getItem('zippify_user_name') || '';
  
  // Determine time of day
  let timeBasedGreetings;
  if (hour >= 5 && hour < 12) {
    timeBasedGreetings = morningGreetings;
  } else if (hour >= 12 && hour < 17) {
    timeBasedGreetings = afternoonGreetings;
  } else if (hour >= 17 && hour < 22) {
    timeBasedGreetings = eveningGreetings;
  } else {
    timeBasedGreetings = nightGreetings;
  }
  
  // Randomly select a greeting
  const randomGreeting = timeBasedGreetings[Math.floor(Math.random() * timeBasedGreetings.length)];
  
  // Determine if we should use a day-based suffix (30% chance)
  const useDaySuffix = Math.random() < 0.3;
  
  // Build the greeting
  let greeting = randomGreeting;
  
  // Add name if available
  if (userName) {
    greeting += `, ${userName}!`;
  } else {
    greeting += '!';
  }
  
  // Add day suffix if selected
  if (useDaySuffix) {
    greeting += ` ${weekdaySuffixes[dayOfWeek]}`;
  } else if (Math.random() < 0.5) {
    // Add a random encouraging message (50% chance if not using day suffix)
    const encouragements = [
      "Ready to optimize your listings?",
      "Let's create something amazing today.",
      "Your Etsy shop is waiting for your magic.",
      "Time to stand out from the competition!"
    ];
    greeting += ` ${encouragements[Math.floor(Math.random() * encouragements.length)]}`;
  }
  
  return greeting;
};
