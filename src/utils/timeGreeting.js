// Helper function to return dynamic time-based greetings (Good Morning, Good Afternoon, Good Evening, Good Night)

export const getTimeBasedGreeting = (name = '', lang = 'en') => {
  const hour = new Date().getHours();
  let greetingEn = 'Good Morning';
  let greetingMl = 'സുപ്രഭാതം';
  let emoji = '🌅';

  if (hour >= 5 && hour < 12) {
    greetingEn = 'Good Morning';
    greetingMl = 'സുപ്രഭാതം';
    emoji = '🌅';
  } else if (hour >= 12 && hour < 17) {
    greetingEn = 'Good Afternoon';
    greetingMl = 'ശുഭ ഉച്ചനേരം';
    emoji = '☀️';
  } else if (hour >= 17 && hour < 21) {
    greetingEn = 'Good Evening';
    greetingMl = 'ശുഭ സായാഹ്നം';
    emoji = '🌆';
  } else {
    greetingEn = 'Good Night';
    greetingMl = 'ശുഭ രാത്രി';
    emoji = '🌙';
  }

  const nameFormatted = name ? `, ${name}` : '';
  if (lang === 'ml') {
    return `${greetingMl}${nameFormatted} ${emoji}`;
  }
  return `${greetingEn}${nameFormatted} ${emoji}`;
};
