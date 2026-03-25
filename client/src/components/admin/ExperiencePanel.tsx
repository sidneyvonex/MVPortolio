import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { experienceApi } from '../../services/adminApi';
import type { Experience } from '../../types';

import { INP, LBL, BTN_PRIMARY, BTN_GHOST } from './adminStyles';

type Form = { company: string; role: string; location: string; startDate: string; endDate: string; bullets: string; order: string };
const blank: Form = { company: '', role: '', location: '', startDate: '', endDate: '', bullets: '', order: '0' };
const toForm = (e: Experience): Form => ({ company: e.company, role: e.role, location: e.location ?? '', startDate: e.startDate, endDate: e.endDate ?? '', bullets: (e.bullets ?? []).join('\n'), order: String(e.order) });
const fromForm = (f: Form) => ({ company: f.company, role: f.role, location: f.location || null, startDate: f.startDate, endDate: f.endDate || null, bullets: f.bullets.split('\n').map(s => s.trim()).filter(Boolean), order: Number(f.order) || 0 });

export default function ExperiencePanel() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [form, setForm] = useState<Form>(blank);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = async () => {
    try { setLoading(true); setItems(await experienceApi.getAll()); }
    catch { toast.error('Failed to load experience'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm(blank); setEditing(null); setModal(true); };
  const openEdit = (e: Experience) => { setForm(toForm(e)); setEditing(e); setModal(true); };

  const handleSave = async () => {
    if (!form.company.trim() || !form.role.trim()) { toast.error('Company and role are required'); return; }
    const id = toast.loading(editing ? 'Saving...' : 'Creating...');
    try {
      setSaving(true);
      if (editing) await experienceApi.update(editing.experienceId, fromForm(form));
      else await experienceApi.create(fromForm(form));
      toast.success(editing ? 'Experience updated' : 'Experience created', { id });
      setModal(false); await load();
    } catch (e: unknown) { toast.error((e as Error).message || 'Save failed', { id }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (eid: number) => {
    const id = toast.loading('Deleting...');
    try { await experienceApi.delete(eid); toast.success('Deleted', { id }); setDeleteId(null); await load(); }
    catch { toast.error('Delete failed', { id }); }
  };

  const sf = (k: keyof Form, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[#8892A4] text-sm">{items.length} position{items.length !== 1 ? 's' : ''}</p>
        <button onClick={openAdd} className={BTN_PRIMARY}><Plus size={16} /> Add Experience</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={28} className="text-[#1A56FF] animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-[#8892A4] text-sm bg-white rounded-2xl border border-[#E6EAF4]">No experience entries yet.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(e => (
            <div key={e.experienceId} className="bg-white rounded-2xl border border-[#E6EAF4] shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[#0A0A0F] font-bold text-base">{e.role}</span>
                    {!e.endDate && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold border border-emerald-100">Current</span>}
                  </div>
                  <p className="text-[#1A56FF] font-semibold text-sm mt-0.5">{e.company}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-[#8892A4]">
                    <span className="flex items-center gap-1"><Calendar size={11} />{e.startDate} — {e.endDate ?? 'Present'}</span>
                    {e.location && <span className="flex items-center gap-1"><MapPin size={11} />{e.location}</span>}
                  </div>
                  {e.bullets && e.bullets.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {e.bullets.slice(0, 2).map((b: string, i: number) => <li key={i} className="text-sm text-[#8892A4] flex gap-2"><span className="text-[#1A56FF] shrink-0">▸</span>{b}</li>)}
                      {e.bullets.length > 2 && <li className="text-xs text-[#8892A4]">+{e.bullets.length - 2} more</li>}
                    </ul>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(e)} className={BTN_GHOST}><Pencil size={15} /></button>
                  {deleteId === e.experienceId ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(e.experienceId)} className="px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-100">Delete</button>
                      <button onClick={() => setDeleteId(null)} className="px-2.5 py-1.5 text-[#8892A4] rounded-lg text-xs">Cancel</button>
                    </div>
                  ) : <button onClick={() => setDeleteId(e.experienceId)} className="p-2 text-[#8892A4] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E6EAF4] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6EAF4]">
              <h2 className="text-[#0A0A0F] font-bold text-lg">{editing ? 'Edit Experience' : 'New Experience'}</h2>
              <button onClick={() => setModal(false)} className={BTN_GHOST}><X size={18} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className={LBL}>Company *</label><input className={INP} value={form.company} onChange={e => sf('company', e.target.value)} placeholder="Company name" /></div>
                <div><label className={LBL}>Role *</label><input className={INP} value={form.role} onChange={e => sf('role', e.target.value)} placeholder="Job title" /></div>
              </div>
              <div><label className={LBL}>Location</label><input className={INP} value={form.location} onChange={e => sf('location', e.target.value)} placeholder="City, Country or Remote" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={LBL}>Start Date *</label><input className={INP} value={form.startDate} onChange={e => sf('startDate', e.target.value)} placeholder="Jan 2023" /></div>
                <div><label className={LBL}>End Date (blank = current)</label><input className={INP} value={form.endDate} onChange={e => sf('endDate', e.target.value)} placeholder="Dec 2024" /></div>
              </div>
              <div><label className={LBL}>Bullet Points (one per line)</label><textarea className={`${INP} resize-none`} rows={5} value={form.bullets} onChange={e => sf('bullets', e.target.value)} placeholder={"Built X using Y\nImproved performance by Z%"} /></div>
              <div><label className={LBL}>Order</label><input type="number" className={INP} value={form.order} onChange={e => sf('order', e.target.value)} /></div>
            </div>
            <div className="px-6 pb-5 flex justify-end gap-3">
              <button onClick={() => setModal(false)} className="px-4 py-2.5 text-sm text-[#8892A4] hover:text-[#0A0A0F] rounded-xl hover:bg-[#F4F6FF] transition-colors font-medium">Cancel</button>
              <button onClick={handleSave} disabled={saving} className={`${BTN_PRIMARY} disabled:opacity-60`}>
                {saving ? <Loader2 size={15} className="animate-spin" /> : null}
                {editing ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
