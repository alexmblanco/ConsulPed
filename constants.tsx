
import { Patient, Appointment, Transaction, AppointmentStatus, User, UserRole } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'u-admin',
    name: 'Administrador General',
    email: 'admin@pedicare.com',
    role: UserRole.ADMIN,
    password: 'admin123',
    birthDate: '1985-04-12',
    professionalId: 'ADM-001'
  },
  {
    id: 'u-doc-1',
    name: 'Dr. Rodrigo Paz',
    email: 'rodrigo@pedicare.com',
    role: UserRole.DOCTOR,
    specialty: 'Pediatría General',
    password: 'doc123',
    birthDate: '1978-08-22',
    professionalId: 'CED-882910',
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'u-doc-2',
    name: 'Dra. Elena Gómez',
    email: 'elena@pedicare.com',
    role: UserRole.DOCTOR,
    specialty: 'Neonatología',
    password: 'doc123',
    birthDate: '1982-11-05',
    professionalId: 'CED-991022',
    photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=150'
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: '1',
    doctorId: 'u-doc-1',
    name: 'Mateo González',
    birthDate: '2021-05-15',
    gender: 'M',
    parentName: 'Laura Ruíz',
    parentPhone: '+52 555-0101',
    email: 'laura@example.com',
    allergies: ['Penicilina'],
    bloodType: 'O+',
    growthHistory: [
      { date: '2021-05-15', weight: 3.4, height: 50 },
      { date: '2021-11-15', weight: 7.2, height: 68 },
    ],
    notes: 'Desarrollo normal.'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: '101',
    doctorId: 'u-doc-1',
    patientId: '1',
    patientName: 'Mateo González',
    dateTime: new Date().toISOString().split('T')[0] + 'T09:00:00',
    reason: 'Control de crecimiento',
    status: AppointmentStatus.SCHEDULED,
    cost: 800
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    doctorId: 'u-doc-1',
    date: '2024-05-01',
    type: 'INCOME',
    category: 'Consulta',
    description: 'Consulta Mateo G.',
    amount: 800,
    relatedAppointmentId: '101'
  }
];
