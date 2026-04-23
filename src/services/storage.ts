/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const STORAGE_KEYS = {
  SUBJECTS: 'college_companion_subjects',
  ATTENDANCE: 'college_companion_attendance',
  ASSIGNMENTS: 'college_companion_assignments',
  NOTES: 'college_companion_notes',
  STUDENT: 'college_companion_student',
};

export const storage = {
  get: <T>(key: keyof typeof STORAGE_KEYS, defaultValue: T): T => {
    const data = localStorage.getItem(STORAGE_KEYS[key]);
    return data ? JSON.parse(data) : defaultValue;
  },
  set: (key: keyof typeof STORAGE_KEYS, value: any) => {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
  },
};
