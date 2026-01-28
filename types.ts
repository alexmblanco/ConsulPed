
export enum AppointmentStatus {
  SCHEDULED = 'Programada',
  COMPLETED = 'Completada',
  CANCELLED = 'Cancelada',
  IN_PROGRESS = 'En curso'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR'
}

export interface ClinicInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  specialty?: string;
  password?: string;
  professionalId?: string;
  birthDate?: string;
  photo?: string;
  clinicInfo?: ClinicInfo; // Información del consultorio para reportes
}

export interface GrowthRecord {
  date: string;
  weight: number; // kg
  height: number; // cm
  headCircumference?: number; // cm
}

export interface Patient {
  id: string;
  doctorId: string;
  name: string;
  birthDate: string;
  gender: 'M' | 'F';
  parentName: string;
  parentPhone: string;
  email: string;
  allergies: string[];
  bloodType: string;
  growthHistory: GrowthRecord[];
  notes: string;
  photo?: string; // Fotografía del paciente
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  dateTime: string;
  reason: string;
  status: AppointmentStatus;
  cost: number;
  symptoms?: string;
  physicalExam?: string;
  diagnosis?: string;
  treatment?: string;
  weight?: number;
  height?: number;
}

export interface Transaction {
  id: string;
  doctorId: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  amount: number;
  relatedAppointmentId?: string;
}
