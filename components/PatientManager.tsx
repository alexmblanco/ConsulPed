
import React, { useState, useMemo, useRef } from 'react';
import { Patient, Appointment, AppointmentStatus, User, GrowthRecord } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PatientManagerProps {
  patients: Patient[];
  appointments: Appointment[];
  currentDoctor: User;
  onAddPatient: (patient: Patient) => void;
  onUpdatePatient: (patient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
  onAddAppointment: (app: Appointment) => void;
  onUpdateAppointment: (app: Appointment) => void;
}

// Funciones de utilidad para percentiles (Aproximación OMS)
const getWHOMedian = (ageMonths: number, sex: 'M' | 'F', type: 'weight' | 'height' | 'bmi') => {
  const isBoy = sex === 'M';
  if (type === 'height') {
    const base = isBoy ? 50 : 49;
    return base + (ageMonths * 0.8); 
  }
  if (type === 'weight') {
    const base = isBoy ? 3.4 : 3.2;
    return base + (ageMonths * 0.25);
  }
  return 16; 
};

const calculatePercentile = (value: number, median: number) => {
  const diff = ((value - median) / median) * 100;
  if (diff < -20) return 3;
  if (diff < -10) return 15;
  if (diff < 10) return 50;
  if (diff < 20) return 85;
  return 97;
};

const PatientManager: React.FC<PatientManagerProps> = ({ 
  patients, 
  appointments,
  currentDoctor,
  onAddPatient, 
  onUpdatePatient, 
  onDeletePatient,
  onAddAppointment,
  onUpdateAppointment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editingConsultation, setEditingConsultation] = useState<Appointment | null>(null);
  const [viewingConsultation, setViewingConsultation] = useState<Appointment | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.parentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const patientAppointments = selectedPatient 
    ? appointments
        .filter(a => a.patientId === selectedPatient.id)
        .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    : [];

  const getAgeInMonths = (birthDate: string, targetDate: string) => {
    const birth = new Date(birthDate);
    const target = new Date(targetDate);
    return (target.getFullYear() - birth.getFullYear()) * 12 + (target.getMonth() - birth.getMonth());
  };

  const currentAnalysis = useMemo(() => {
    if (!selectedPatient || selectedPatient.growthHistory.length === 0) return null;
    
    const latest = selectedPatient.growthHistory[selectedPatient.growthHistory.length - 1];
    const ageMonths = getAgeInMonths(selectedPatient.birthDate, latest.date);
    const heightInMeters = latest.height / 100;
    const bmi = latest.weight / (heightInMeters * heightInMeters);

    const wMedian = getWHOMedian(ageMonths, selectedPatient.gender, 'weight');
    const hMedian = getWHOMedian(ageMonths, selectedPatient.gender, 'height');
    const bMedian = getWHOMedian(ageMonths, selectedPatient.gender, 'bmi');

    return {
      pWeight: calculatePercentile(latest.weight, wMedian),
      pHeight: calculatePercentile(latest.height, hMedian),
      pBMI: calculatePercentile(bmi, bMedian),
      bmi: bmi.toFixed(1)
    };
  }, [selectedPatient]);

  const handleExportPDF = (type: 'HISTORY' | 'CONSULTATION', data?: Appointment) => {
    setIsProcessing(true);
    setTimeout(() => {
      alert(`Generando documento PDF de ${type === 'HISTORY' ? 'Historial Clínico' : 'Consulta'} para ${selectedPatient?.name}.\n\nIncluyendo branding de: ${currentDoctor.clinicInfo?.name || currentDoctor.name}`);
      window.print();
      setIsProcessing(false);
    }, 1000);
  };

  const handleSendEmail = (type: 'HISTORY' | 'CONSULTATION', data?: Appointment) => {
    setIsProcessing(true);
    setTimeout(() => {
      alert(`Enviando ${type === 'HISTORY' ? 'Historial Completo' : 'Receta Digital'} al correo: ${selectedPatient?.email || 'el tutor'}.\n\n¡Correo enviado con éxito desde ${currentDoctor.clinicInfo?.name || currentDoctor.name}!`);
      setIsProcessing(false);
    }, 1500);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePatientSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const patientData: Patient = {
      id: editingPatient?.id || Date.now().toString(),
      doctorId: currentDoctor.id,
      name: formData.get('name') as string,
      birthDate: formData.get('birthDate') as string,
      gender: formData.get('gender') as 'M' | 'F',
      parentName: formData.get('parentName') as string,
      parentPhone: formData.get('parentPhone') as string,
      email: formData.get('email') as string || '',
      bloodType: formData.get('bloodType') as string,
      allergies: (formData.get('allergies') as string || '').split(',').map(s => s.trim()).filter(s => s !== ''),
      notes: formData.get('notes') as string,
      growthHistory: editingPatient?.growthHistory || [],
      photo: photoPreview || editingPatient?.photo
    };

    if (editingPatient) {
      onUpdatePatient(patientData);
      if (selectedPatient?.id === editingPatient.id) setSelectedPatient(patientData);
    } else onAddPatient(patientData);
    
    setIsPatientFormOpen(false);
    setPhotoPreview(null);
  };

  const handleConsultationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const formData = new FormData(e.currentTarget);
    const weight = Number(formData.get('weight'));
    const height = Number(formData.get('height'));
    const date = formData.get('dateTime') as string;

    const appData: Appointment = {
      id: editingConsultation?.id || Date.now().toString(),
      doctorId: currentDoctor.id,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      dateTime: date,
      reason: formData.get('reason') as string,
      status: AppointmentStatus.COMPLETED,
      cost: Number(formData.get('cost')),
      symptoms: formData.get('symptoms') as string,
      physicalExam: formData.get('physicalExam') as string,
      diagnosis: formData.get('diagnosis') as string,
      treatment: formData.get('treatment') as string,
      weight,
      height,
    };

    if (weight && height) {
      const newGrowth: GrowthRecord = { date: date.split('T')[0], weight, height };
      const updatedGrowth = [...selectedPatient.growthHistory, newGrowth].sort((a,b) => a.date.localeCompare(b.date));
      onUpdatePatient({ ...selectedPatient, growthHistory: updatedGrowth });
    }

    if (editingConsultation) onUpdateAppointment(appData);
    else onAddAppointment(appData);
    
    setIsConsultationModalOpen(false);
    setEditingConsultation(null);
  };

  const getPercentileColor = (p: number) => {
    if (p === 50) return 'text-green-600 bg-green-50';
    if (p === 15 || p === 85) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[750px]">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Buscar paciente..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredPatients.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPatient(p)}
              className={`w-full p-4 flex items-center gap-4 text-left border-b border-slate-50 transition-colors ${selectedPatient?.id === p.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50'}`}
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold overflow-hidden border border-slate-200">
                {p.photo ? <img src={p.photo} className="w-full h-full object-cover" /> : p.name[0]}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Tutor: {p.parentName}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="p-4">
          <button onClick={() => { setEditingPatient(null); setPhotoPreview(null); setIsPatientFormOpen(true); }} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700">Registrar Paciente</button>
        </div>
      </div>

      <div className="lg:col-span-8 space-y-6">
        {selectedPatient ? (
          <>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div className="flex gap-4 items-center">
                  <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-4xl font-bold overflow-hidden border-2 border-white shadow-xl ${selectedPatient.gender === 'F' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'}`}>
                    {selectedPatient.photo ? <img src={selectedPatient.photo} className="w-full h-full object-cover" /> : selectedPatient.name[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">{selectedPatient.name}</h3>
                    <p className="text-slate-500 font-medium">Nacimiento: {new Date(selectedPatient.birthDate).toLocaleDateString()}</p>
                    <div className="flex gap-2 mt-2">
                       <button onClick={() => { setEditingPatient(selectedPatient); setPhotoPreview(selectedPatient.photo || null); setIsPatientFormOpen(true); }} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                          <i className="fas fa-edit mr-1"></i> Editar Perfil
                       </button>
                       <button onClick={() => handleExportPDF('HISTORY')} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                          <i className="fas fa-file-pdf mr-1"></i> PDF
                       </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button onClick={() => { setEditingConsultation(null); setIsConsultationModalOpen(true); }} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all"><i className="fas fa-stethoscope"></i> Nueva Consulta</button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Peso</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold">{selectedPatient.growthHistory.length > 0 ? selectedPatient.growthHistory[selectedPatient.growthHistory.length-1].weight : '--'} kg</p>
                    {currentAnalysis && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getPercentileColor(currentAnalysis.pWeight)}`}>p{currentAnalysis.pWeight}</span>}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Talla</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold">{selectedPatient.growthHistory.length > 0 ? selectedPatient.growthHistory[selectedPatient.growthHistory.length-1].height : '--'} cm</p>
                    {currentAnalysis && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getPercentileColor(currentAnalysis.pHeight)}`}>p{currentAnalysis.pHeight}</span>}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">IMC</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold">{currentAnalysis?.bmi || '--'}</p>
                    {currentAnalysis && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getPercentileColor(currentAnalysis.pBMI)}`}>p{currentAnalysis.pBMI}</span>}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Evaluación</p>
                  <p className={`text-xs font-bold ${currentAnalysis?.pBMI === 50 ? 'text-green-600' : 'text-amber-600'}`}>{currentAnalysis ? (currentAnalysis.pBMI === 50 ? 'Normal' : 'Seguimiento') : '--'}</p>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><i className="fas fa-chart-line text-indigo-600"></i> Curva de Crecimiento</h4>
                <div className="h-64 bg-slate-50/50 rounded-2xl p-4 border border-slate-50">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedPatient.growthHistory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{fontSize: 10}} />
                      <YAxis yAxisId="left" tick={{fontSize: 10}} stroke="#6366f1" />
                      <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10}} stroke="#10b981" />
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso (kg)" stroke="#6366f1" strokeWidth={3} dot={{r: 4}} />
                      <Line yAxisId="right" type="monotone" dataKey="height" name="Talla (cm)" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-8">
                 <h4 className="text-sm font-bold text-indigo-700 uppercase mb-4 flex items-center gap-2">
                   <i className="fas fa-id-card"></i> Información de Contacto
                 </h4>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                    <div><p className="text-indigo-400 text-[10px] font-bold uppercase">Tutor</p><p className="font-bold text-slate-700">{selectedPatient.parentName}</p></div>
                    <div><p className="text-indigo-400 text-[10px] font-bold uppercase">Teléfono</p><p className="font-bold text-slate-700">{selectedPatient.parentPhone}</p></div>
                    <div><p className="text-indigo-400 text-[10px] font-bold uppercase">Email</p><p className="font-bold text-slate-700">{selectedPatient.email || 'N/A'}</p></div>
                 </div>
              </div>

              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><i className="fas fa-history text-indigo-600"></i> Historial de Consultas</h4>
              <div className="space-y-4">
                {patientAppointments.map(app => (
                  <div key={app.id} className="p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase mb-1">
                          <i className="fas fa-calendar-check"></i>
                          {new Date(app.dateTime).toLocaleDateString()}
                        </div>
                        <p className="text-lg font-bold text-slate-800">{app.reason}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => { setEditingConsultation(app); setIsConsultationModalOpen(true); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Editar Consulta"><i className="fas fa-edit"></i></button>
                         <button onClick={() => handleExportPDF('CONSULTATION', app)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50" title="Descargar PDF"><i className="fas fa-file-pdf"></i></button>
                         <button onClick={() => handleSendEmail('CONSULTATION', app)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50" title="Enviar Email"><i className="fas fa-envelope"></i></button>
                         <button onClick={() => setViewingConsultation(app)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50" title="Ver Detalles"><i className="fas fa-eye"></i></button>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 line-clamp-2 italic mb-3">
                      {app.diagnosis || "No hay diagnóstico registrado."}
                    </div>
                    <div className="flex gap-4">
                      {app.weight && <span className="text-[10px] font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded">PESO: {app.weight}kg</span>}
                      {app.height && <span className="text-[10px] font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded">TALLA: {app.height}cm</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 bg-white rounded-2xl border-2 border-dashed border-slate-200 min-h-[500px]">
            <i className="fas fa-user-circle text-6xl mb-4 opacity-10"></i>
            <p className="text-lg font-medium">Expediente Clínico Digital</p>
            <p className="text-sm text-slate-400">Selecciona un paciente para ver su historial completo.</p>
          </div>
        )}
      </div>

      {isPatientFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">{editingPatient ? 'Editar Expediente' : 'Nuevo Paciente'}</h3>
              <button onClick={() => setIsPatientFormOpen(false)} className="text-slate-400 hover:text-red-500"><i className="fas fa-times text-xl"></i></button>
            </div>
            <form onSubmit={handlePatientSubmit} className="p-8 space-y-6">
              <div className="flex flex-col items-center gap-4 mb-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full bg-slate-50 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 transition-all group relative"
                >
                  {photoPreview || editingPatient?.photo ? (
                    <img src={photoPreview || editingPatient?.photo} className="w-full h-full object-cover" />
                  ) : (
                    <i className="fas fa-camera text-2xl text-slate-300"></i>
                  )}
                  <div className="absolute inset-0 bg-indigo-600/20 hidden group-hover:flex items-center justify-center"><i className="fas fa-plus text-white"></i></div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nombre Completo</label>
                  <input name="name" required defaultValue={editingPatient?.name} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Fecha Nacimiento</label>
                  <input name="birthDate" type="date" required defaultValue={editingPatient?.birthDate} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Género</label>
                  <select name="gender" defaultValue={editingPatient?.gender || 'M'} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Sangre</label>
                  <input name="bloodType" defaultValue={editingPatient?.bloodType} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="O+" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tutor</label>
                  <input name="parentName" required defaultValue={editingPatient?.parentName} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Teléfono</label>
                  <input name="parentPhone" required defaultValue={editingPatient?.parentPhone} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Correo Electrónico Tutor</label>
                  <input name="email" type="email" defaultValue={editingPatient?.email} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="correo@ejemplo.com" />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsPatientFormOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl">Cerrar</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg">{editingPatient ? 'Actualizar' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isConsultationModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
             <div className="p-6 bg-indigo-50 border-b flex justify-between items-center rounded-t-3xl">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3"><i className="fas fa-stethoscope text-indigo-600"></i> {editingConsultation ? 'Editar Consulta' : 'Nueva Consulta'}: {selectedPatient.name}</h3>
                <button onClick={() => { setIsConsultationModalOpen(false); setEditingConsultation(null); }} className="text-slate-400 hover:text-red-500"><i className="fas fa-times text-xl"></i></button>
             </div>
             <form onSubmit={handleConsultationSubmit} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase">Fecha y Hora</label>
                    <input name="dateTime" type="datetime-local" required defaultValue={editingConsultation?.dateTime || new Date().toISOString().slice(0, 16)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase">Motivo / Costo ($)</label>
                    <div className="flex gap-4">
                      <input name="reason" required defaultValue={editingConsultation?.reason} placeholder="Ej. Control Mensual" className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                      <input name="cost" type="number" required defaultValue={editingConsultation?.cost || 800} className="w-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-sm font-bold text-slate-700 uppercase">Síntomas</label><textarea name="symptoms" defaultValue={editingConsultation?.symptoms} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none"></textarea></div>
                  <div className="space-y-2"><label className="text-sm font-bold text-slate-700 uppercase">Hallazgos Físicos</label><textarea name="physicalExam" defaultValue={editingConsultation?.physicalExam} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none"></textarea></div>
                  <div className="space-y-2"><label className="text-sm font-bold text-slate-700 uppercase">Diagnóstico</label><textarea name="diagnosis" required defaultValue={editingConsultation?.diagnosis} rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none"></textarea></div>
                  <div className="space-y-2"><label className="text-sm font-bold text-slate-700 uppercase">Tratamiento</label><textarea name="treatment" required defaultValue={editingConsultation?.treatment} rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none"></textarea></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-2"><label className="text-sm font-bold text-slate-700 uppercase">Peso (kg)</label><input name="weight" type="number" step="0.01" defaultValue={editingConsultation?.weight} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" /></div>
                  <div className="space-y-2"><label className="text-sm font-bold text-slate-700 uppercase">Talla (cm)</label><input name="height" type="number" step="0.1" defaultValue={editingConsultation?.height} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" /></div>
                </div>
                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => { setIsConsultationModalOpen(false); setEditingConsultation(null); }} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl">Cancelar</button>
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-all">Guardar Consulta</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {viewingConsultation && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
             <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><i className="fas fa-file-prescription text-indigo-600"></i> Resumen Clínico</h3>
                <button onClick={() => setViewingConsultation(null)} className="text-slate-400 hover:text-red-500 transition-colors"><i className="fas fa-times text-xl"></i></button>
             </div>
             <div className="p-10 space-y-8">
                <div className="border-b-2 border-indigo-100 pb-6 flex items-start justify-between">
                   <div className="flex gap-4">
                      {currentDoctor.clinicInfo?.logo && <img src={currentDoctor.clinicInfo.logo} className="w-16 h-16 object-contain" />}
                      <div>
                        <h4 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{currentDoctor.clinicInfo?.name || currentDoctor.name}</h4>
                        <p className="text-xs text-slate-500 max-w-md">{currentDoctor.clinicInfo?.address || 'Sin dirección registrada'}</p>
                        <p className="text-xs font-bold text-indigo-600 mt-1">Dr(a). {currentDoctor.name} | Cédula: {currentDoctor.professionalId}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase">Fecha</p>
                      <p className="text-sm font-bold">{new Date(viewingConsultation.dateTime).toLocaleDateString()}</p>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <div className="bg-slate-50 p-5 rounded-2xl">
                         <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Hallazgos Clínicos</h5>
                         <p className="text-sm text-slate-700 leading-relaxed">{viewingConsultation.symptoms || "N/A"}</p>
                      </div>
                      <div className="bg-indigo-50/30 p-5 rounded-2xl">
                         <h5 className="text-[10px] font-bold text-indigo-400 uppercase mb-2 tracking-widest">Diagnóstico</h5>
                         <p className="text-sm font-bold text-slate-800">{viewingConsultation.diagnosis || "N/A"}</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="bg-green-50/30 p-5 rounded-2xl border border-green-100">
                         <h5 className="text-[10px] font-bold text-green-600 uppercase mb-2 tracking-widest">Tratamiento</h5>
                         <p className="text-sm text-slate-700 leading-relaxed">{viewingConsultation.treatment || "N/A"}</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1 bg-slate-50 p-4 rounded-xl text-center"><p className="text-[9px] font-bold text-slate-400 mb-1">PESO</p><p className="font-bold text-slate-800">{viewingConsultation.weight}kg</p></div>
                        <div className="flex-1 bg-slate-50 p-4 rounded-xl text-center"><p className="text-[9px] font-bold text-slate-400 mb-1">TALLA</p><p className="font-bold text-slate-800">{viewingConsultation.height}cm</p></div>
                      </div>
                   </div>
                </div>
             </div>
             <div className="p-8 bg-slate-50 border-t flex justify-end gap-3">
                <button onClick={() => handleExportPDF('CONSULTATION', viewingConsultation)} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">Imprimir Receta</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManager;
