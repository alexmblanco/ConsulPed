
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Patient, Appointment, Transaction, User, UserRole } from '../types';

interface DashboardProps {
  patients: Patient[];
  appointments: Appointment[];
  transactions: Transaction[];
  users?: User[];
  isAdmin?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ patients, appointments, transactions, users = [], isAdmin = false }) => {
  // Doctor View Data
  const revenueData = [
    { name: 'Lun', income: 4000 },
    { name: 'Mar', income: 3000 },
    { name: 'Mie', income: 2000 },
    { name: 'Jue', income: 2780 },
    { name: 'Vie', income: 1890 },
    { name: 'Sab', income: 2390 },
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.dateTime.startsWith(todayStr));
  const monthlyRevenue = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Admin View Data
  const totalDoctors = users.filter(u => u.role === UserRole.DOCTOR).length;
  const doctorStats = users
    .filter(u => u.role === UserRole.DOCTOR)
    .map(doc => ({
      name: doc.name,
      pacientes: patients.filter(p => p.doctorId === doc.id).length,
      citas: appointments.filter(a => a.doctorId === doc.id).length
    }));

  if (isAdmin) {
    return (
      <div className="space-y-6">
        {/* Admin Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-xl">
              <i className="fas fa-user-md"></i>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Médicos Registrados</p>
              <h3 className="text-2xl font-bold">{totalDoctors}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl">
              <i className="fas fa-users"></i>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Total Pacientes</p>
              <h3 className="text-2xl font-bold">{patients.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-xl">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Citas Registradas</p>
              <h3 className="text-2xl font-bold">{appointments.length}</h3>
            </div>
          </div>
        </div>

        {/* Admin Distribution Chart & List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-6 text-slate-800">Distribución de Pacientes por Médico</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={doctorStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="pacientes" radius={[6, 6, 0, 0]}>
                    {doctorStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <h3 className="text-lg font-bold mb-4 text-slate-800">Resumen de Staff Médico</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-[10px] uppercase font-bold text-slate-400">Médico</th>
                    <th className="pb-3 text-center text-[10px] uppercase font-bold text-slate-400">Pacientes</th>
                    <th className="pb-3 text-center text-[10px] uppercase font-bold text-slate-400">Citas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {doctorStats.map((doc, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3">
                        <p className="text-sm font-bold text-slate-700">{doc.name}</p>
                      </td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">{doc.pacientes}</span>
                      </td>
                      <td className="py-3 text-center">
                         <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">{doc.citas}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Doctor View (Current behavior)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl">
            <i className="fas fa-calendar-day"></i>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Citas Hoy</p>
            <h3 className="text-2xl font-bold">{todayAppointments.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-xl">
            <i className="fas fa-child"></i>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Mis Pacientes</p>
            <h3 className="text-2xl font-bold">{patients.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-xl">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Mis Ingresos Mes</p>
            <h3 className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-xl">
            <i className="fas fa-syringe"></i>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Vacunas Pendientes</p>
            <h3 className="text-2xl font-bold">12</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-slate-800">Desempeño de Ingresos Semanal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {/* Note: In a real app we'd use AreaChart from re-imports if needed, 
                  but we'll keep it simple for now to focus on the Admin change */}
              <BarChart data={revenueData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                 <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                 <Bar dataKey="income" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Próximas Citas</h3>
          <div className="space-y-4">
            {todayAppointments.map(app => (
              <div key={app.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                  {app.patientName[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{app.patientName}</p>
                  <p className="text-xs text-slate-500">{new Date(app.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase">
                  Normal
                </div>
              </div>
            ))}
            {todayAppointments.length === 0 && (
              <p className="text-center text-slate-400 py-10">No hay citas para hoy</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
