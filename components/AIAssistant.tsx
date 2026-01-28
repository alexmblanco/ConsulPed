
import React, { useState } from 'react';
import { getClinicalSummary, analyzeSymptoms } from '../services/geminiService';

const AIAssistant: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'SUMMARY' | 'SYMPTOMS'>('SUMMARY');

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    let output = "";
    if (mode === 'SUMMARY') {
      output = await getClinicalSummary(inputText);
    } else {
      output = await analyzeSymptoms(inputText);
    }
    setResult(output);
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-xl">
            <i className="fas fa-robot"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold">Asistente Clínico Inteligente</h3>
            <p className="text-sm text-slate-500">Utiliza IA para optimizar tus notas y diagnósticos.</p>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setMode('SUMMARY')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${mode === 'SUMMARY' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-600'}`}
          >
            <i className="fas fa-file-alt"></i>
            Resumir Nota Clínica
          </button>
          <button 
             onClick={() => setMode('SYMPTOMS')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${mode === 'SYMPTOMS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-600'}`}
          >
            <i className="fas fa-stethoscope"></i>
            Analizar Síntomas
          </button>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-700">
            {mode === 'SUMMARY' ? 'Pega aquí tus notas del paciente:' : 'Describe los síntomas del paciente:'}
          </label>
          <textarea 
            className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm"
            placeholder={mode === 'SUMMARY' ? 'Ej: Mateo presenta fiebre de 38.5, tos seca hace 3 días. Pulmones limpios...' : 'Ej: Niño de 3 años con dolor abdominal, vómitos y letargo...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          ></textarea>
          <button 
            onClick={handleProcess}
            disabled={isLoading || !inputText}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all ${isLoading ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {isLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Procesar con Gemini AI'}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-indigo-600 uppercase text-xs tracking-widest flex items-center gap-2">
              <i className="fas fa-sparkles"></i>
              Resultado del Análisis
            </h4>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(result);
                alert('Copiado al portapapeles');
              }}
              className="text-slate-400 hover:text-indigo-600 text-sm"
            >
              <i className="fas fa-copy mr-1"></i> Copiar
            </button>
          </div>
          <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
