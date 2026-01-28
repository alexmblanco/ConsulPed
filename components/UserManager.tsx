
import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';

interface UserManagerProps {
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, onAddUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const doctors = users.filter(u => u.role === UserRole.DOCTOR);

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newUser: User = {
      id: 'u-' + Date.now(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: UserRole.DOCTOR,
      specialty: formData.get('specialty') as string,
      professionalId: formData.get('professionalId') as string,
      birthDate: formData.get('birthDate') as string,
      photo: photoPreview || undefined,
      password: 'doc' + Math.floor(Math.random() * 900) + 100
    };
    onAddUser(newUser);
    setIsModalOpen(false);
    setPhotoPreview(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <h3 className="text-xl font-bold">Gestión de Staff Médico</h3>
          <p className="text-slate-500 text-sm">Administra los pediatras activos y sus credenciales profesionales.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <i className="fas fa-user-md"></i> Agregar Médico
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map(doc => (
          <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm relative group overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 p-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => onDeleteUser(doc.id)} className="bg-white/90 backdrop-blur text-red-600 p-2 rounded-lg shadow-sm hover:bg-red-50 transition-colors">
                 <i className="fas fa-trash-alt"></i>
               </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                  {doc.photo ? (
                    <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-2xl font-bold bg-indigo-50 text-indigo-400 uppercase">
                      {doc.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 leading-tight">{doc.name}</h4>
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mt-1">{doc.specialty}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-50">
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase">Cédula:</span>
                    <span className="text-slate-700 font-mono font-bold bg-slate-50 px-2 py-0.5 rounded">{doc.professionalId || 'No reg.'}</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase">Edad:</span>
                    <span className="text-slate-700 font-bold">{calculateAge(doc.birthDate)} años</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-500 text-sm mt-2">
                    <i className="fas fa-envelope w-4 text-indigo-400"></i>
                    <span className="truncate">{doc.email}</span>
                 </div>
              </div>
            </div>
            
            <div className="mt-auto p-4 bg-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100">
              <span>Contraseña: {doc.password}</span>
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">Activo</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl animate-in zoom-in-95 overflow-hidden">
             <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-800">Registrar Nuevo Médico</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors"><i className="fas fa-times text-xl"></i></button>
             </div>
             <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all overflow-hidden relative group"
                  >
                    {photoPreview ? (
                      <img src={photoPreview} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <i className="fas fa-camera text-2xl mb-1"></i>
                        <span className="text-[10px] font-bold">FOTO</span>
                      </>
                    )}
                    <div className="absolute inset-0 bg-indigo-600/60 items-center justify-center text-white hidden group-hover:flex">
                       <i className="fas fa-sync-alt"></i>
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  <p className="text-xs text-slate-400">Haz clic para subir fotografía del médico</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Nombre Completo</label>
                      <input name="name" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Dr. Juan Pérez" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Especialidad</label>
                      <input name="specialty" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Ej. Cardiólogo Pediatra" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Cédula Profesional</label>
                      <input name="professionalId" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="CED-XXXXXXX" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Fecha de Nacimiento</label>
                      <input name="birthDate" type="date" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700 ml-1">Correo Institucional</label>
                   <input name="email" type="email" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="juan.p@pedicare.com" />
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">Cancelar</button>
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-all">Registrar Médico</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
