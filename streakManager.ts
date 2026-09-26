import { UserProfile } from '../types';

/**
 * Realistic Streak & Activity Tracking Manager
 * 
 * Rules:
 * 1. Streak is based on real calendar days (YYYY-MM-DD).
 * 2. Consecutive calendar day visit/practice increases the streak by 1.
 * 3. Visiting multiple times on the SAME calendar day preserves the current streak (no duplicate increments).
 * 4. Missing one or more calendar days resets the active streak to 1 (starting today).
 * 5. Practicing (answering quizzes, solving doubts, chatting with tutor) records a practice event for today.
 */

// Helper to get formatted date string: YYYY-MM-DD
export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get past date string
export const getOffsetDateString = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to compute calendar day difference between date1 and date2 (date1 - date2 in days)
export const getCalendarDayDiff = (dateStr1: string, dateStr2: string): number => {
  try {
    const [y1, m1, d1] = dateStr1.split('-').map(Number);
    const [y2, m2, d2] = dateStr2.split('-').map(Number);
    const utc1 = Date.UTC(y1, m1 - 1, d1);
    const utc2 = Date.UTC(y2, m2 - 1, d2);
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((utc1 - utc2) / msPerDay);
  } catch {
    return 0;
  }
};

/**
 * Evaluates and updates the user's streak upon visiting the app.
 */
export const evaluateUserStreakOnVisit = (user: UserProfile): UserProfile => {
  const today = getTodayDateString();
  const details = user.streakDetails || {
    lastVisitDate: today,
    lastPracticeDate: undefined,
    visitedDates: [today],
    practicedDates: [],
    currentStreak: user.stats.studyStreakDays || 1,
    longestStreak: Math.max(user.stats.studyStreakDays || 1, 1),
  };

  const lastVisit = details.lastVisitDate;
  if (!lastVisit) {
    const updatedDetails = {
      ...details,
      lastVisitDate: today,
      visitedDates: Array.from(new Set([...details.visitedDates, today])),
      currentStreak: details.currentStreak || 1,
      longestStreak: Math.max(details.longestStreak || 1, details.currentStreak || 1),
    };
    return {
      ...user,
      stats: {
        ...user.stats,
        studyStreakDays: updatedDetails.currentStreak,
      },
      streakDetails: updatedDetails,
    };
  }

  const diffDays = getCalendarDayDiff(today, lastVisit);

  let newStreak = details.currentStreak || 1;

  if (diffDays === 0) {
    // Already visited today, streak stays the same
    newStreak = details.currentStreak || 1;
  } else if (diffDays === 1) {
    // Visited yesterday, streak increments by 1
    newStreak = (details.currentStreak || 0) + 1;
  } else if (diffDays > 1) {
    // Missed at least one calendar day, streak resets to 1 (starting today)
    newStreak = 1;
  } else {
    // Clock anomaly (future date), preserve streak
    newStreak = details.currentStreak || 1;
  }

  const visitedSet = new Set(details.visitedDates || []);
  visitedSet.add(today);

  const updatedDetails = {
    ...details,
    lastVisitDate: today,
    visitedDates: Array.from(visitedSet),
    currentStreak: newStreak,
    longestStreak: Math.max(details.longestStreak || 1, newStreak),
  };

  return {
    ...user,
    stats: {
      ...user.stats,
      studyStreakDays: newStreak,
    },
    streakDetails: updatedDetails,
  };
};

/**
 * Records an active practice action (quiz, doubt resolution, AI tutor interaction, etc.)
 */
export const recordUserPracticeAction = (user: UserProfile): UserProfile => {
  const today = getTodayDateString();
  const details = user.streakDetails || {
    lastVisitDate: today,
    lastPracticeDate: today,
    visitedDates: [today],
    practicedDates: [today],
    currentStreak: user.stats.studyStreakDays || 1,
    longestStreak: Math.max(user.stats.studyStreakDays || 1, 1),
  };

  const practicedSet = new Set(details.practicedDates || []);
  practicedSet.add(today);

  const visitedSet = new Set(details.visitedDates || []);
  visitedSet.add(today);

  const updatedDetails = {
    ...details,
    lastVisitDate: today,
    lastPracticeDate: today,
    visitedDates: Array.from(visitedSet),
    practicedDates: Array.from(practicedSet),
    currentStreak: details.currentStreak || 1,
    longestStreak: Math.max(details.longestStreak || 1, details.currentStreak || 1),
  };

  return {
    ...user,
    streakDetails: updatedDetails,
  };
};

export interface DayStreakItem {
  date: string;
  dayLabel: string;
  isToday: boolean;
  visited: boolean;
  practiced: boolean;
}

/**
 * Returns a 7-day calendar window (last 6 days + today) to display realistic activity status
 */
export const getWeeklyStreakCalendar = (user: UserProfile): DayStreakItem[] => {
  const result: DayStreakItem[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = getTodayDateString();
  const visitedSet = new Set(user.streakDetails?.visitedDates || [today]);
  const practicedSet = new Set(user.streakDetails?.practicedDates || []);

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getOffsetDateString(i);
    const dayLabel = i === 0 ? 'Today' : dayNames[d.getDay()];

    result.push({
      date: dateStr,
      dayLabel,
      isToday: i === 0,
      visited: visitedSet.has(dateStr),
      practiced: practicedSet.has(dateStr),
    });
  }

  return result;
};
