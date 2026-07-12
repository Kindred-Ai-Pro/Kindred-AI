export function getGratitudeShift() {
  const shifts = [
    'What is one small thing in your current environment that feels safe or comforting?',
    'Can you name one person or pet who makes you feel supported?',
    'What is one simple physical sensation that feels pleasant right now (like warmth or breath)?',
    'What is one thing you have accomplished today, no matter how small?',
  ];

  return shifts[Math.floor(Math.random() * shifts.length)];
}
