export interface User {
  username: string;
  phone: string;
  balance: number;
  classes: string[]; // Array of class IDs - firebase docID
}

export interface Class {
  title: string;
  location: [number, number];
  total: number;
  dates: ClassDate[];
  students: Classmate[];
  numberOfClasses: number;
  building: Building;
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
  attendanceStatus: 'on-time' | 'late' | 'missed' | 'idle';
}

export interface Building {
  name: string;
  location: [number, number];
}