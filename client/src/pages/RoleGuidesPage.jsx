import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import { CuteCard } from '../components/CuteCard';
import { Badge } from '../components/Badge';
import { ExportDropdown } from '../components/ExportDropdown';
import { BookOpen, Mic, Clock, FileText, CheckCircle2 } from 'lucide-react';

export const RoleGuidesPage = () => {
  const [activeTab, setActiveTab] = useState('cc');
  const [ccProjects, setCcProjects] = useState([]);
  const [roleScripts, setRoleScripts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const [ccRes, roleRes] = await Promise.all([
        api.get('/guides/cc-projects'),
        api.get('/guides/role-scripts')
      ]);
      setCcProjects(ccRes.data.data);
      setRoleScripts(roleRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-mauve-900 dark:text-pastel-100 flex items-center gap-2">
            Educational Guides & Scripts 📖🌸
          </h1>
          <p className="text-xs text-mauve-500 dark:text-mauve-200 mt-1">
            Competent Communicator manual (CC1–CC10) and official meeting role scripts & logs
          </p>
        </div>
        <ExportDropdown />
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-pastel-200 dark:border-darkpink-border pb-2">
        <button
          onClick={() => setActiveTab('cc')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'cc'
              ? 'bg-pastel-500 text-white shadow-cute'
              : 'text-mauve-700 dark:text-pastel-200 hover:bg-pastel-50'
          }`}
        >
          CC Speech Guide (CC1 – CC10)
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'roles'
              ? 'bg-pastel-500 text-white shadow-cute'
              : 'text-mauve-700 dark:text-pastel-200 hover:bg-pastel-50'
          }`}
        >
          Role Scripts & Logs (Timer, Ah-Counter, Grammarian...)
        </button>
      </div>

      {activeTab === 'cc' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ccProjects.map((p) => (
            <CuteCard key={p.number} ribbon={`${p.timeMin}–${p.timeMax} Min`}>
              <div className="flex items-center gap-2">
                <Badge variant="pink">{p.code}</Badge>
                <h3 className="font-bold text-mauve-900 dark:text-pastel-100 text-sm">{p.name}</h3>
              </div>
              <p className="text-xs text-mauve-600 dark:text-mauve-200 mt-2 italic">{p.executiveSummary}</p>
              <div className="mt-3">
                <p className="text-[11px] font-bold text-mauve-800 dark:text-pastel-200 uppercase">Objectives:</p>
                <ul className="list-disc list-inside text-xs text-mauve-600 dark:text-mauve-300 space-y-1 mt-1">
                  {p.objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>
            </CuteCard>
          ))}
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-4">
          {roleScripts.map((s) => (
            <CuteCard key={s.role} title={s.title} subtitle={s.description}>
              <div className="p-3 bg-pastel-50 dark:bg-darkpink-hover rounded-xl border border-pastel-100 text-xs text-mauve-800 dark:text-pastel-200 whitespace-pre-wrap font-sans">
                {s.script}
              </div>
              {s.timingRules && (
                <p className="text-[11px] text-pastel-600 font-bold mt-2">
                  ⏱️ Timing: {s.timingRules.description}
                </p>
              )}
            </CuteCard>
          ))}
        </div>
      )}
    </div>
  );
};
