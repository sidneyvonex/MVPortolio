import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, ImageIcon, ZoomIn, UploadCloud, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { skillsApi } from '../../services/adminApi';
import type { Skill } from '../../types';

import { INP, LBL, BTN_PRIMARY, BTN_GHOST } from './adminStyles';
const CATEGORIES = ['Languages', 'Frontend', 'Backend', 'Database', 'Databases', 'DevOps', 'Mobile', 'Tools', 'Cloud'];

type Form = { name: string; category: string; iconUrl: string; order: string };
const blank: Form = { name: '', category: 'Frontend', iconUrl: '', order: '0' };

export default function SkillsPanel() {
  const [items, setItems] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState<Form>(blank);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [uploadTargetId, setUploadTargetId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [pendingIconFile, setPendingIconFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const modalIconRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try { setLoading(true); setItems(await skillsApi.getAll()); }
    catch { toast.error('Failed to load skills'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm(blank); setEditing(null); setPendingIconFile(null); setModal(true); };
  const openEdit = (s: Skill) => { setForm({ name: s.name, category: s.category, iconUrl: s.iconUrl ?? '', order: String(s.order) }); setEditing(s); setPendingIconFile(null); setModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    const id = toast.loading(editing ? 'Saving...' : 'Creating...');
    try {
      setSaving(true);
      const payload = { name: form.name, category: form.category, iconUrl: form.iconUrl || undefined, order: Number(form.order) || 0 };
      if (editing) {
        await skillsApi.update(editing.skillId, payload);
        if (pendingIconFile) { await skillsApi.uploadIcon(editing.skillId, pendingIconFile); setPendingIconFile(null); }
      } else {
        await skillsApi.create(payload);
        if (pendingIconFile) {
          const all = await skillsApi.getAll();
          const newItem = [...all].filter(s => s.name === form.name).sort((a, b) => b.skillId - a.skillId)[0];
          if (newItem) await skillsApi.uploadIcon(newItem.skillId, pendingIconFile);
          setPendingIconFile(null);
        }
      }
      toast.success(editing ? 'Skill updated' : 'Skill created', { id });
      setModal(false); await load();
    } catch (e: unknown) { toast.error((e as Error).message || 'Save failed', { id }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (sid: number) => {
    const id = toast.loading('Deleting...');
    try { await skillsApi.delete(sid); toast.success('Skill deleted', { id }); setDeleteId(null); await load(); }
    catch { toast.error('Delete failed', { id }); }
  };

  const triggerUpload = (id: number) => { setUploadTargetId(id); setTimeout(() => fileRef.current?.click(), 10); };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadTargetId === null) return;
    const id = toast.loading('Uploading icon...');
    try { setUploadingId(uploadTargetId); await skillsApi.uploadIcon(uploadTargetId, file); toast.success('Icon uploaded', { id }); await load(); }
    catch { toast.error('Upload failed', { id }); }
    finally { setUploadingId(null); setUploadTargetId(null); e.target.value = ''; }
  };

  const grouped = CATEGORIES.map(cat => ({ cat, skills: items.filter(s => s.category === cat) })).filter(g => g.skills.length > 0);
  const uncategorized = items.filter(s => !CATEGORIES.includes(s.category));
  if (uncategorized.length) grouped.push({ cat: 'Other', skills: uncategorized });

  const sf = (k: keyof Form, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleFileChange} />
      <input type="file" ref={modalIconRef} accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setPendingIconFile(f); setForm(p => ({ ...p, iconUrl: '' })); } e.target.value = ''; }} />
      <div className="flex items-center justify-between mb-6">
        <p className="text-[#8892A4] text-sm">{items.length} skill{items.length !== 1 ? 's' : ''}</p>
        <button onClick={openAdd} className={BTN_PRIMARY}><Plus size={16} /> Add Skill</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={28} className="text-[#1A56FF] animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-[#8892A4] text-sm bg-white rounded-2xl border border-[#E6EAF4]">No skills yet.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {grouped.map(({ cat, skills }) => (
            <div key={cat} className="bg-white rounded-2xl border border-[#E6EAF4] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#F4F6FF] flex items-center justify-between">
                <h3 className="font-semibold text-[#0A0A0F] text-sm">{cat}</h3>
                <span className="text-xs text-[#8892A4] bg-[#F4F6FF] px-2.5 py-1 rounded-full font-medium">{skills.length}</span>
              </div>
              <div className="divide-y divide-[#F4F6FF]">
                {skills.map(s => (
                  <div key={s.skillId} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F8F9FF] transition-colors">
                    <button
                      className="relative w-9 h-9 rounded-xl bg-[#F4F6FF] border border-[#E6EAF4] flex items-center justify-center shrink-0 overflow-hidden group/ic"
                      onClick={() => s.iconUrl && setLightboxUrl(s.iconUrl)}
                      title={s.iconUrl ? 'Click to view' : undefined}
                    >
                      {s.iconUrl
                        ? <>
                            <img src={s.iconUrl} alt="" className="w-5 h-5 object-contain" />
                            <div className="absolute inset-0 bg-black/0 group-hover/ic:bg-black/30 rounded-xl transition-colors flex items-center justify-center">
                              <ZoomIn size={10} className="text-white opacity-0 group-hover/ic:opacity-100 transition-opacity" />
                            </div>
                          </>
                        : <span className="text-[#1A56FF] font-bold text-sm">{s.name[0]}</span>
                      }
                    </button>
                    <span className="flex-1 text-[#0A0A0F] font-medium text-sm">{s.name}</span>
                    <div className="flex items-center gap-1">
                      {uploadingId === s.skillId
                        ? <Loader2 size={14} className="text-[#1A56FF] animate-spin mx-2" />
                        : <button onClick={() => triggerUpload(s.skillId)} className={BTN_GHOST} title="Upload icon"><ImageIcon size={14} /></button>
                      }
                      <button onClick={() => openEdit(s)} className={BTN_GHOST}><Pencil size={14} /></button>
                      {deleteId === s.skillId ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(s.skillId)} className="px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors border border-red-100">Delete</button>
                          <button onClick={() => setDeleteId(null)} className="px-2.5 py-1.5 text-[#8892A4] hover:text-[#0A0A0F] rounded-lg text-xs transition-colors">Cancel</button>
                        </div>
                      ) : <button onClick={() => setDeleteId(s.skillId)} className="p-2 text-[#8892A4] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E6EAF4] shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6EAF4]">
              <h2 className="text-[#0A0A0F] font-bold text-lg">{editing ? 'Edit Skill' : 'New Skill'}</h2>
              <button onClick={() => setModal(false)} className={BTN_GHOST}><X size={18} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div><label className={LBL}>Name *</label><input className={INP} value={form.name} onChange={e => sf('name', e.target.value)} placeholder="TypeScript" /></div>
              <div>
                <label className={LBL}>Category</label>
                <select className={INP} value={form.category} onChange={e => sf('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Icon / Logo */}
              <div>
                <label className={LBL}>Icon</label>
                {/* Preview */}
                {(form.iconUrl || (editing?.iconUrl && !pendingIconFile)) && (
                  <div className="flex items-center gap-3 mb-3 p-2.5 bg-[#F8F9FF] rounded-xl border border-[#E6EAF4]">
                    <img src={form.iconUrl || editing?.iconUrl || ''} alt="" className="w-8 h-8 object-contain rounded-lg" />
                    <span className="text-xs text-[#8892A4] truncate flex-1">Current icon</span>
                    <button onClick={() => { sf('iconUrl', ''); }} className="text-[#8892A4] hover:text-red-500 text-xs"><X size={13} /></button>
                  </div>
                )}
                {pendingIconFile && !form.iconUrl && (
                  <div className="flex items-center gap-3 mb-3 p-2.5 bg-[#F0F7FF] rounded-xl border border-[#1A56FF]/20">
                    <UploadCloud size={16} className="text-[#1A56FF] shrink-0" />
                    <span className="text-xs text-[#1A56FF] truncate flex-1">{pendingIconFile.name}</span>
                    <button onClick={() => setPendingIconFile(null)} className="text-[#8892A4] hover:text-red-500 text-xs"><X size={13} /></button>
                  </div>
                )}
                {/* URL input */}
                <div className="flex items-center gap-2 mb-2">
                  <Link2 size={14} className="text-[#8892A4] shrink-0" />
                  <input
                    className={INP}
                    value={form.iconUrl}
                    onChange={e => { sf('iconUrl', e.target.value); if (e.target.value) setPendingIconFile(null); }}
                    placeholder="https://cdn.example.com/icon.svg"
                  />
                </div>
                {/* Divider */}
                <div className="flex items-center gap-2 my-2">
                  <div className="flex-1 h-px bg-[#E6EAF4]" />
                  <span className="text-[10px] text-[#C0C8D8] font-medium uppercase tracking-wider">or upload</span>
                  <div className="flex-1 h-px bg-[#E6EAF4]" />
                </div>
                {/* Upload zone */}
                <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-[#E6EAF4] rounded-xl cursor-pointer hover:border-[#1A56FF] hover:bg-[#F8F9FF] transition-all">
                  <UploadCloud size={16} className="text-[#8892A4] shrink-0" />
                  <span className="text-xs text-[#8892A4]">Click to pick an image file</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setPendingIconFile(f); sf('iconUrl', ''); } e.target.value = ''; }} />
                </label>
              </div>

              <div><label className={LBL}>Order</label><input type="number" className={INP} value={form.order} onChange={e => sf('order', e.target.value)} /></div>
            </div>
            <div className="px-6 pb-5 flex justify-end gap-3">
              <button onClick={() => setModal(false)} className="px-4 py-2.5 text-sm text-[#8892A4] hover:text-[#0A0A0F] rounded-xl hover:bg-[#F4F6FF] transition-colors font-medium">Cancel</button>
              <button onClick={handleSave} disabled={saving} className={`${BTN_PRIMARY} disabled:opacity-60`}>
                {saving ? <Loader2 size={15} className="animate-spin" /> : null}
                {editing ? 'Save Changes' : 'Create Skill'}
              </button>
            </div>
          </div>
        </div>
      )}

      {lightboxUrl && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
          <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" onClick={() => setLightboxUrl(null)}>
            <X size={22} />
          </button>
          <img src={lightboxUrl} alt="Full size" className="max-w-xs max-h-[90vh] rounded-2xl object-contain shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
