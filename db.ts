
import { Dexie } from 'dexie';
import type { Table } from 'dexie';
import { User, Patient, Appointment, Transaction } from './types';
import { MOCK_USERS, INITIAL_PATIENTS, INITIAL_APPOINTMENTS, INITIAL_TRANSACTIONS } from './constants';

export class PedicareDatabase extends Dexie {
  users!: Table<User>;
  patients!: Table<Patient>;
  appointments!: Table<Appointment>;
  transactions!: Table<Transaction>;

  constructor() {
    super('PedicareDB');
    // Using named import for Dexie ensures that the class and its inherited methods like version() are correctly typed in subclasses.
    this.version(1).stores({
      users: 'id, email, role',
      patients: 'id, doctorId, name, email',
      appointments: 'id, doctorId, patientId, status, dateTime',
      transactions: 'id, doctorId, date, type, relatedAppointmentId'
    });
  }

  // Inicializar con datos semilla si es necesario
  async seed() {
    const userCount = await this.users.count();
    if (userCount === 0) {
      await this.users.bulkAdd(MOCK_USERS);
      await this.patients.bulkAdd(INITIAL_PATIENTS);
      await this.appointments.bulkAdd(INITIAL_APPOINTMENTS);
      await this.transactions.bulkAdd(INITIAL_TRANSACTIONS);
      console.log('Base de datos inicializada con datos semilla.');
    }
  }
}

export const db = new PedicareDatabase();
