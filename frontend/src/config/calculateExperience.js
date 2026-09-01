// Turns a "YYYY-MM-DD" join date into "X Years Y Months" of experience as of
// today. Used anywhere staff experience is shown, so it's always accurate and
// never needs manual updating by the admin.
export const calculateExperience = (joinDateStr) => {
  if (!joinDateStr) return 'N/A';
  const start = new Date(joinDateStr);
  if (isNaN(start.getTime())) return 'N/A';
  const now = new Date();

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  if (now.getDate() < start.getDate()) months -= 1;
  if (months < 0) { years -= 1; months += 12; }
  if (years <= 0 && months <= 0) return 'Less than a month';

  const yearText = years > 0 ? `${years} Year${years > 1 ? 's' : ''}` : '';
  const monthText = months > 0 ? `${months} Month${months > 1 ? 's' : ''}` : '';
  return [yearText, monthText].filter(Boolean).join(' ');
};

export default calculateExperience;
