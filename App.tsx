
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import PatientManager from './components/PatientManager';
import AppointmentManager from './components/AppointmentManager';
import FinancialManager from './components/FinancialManager';
import UserManager from './components/UserManager';
import ProfileEditor from './components/ProfileEditor';
import AIAssistant from './components/AIAssistant';
import Login from './components/Login';
import { db } from './db';
import { Patient, Appointment, Transaction, User, UserRole } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para la UI (se sincronizan con DB)
  const [users, setUsers] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Cargar datos iniciales de la DB
  useEffect(() => {
    const initDB = async () => {
      try {
        await db.seed();
        await refreshData();
        
        // Persistencia de sesión (opcional, para demo usamos null inicial)
        const savedUserId = localStorage.getItem('pedicare_user_id');
        if (savedUserId) {
          const user = await db.users.get(savedUserId);
          if (user) setCurrentUser(user);
        }
      } catch (error) {
        console.error("Error al inicializar base de datos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initDB();
  }, []);

  const refreshData = async () => {
    const [u, p, a, t] = await Promise.all([
      db.users.toArray(),
      db.patients.toArray(),
      db.appointments.toArray(),
      db.transactions.toArray()
    ]);
    setUsers(u);
    setPatients(p);
    setAppointments(a);
    setTransactions(t);
  };

  const filteredPatients = patients.filter(p => 
    currentUser?.role === UserRole.ADMIN ? true : p.doctorId === currentUser?.id
  );
  const filteredAppointments = appointments.filter(a => 
    currentUser?.role === UserRole.ADMIN ? true : a.doctorId === currentUser?.id
  );
  const filteredTransactions = transactions.filter(t => 
    currentUser?.role === UserRole.ADMIN ? true : t.doctorId === currentUser?.id
  );

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('pedicare_user_id', user.id);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pedicare_user_id');
  };

  // Operaciones CRUD persistentes
  const handleAddUser = async (user: User) => {
    await db.users.add(user);
    await refreshData();
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('¿Eliminar médico?')) {
      await db.users.delete(id);
      await refreshData();
    }
  };

  const handleUpdateCurrentUser = async (updated: User) => {
    await db.users.put(updated);
    setCurrentUser(updated);
    await refreshData();
  };

  const handleAddPatient = async (patient: Patient) => {
    await db.patients.add(patient);
    await refreshData();
  };

  const handleUpdatePatient = async (updated: Patient) => {
    await db.patients.put(updated);
    await refreshData();
  };

  const handleDeletePatient = async (id: string) => {
    if (window.confirm('¿Eliminar expediente?')) {
      await db.patients.delete(id);
      await refreshData();
    }
  };

  const handleAddAppointment = async (app: Appointment) => {
    await db.appointments.add(app);
    const newTx: Transaction = {
      id: 't-' + app.id,
      doctorId: app.doctorId,
      date: app.dateTime.split('T')[0],
      type: 'INCOME',
      category: 'Consulta',
      description: `Consulta: ${app.patientName}`,
      amount: app.cost,
      relatedAppointmentId: app.id
    };
    await db.transactions.add(newTx);
    await refreshData();
  };

  const handleUpdateAppointment = async (app: Appointment) => {
    await db.appointments.put(app);
    // Actualizar transacción relacionada si existe
    const relatedTx = await db.transactions.where('relatedAppointmentId').equals(app.id).first();
    if (relatedTx) {
      await db.transactions.update(relatedTx.id, {
        amount: app.cost,
        description: `Consulta: ${app.patientName}`
      });
    }
    await refreshData();
  };

  const handleDeleteAppointment = async (id: string) => {
    if (window.confirm('¿Eliminar cita?')) {
      await db.appointments.delete(id);
      await db.transactions.where('relatedAppointmentId').equals(id).delete();
      await refreshData();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-indigo-700 flex flex-col items-center justify-center text-white p-4">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
        <p className="font-bold animate-pulse">Iniciando Base de Datos Segura...</p>
      </div>
    );
  }

  if (!currentUser) return <Login onLogin={handleLogin} />;

  const renderContent = () => {
    if (activeTab === 'profile') return <ProfileEditor user={currentUser} onUpdateUser={handleUpdateCurrentUser} />;

    if (currentUser.role === UserRole.ADMIN) {
      switch (activeTab) {
        case 'dashboard': return <Dashboard patients={patients} appointments={appointments} transactions={transactions} users={users} isAdmin={true} />;
        case 'users': return <UserManager users={users} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} />;
        default: return <Dashboard patients={patients} appointments={appointments} transactions={transactions} users={users} isAdmin={true} />;
      }
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard patients={filteredPatients} appointments={filteredAppointments} transactions={filteredTransactions} isAdmin={false} />;
      case 'patients': return (
        <PatientManager 
          patients={filteredPatients} 
          appointments={filteredAppointments} 
          currentDoctor={currentUser} 
          onAddPatient={handleAddPatient} 
          onUpdatePatient={handleUpdatePatient} 
          onDeletePatient={handleDeletePatient} 
          onAddAppointment={handleAddAppointment}
          onUpdateAppointment={handleUpdateAppointment}
        />
      );
      case 'appointments': return (
        <AppointmentManager 
          appointments={filteredAppointments} 
          patients={filteredPatients} 
          currentDoctorId={currentUser.id} 
          onAddAppointment={handleAddAppointment} 
          onUpdateAppointment={handleUpdateAppointment} 
          onDeleteAppointment={handleDeleteAppointment} 
        />
      );
      case 'finance': return <FinancialManager transactions={filteredTransactions} />;
      case 'ai-assist': return <AIAssistant />;
      default: return <Dashboard patients={filteredPatients} appointments={filteredAppointments} transactions={filteredTransactions} isAdmin={false} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={currentUser} onLogout={handleLogout}>
      <div className="relative">
        <div className="absolute -top-12 right-0 flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
          <i className="fas fa-database text-green-500 sync-indicator"></i>
          DB LOCAL ACTIVA
        </div>
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
