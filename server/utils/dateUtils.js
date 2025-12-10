// server/utils/dateUtils.js
// server/utils/dateUtils.js

// Convert "HH:MM" time string → total minutes
export function convertToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

export function generateAppointmentId() {
  return `APT${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;
}

// Convert minutes → different formats
export function minutesToTimeFormats(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return {
    hhmm: `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`,
    readable: `${hours}h ${minutes}m`,
  };
}

// Format JS date → YYYY-MM-DD
export function formatDateString(inputDate) {
  if (!inputDate) return null;

  const date = new Date(inputDate);
  if (isNaN(date)) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}