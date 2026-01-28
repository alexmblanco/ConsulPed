
import React, { useState, useRef } from 'react';
import { User, UserRole, ClinicInfo } from '../types';

interface ProfileEditorProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState<User>({
    ...user,
    clinicInfo: user.clinicInfo || { name: '', address: '', phone: '', email: '', website: '' }
  });
  const [newPassword, setNewPassword] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(user.photo || null);
  const [logoPreview, setLogoPreview] = useState<string | null>(user.clinicInfo?.logo || null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'photo') {
          setPhotoPreview(base64);
          setFormData({ ...formData, photo: base64 });
        } else {
          setLogoPreview(base64);
          setFormData({ 
            ...formData, 
            clinicInfo: { ...(formData.clinicInfo as ClinicInfo), logo: base64 } 
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { ...formData };
    if (newPassword) updatedUser.password = newPassword;
    onUpdateUser(updatedUser);
    setIsSuccess(true);
    setNewPassword('');
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 bg-indigo-600 text-white relative">
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 rounded-3xl border-4 border-white/20 bg-white/10 backdrop-blur flex items-center justify-center overflow-hidden cursor-pointer hover:bg-white/20 transition-all relative group"
              >
                {photoPreview ? (
                  <img src={photoPreview} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-4xl font-bold uppercase">{user.name[0]}</div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="fas fa-camera text-white text-xl"></i>
                </div>
                <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, 'photo')} accept="image/*" className="hidden" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold">{user.name}</h3>
                <p className="opacity-80 font-medium">{user.role === UserRole.ADMIN ? 'Administrador' : user.specialty}</p>
              </div>
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                <i className="fas fa-user-shield text-indigo-600"></i> Datos de Acceso y Perfil
              </h4>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nombre Completo</label>
                  <input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Correo Electrónico</label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Cédula Profesional</label>
                    <input 
                      value={formData.professionalId || ''}
                      onChange={(e) => setFormData({...formData, professionalId: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nueva Contraseña</label>
                    <input 
                      type="password"
                      placeholder="Dejar en blanco para no cambiar"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                <i className="fas fa-clinic-medical text-indigo-600"></i> Información del Consultorio
              </h4>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div 
                    onClick={() => logoInputRef.current?.click()}
                    className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 overflow-hidden relative group shrink-0"
                  >
                    {logoPreview ? <img src={logoPreview} className="w-full h-full object-contain p-2" /> : <i className="fas fa-image text-xl"></i>}
                    <div className="absolute inset-0 bg-indigo-600/10 hidden group-hover:flex items-center justify-center text-[8px] font-bold">CAMBIAR LOGO</div>
                    <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} accept="image/*" className="hidden" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nombre del Consultorio</label>
                    <input 
                      value={formData.clinicInfo?.name || ''}
                      onChange={(e) => setFormData({...formData, clinicInfo: {...(formData.clinicInfo as ClinicInfo), name: e.target.value}})}
                      placeholder="Ej: Clínica Pediátrica San Ángel"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Dirección Completa (para PDF)</label>
                  <input 
                    value={formData.clinicInfo?.address || ''}
                    onChange={(e) => setFormData({...formData, clinicInfo: {...(formData.clinicInfo as ClinicInfo), address: e.target.value}})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Teléfono Contacto</label>
                    <input 
                      value={formData.clinicInfo?.phone || ''}
                      onChange={(e) => setFormData({...formData, clinicInfo: {...(formData.clinicInfo as ClinicInfo), phone: e.target.value}})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Sitio Web</label>
                    <input 
                      value={formData.clinicInfo?.website || ''}
                      onChange={(e) => setFormData({...formData, clinicInfo: {...(formData.clinicInfo as ClinicInfo), website: e.target.value}})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-50 border-t flex flex-col items-center gap-4">
            {isSuccess && (
              <div className="p-4 bg-green-50 text-green-700 rounded-xl text-center text-sm font-bold animate-bounce">
                ¡Información actualizada con éxito!
              </div>
            )}
            <button 
              type="submit"
              className="px-12 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <i className="fas fa-save"></i> Guardar Todo el Perfil
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditor;
