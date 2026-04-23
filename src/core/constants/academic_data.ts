/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Subject, StudentInfo } from '../types';

export const DEFAULT_STUDENT: StudentInfo = {
  name: 'Pranati',
  studentId: '160124737158',
  college: 'CBIT',
  branch: 'IT-3',
  semester: 'IV Semester',
  academicYear: '2025-26',
  semesterType: 'EVEN'
};

export const INITIAL_TIMETABLE: Subject[] = [
  // Monday
  { id: 'mon-1', name: 'PE-I', day: 'Monday', startTime: '9:10 AM', endTime: '10:10 AM', room: 'L-301', period: 'I', isTracked: true },
  { id: 'mon-2', name: 'PQT', day: 'Monday', startTime: '10:10 AM', endTime: '11:10 AM', room: 'L-301', period: 'II', isTracked: true },
  { id: 'mon-3', name: 'EAD', day: 'Monday', startTime: '11:15 AM', endTime: '12:15 PM', room: 'L-301', period: 'III', isTracked: true },
  { id: 'mon-4', name: 'DBMS', day: 'Monday', startTime: '1:00 PM', endTime: '2:00 PM', room: 'L-301', period: 'IV', isTracked: true },
  { id: 'mon-5', name: 'EEA', day: 'Monday', startTime: '2:00 PM', endTime: '3:00 PM', room: 'L-301', period: 'V', isTracked: true },
  { id: 'mon-6', name: 'SPORTS', day: 'Monday', startTime: '3:05 PM', endTime: '4:05 PM', room: 'Ground', period: 'VI', isTracked: true },

  // Tuesday
  { id: 'tue-1', name: 'DBMS', day: 'Tuesday', startTime: '9:10 AM', endTime: '10:10 AM', room: 'L-301', period: 'I', isTracked: true },
  { id: 'tue-2', name: 'EEA', day: 'Tuesday', startTime: '10:10 AM', endTime: '11:10 AM', room: 'L-301', period: 'II', isTracked: true },
  { id: 'tue-3', name: 'PQT', day: 'Tuesday', startTime: '11:15 AM', endTime: '12:15 PM', room: 'L-301', period: 'III', isTracked: true },
  { id: 'tue-4', name: 'DBMS LAB', day: 'Tuesday', startTime: '1:00 PM', endTime: '4:05 PM', room: 'Lab', period: 'IV-VI', isTracked: true },

  // Wednesday
  { id: 'wed-1', name: 'EAD', day: 'Wednesday', startTime: '9:10 AM', endTime: '10:10 AM', room: 'L-301', period: 'I', isTracked: true },
  { id: 'wed-2', name: 'PE-I', day: 'Wednesday', startTime: '10:10 AM', endTime: '11:10 AM', room: 'L-301', period: 'II', isTracked: true },
  { id: 'wed-3', name: 'LIBRARY', day: 'Wednesday', startTime: '11:15 AM', endTime: '12:15 PM', room: 'Lib', period: 'III', isTracked: true },
  { id: 'wed-4', name: 'EEA', day: 'Wednesday', startTime: '1:00 PM', endTime: '2:00 PM', room: 'L-301', period: 'IV', isTracked: true },
  { id: 'wed-5', name: 'DBMS', day: 'Wednesday', startTime: '2:00 PM', endTime: '3:00 PM', room: 'L-301', period: 'V', isTracked: true },
  { id: 'wed-6', name: 'PQT (T)', day: 'Wednesday', startTime: '3:05 PM', endTime: '4:05 PM', room: 'L-301', period: 'VI', isTracked: true },

  // Thursday
  { id: 'thu-1', name: 'DBMS LAB', day: 'Thursday', startTime: '9:10 AM', endTime: '12:15 PM', room: 'Lab', period: 'I-III', isTracked: true },
  { id: 'thu-4', name: 'PE-I', day: 'Thursday', startTime: '1:00 PM', endTime: '2:00 PM', room: 'L-301', period: 'IV', isTracked: true },
  { id: 'thu-5', name: 'PQT', day: 'Thursday', startTime: '2:00 PM', endTime: '3:00 PM', room: 'L-301', period: 'V', isTracked: true },
  { id: 'thu-6', name: 'ES', day: 'Thursday', startTime: '3:05 PM', endTime: '4:05 PM', room: 'L-301', period: 'VI', isTracked: true },

  // Friday
  { id: 'fri-1', name: 'ES', day: 'Friday', startTime: '9:10 AM', endTime: '10:10 AM', room: 'L-301', period: 'I', isTracked: true },
  { id: 'fri-2', name: 'EAD', day: 'Friday', startTime: '10:10 AM', endTime: '11:10 AM', room: 'L-301', period: 'II', isTracked: true },
  { id: 'fri-3', name: 'MENTORING', day: 'Friday', startTime: '11:15 AM', endTime: '12:15 PM', room: 'L-301', period: 'III', isTracked: true },
  { id: 'fri-4', name: 'DBMS LAB', day: 'Friday', startTime: '1:00 PM', endTime: '4:05 PM', room: 'Lab', period: 'IV-VI', isTracked: true },
];
