
import React, { useState } from 'react';
import { Appointment, Patient, AppointmentStatus } from '../types';

interface AppointmentManagerProps {
  appointments: Appointment[];
  patients: Patient[];
  // Added currentDoctorId to satisfy Appointment interface requirements
  currentDoctorId: string;
  onAddAppointment: (app: Appointment) => void;
  onUpdateAppointment: (app: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
}

const AppointmentManager: React.FC<AppointmentManagerProps> = ({
  appointments,
  patients,
  currentDoctorId,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Appointment | null>(null);

  const handleOpenForm = (app: Appointment | null = null) => {
    setEditingApp(app);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const patientId = formData.get('patientId') as string;
    const patient = patients.find(p => p.id === patientId);

    // Added doctorId to satisfy required property error
    const appData: Appointment = {
      id: editingApp?.id || Date.now().toString(),
      doctorId: editingApp?.doctorId || currentDoctorId,
      patientId,
      patientName: patient?.name || 'Desconocido',
      dateTime: formData.get('dateTime') as string,
      reason: formData.get('reason') as string,
      status: formData.get('status') as AppointmentStatus,
      cost: Number(formData.get('cost')),
      symptoms: formData.get('symptoms') as string,
      physicalExam: formData.get('physicalExam') as string,
      diagnosis: formData.get('diagnosis') as string,
      treatment: formData.get('treatment') as string,
      weight: formData.get('weight') ? Number(formData.get('weight')) : undefined,
      height: formData.get('height') ? Number(formData.get('height')) : undefined,
    };

    if (editingApp) onUpdateAppointment(appData);
    else onAddAppointment(appData);
    
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">Control de Agenda</h3>
        <button 
          onClick={() => handleOpenForm()}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <i className="fas fa-calendar-plus"></i> Nueva Cita
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400">Fecha/Hora</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400">Paciente</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400">Motivo</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400">Estado</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {appointments.sort((a,b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()).map(app => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">{new Date(app.dateTime).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-500">{new Date(app.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{app.patientName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{app.reason}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      /* Using enum members for status comparisons to fix overlap errors and handle typos centrally */
                      app.status === AppointmentStatus.COMPLETED ? 'bg-green-100 text-green-700' : 
                      app.status === AppointmentStatus.CANCELLED ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenForm(app)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><i className="fas fa-edit"></i></button>
                      <button onClick={() => onDeleteAppointment(app.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><i className="fas fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <h3 className="text-xl font-bold text-slate-800">
                {editingApp ? 'Editar Cita y Consulta' : 'Nueva Cita'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500"><i className="fas fa-times text-xl"></i></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Paciente</label>
                  <select name="patientId" required defaultValue={editingApp?.patientId} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Seleccionar paciente...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Fecha y Hora</label>
                  <input name="dateTime" type="datetime-local" required defaultValue={editingApp?.dateTime} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Estado</label>
                  <select name="status" defaultValue={editingApp?.status || AppointmentStatus.SCHEDULED} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                    {Object.values(AppointmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Motivo de Consulta / Costo ($)</label>
                <div className="flex gap-4">
                  <input name="reason" required defaultValue={editingApp?.reason} placeholder="Ej. Control de niño sano" className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                  <input name="cost" type="number" required defaultValue={editingApp?.cost || 800} className="w-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
              </div>

              {/* Clinical Data Section */}
              <div className="border-t border-slate-100 pt-8">
                <h4 className="text-lg font-bold text-indigo-600 mb-6 flex items-center gap-2">
                  <i className="fas fa-file-medical"></i> Información Clínica de la Consulta
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                   <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Síntomas / Motivo Detallado</label>
                    <textarea name="symptoms" defaultValue={editingApp?.symptoms} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Examen Físico</label>
                    <textarea name="physicalExam" defaultValue={editingApp?.physicalExam} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Diagnóstico</label>
                    <textarea name="diagnosis" defaultValue={editingApp?.diagnosis} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Tratamiento / Plan</label>
                    <textarea name="treatment" defaultValue={editingApp?.treatment} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"></textarea>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Peso (kg)</label>
                    <input name="weight" type="number" step="0.01" defaultValue={editingApp?.weight} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Talla (cm)</label>
                    <input name="height" type="number" step="0.1" defaultValue={editingApp?.height} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg">Guardar Cita e Información</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManager;
