/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Subject {
  id: string;
  name: string;
  room?: string;
  teacher?: string;
  period?: string; // e.g. "1st", "2nd"
  startTime?: string;
  endTime?: string;
  day?: string; // 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  isTracked?: boolean;
}

export interface Attendance {
  subjectId: string;
  totalClasses: number;
  attendedClasses: number;
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  deadline: string;
  isCompleted: boolean;
}

export interface Note {
  id: string;
  title: string;
  description: string;
  subjectId?: string;
  attachments?: string[]; // URLs or Base64
  createdAt: string;
}

export interface StudentInfo {
  name: string;
  studentId: string;
  college?: string;
  branch?: string;
  semester?: string;
  academicYear?: string;
  semesterType?: string;
}
