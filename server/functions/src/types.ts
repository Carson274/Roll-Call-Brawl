export interface User {
  username: string;
  phone: string;
  balance: number;
}

export interface Class {
  title: string;
  location: [number, number];
  total: number;
  dates: ClassDate[];
  students: Classmate[];
  numberOfClasses: number;
}

export interface Classmate {
  username: string;
  remainingBalance: number;
  lostBalance: number;
  attendance: number;
}

export interface ClassDate {
  date: string;
  startTime: string;
  endTime: string;
}

export interface ClassmateAttendance {
  username: string;
  date: string;
  checkInTime: string;
  endTime: string;
  attendanceStatus: 'on-time' | 'late' | 'missed';
}