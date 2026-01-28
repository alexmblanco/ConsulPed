
import React from 'react';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onLogout }) => {
  const isAdmin = user.role === UserRole.ADMIN;
  
  const menuItems = isAdmin ? [
    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Estadísticas' },
    { id: 'users', icon: 'fa-user-md', label: 'Gestión Médicos' },
    { id: 'profile', icon: 'fa-user-circle', label: 'Mi Perfil' },
  ] : [
    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
    { id: 'patients', icon: 'fa-users', label: 'Pacientes' },
    { id: 'appointments', icon: 'fa-calendar-check', label: 'Citas' },
    { id: 'finance', icon: 'fa-wallet', label: 'Finanzas' },
    { id: 'ai-assist', icon: 'fa-robot', label: 'Asistente IA' },
    { id: 'profile', icon: 'fa-user-circle', label: 'Mi Perfil' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <aside className="hidden md:flex flex-col w-64 bg-indigo-700 text-white p-6 sticky top-0 h-screen shadow-2xl z-50">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-700 shadow-lg">
            <i className="fas fa-baby text-xl"></i>
          </div>
          <h1 className="text-lg font-bold tracking-tight leading-tight">Consultorio Pediátrico <span className="opacity-80 block text-sm">Arrob@ Blanco</span></h1>
        </div>
        
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-white/20 shadow-inner font-bold' 
                  : 'hover:bg-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              <i className={`fas ${item.icon} w-5`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-white/10 ${activeTab === 'profile' ? 'bg-white/10' : ''}`}
            >
              <div className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center bg-indigo-400 font-bold overflow-hidden">
                {user.photo ? <img src={user.photo} className="w-full h-full object-cover" /> : user.name[0]}
              </div>
              <div className="overflow-hidden text-left">
                <p className="text-xs font-bold truncate">{user.name}</p>
                <p className="text-[9px] opacity-60 uppercase font-bold tracking-widest">{user.role}</p>
              </div>
            </button>
            <button 
              onClick={onLogout}
              className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/40 text-red-100 rounded-xl text-xs font-bold transition-all border border-red-500/30 flex items-center justify-center gap-2"
            >
              <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 capitalize">
               {activeTab === 'profile' ? 'Configuración de Perfil' : 
                activeTab === 'users' ? 'Gestión de Staff' : activeTab}
            </h2>
            <p className="text-slate-500 text-sm">
              {activeTab === 'profile' ? 'Actualiza tu información personal y profesional.' : 
               isAdmin ? 'Panel de Control Administrativo' : 'Portal Médico Pediátrico'}
            </p>
          </div>
        </header>
        <div className="animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
