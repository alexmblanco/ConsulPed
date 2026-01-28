
import React, { useState } from 'react';
import { Transaction } from '../types';

interface FinancialManagerProps {
  transactions: Transaction[];
}

const FinancialManager: React.FC<FinancialManagerProps> = ({ transactions }) => {
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const filtered = transactions.filter(t => filterType === 'ALL' || t.type === filterType);
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-100">
          <p className="text-white/70 text-sm font-medium uppercase mb-1">Balance Neto</p>
          <h3 className="text-3xl font-bold">${(totalIncome - totalExpense).toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-sm font-medium uppercase mb-1">Total Ingresos</p>
          <h3 className="text-3xl font-bold text-green-600">${totalIncome.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-sm font-medium uppercase mb-1">Total Gastos</p>
          <h3 className="text-3xl font-bold text-red-600">${totalExpense.toLocaleString()}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold">Transacciones Recientes</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setFilterType('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filterType === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Todos
            </button>
            <button 
               onClick={() => setFilterType('INCOME')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filterType === 'INCOME' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Ingresos
            </button>
            <button 
               onClick={() => setFilterType('EXPENSE')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filterType === 'EXPENSE' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Gastos
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400">Fecha</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400">Descripción</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400">Categoría</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{t.description}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase">{t.category}</span>
                  </td>
                  <td className={`px-6 py-4 font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'INCOME' ? '+' : '-'} ${t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">No se encontraron transacciones</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialManager;
