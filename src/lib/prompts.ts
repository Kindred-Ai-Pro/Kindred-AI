export function getDailyPrompt() {
  const prompts = [
    'What is one thing that felt lighter today?',
    'What is a boundary you set today that you’re proud of?',
    'What is a small joy you experienced in nature today?',
    'Describe a moment today where you felt truly present.',
    'What is one challenge you navigated with grace today?',
  ];

  return prompts[Math.floor(Math.random() * prompts.length)];
}
