import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, ImageIcon, ZoomIn, UploadCloud, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { educationApi } from '../../services/adminApi';
import type { Education } from '../../types';

import { INP, LBL, BTN_PRIMARY, BTN_GHOST } from './adminStyles';

type Form = { institution: string; degree: string; description: string; logoUrl: string; startDate: string; endDate: string; order: string };
const blank: Form = { institution: '', degree: '', description: '', logoUrl: '', startDate: '', endDate: '', order: '0' };
const toForm = (e: Education): Form => ({ institution: e.institution, degree: e.degree, description: e.description ?? '', logoUrl: e.logoUrl ?? '', startDate: e.startDate ?? '', endDate: e.endDate ?? '', order: String(e.order) });
const fromForm = (f: Form) => ({ institution: f.institution, degree: f.degree, description: f.description || null, logoUrl: f.logoUrl || undefined, startDate: f.startDate || null, endDate: f.endDate || null, order: Number(f.order) || 0 });

export default function EducationPanel() {
  const [items, setItems] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Education | null>(null);
  const [form, setForm] = useState<Form>(blank);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [uploadTargetId, setUploadTargetId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try { setLoading(true); setItems(await educationApi.getAll()); }
    catch { toast.error('Failed to load education'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm(blank); setEditing(null); setPendingLogoFile(null); setModal(true); };
  const openEdit = (e: Education) => { setForm(toForm(e)); setEditing(e); setPendingLogoFile(null); setModal(true); };

  const handleSave = async () => {
    if (!form.institution.trim()) { toast.error('Institution is required'); return; }
    const id = toast.loading(editing ? 'Saving...' : 'Creating...');
    try {
      setSaving(true);
      if (editing) {
        await educationApi.update(editing.educationId, fromForm(form));
        if (pendingLogoFile) { await educationApi.uploadLogo(editing.educationId, pendingLogoFile); setPendingLogoFile(null); }
      } else {
        await educationApi.create(fromForm(form));
        if (pendingLogoFile) {
          const all = await educationApi.getAll();
          const newItem = [...all].filter(e => e.institution === form.institution).sort((a, b) => b.educationId - a.educationId)[0];
          if (newItem) await educationApi.uploadLogo(newItem.educationId, pendingLogoFile);
          setPendingLogoFile(null);
        }
      }
      toast.success(editing ? 'Education updated' : 'Education created', { id });
      setModal(false); await load();
    } catch (e: unknown) { toast.error((e as Error).message || 'Save failed', { id }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (eid: number) => {
    const id = toast.loading('Deleting...');
    try { await educationApi.delete(eid); toast.success('Deleted', { id }); setDeleteId(null); await load(); }
    catch { toast.error('Delete failed', { id }); }
  };

  const triggerUpload = (id: number) => { setUploadTargetId(id); setTimeout(() => fileRef.current?.click(), 10); };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadTargetId === null) return;
    const id = toast.loading('Uploading logo...');
    try { setUploadingId(uploadTargetId); await educationApi.uploadLogo(uploadTargetId, file); toast.success('Logo uploaded', { id }); await load(); }
    catch { toast.error('Upload failed', { id }); }
    finally { setUploadingId(null); setUploadTargetId(null); e.target.value = ''; }
  };

  const sf = (k: keyof Form, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleFileChange} />
      <div className="flex items-center justify-between mb-6">
        <p className="text-[#8892A4] text-sm">{items.length} entr{items.length !== 1 ? 'ies' : 'y'}</p>
        <button onClick={openAdd} className={BTN_PRIMARY}><Plus size={16} /> Add Education</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={28} className="text-[#1A56FF] animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-[#8892A4] text-sm bg-white rounded-2xl border border-[#E6EAF4]">No education entries yet.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(e => (
            <div key={e.educationId} className="bg-white rounded-2xl border border-[#E6EAF4] shadow-sm p-5">
              <div className="flex items-start gap-4">
                <button
                  className="relative w-12 h-12 rounded-xl bg-[#F4F6FF] border border-[#E6EAF4] flex items-center justify-center shrink-0 overflow-hidden group/logo"
                  onClick={() => e.logoUrl && setLightboxUrl(e.logoUrl)}
                  title={e.logoUrl ? 'Click to view' : undefined}
                >
                  {e.logoUrl
                    ? <>
                        <img src={e.logoUrl} alt="" className="w-8 h-8 object-contain" />
                        <div className="absolute inset-0 bg-black/0 group-hover/logo:bg-black/30 rounded-xl transition-colors flex items-center justify-center">
                          <ZoomIn size={12} className="text-white opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                        </div>
                      </>
                    : <span className="text-[#1A56FF] font-bold text-lg">{e.institution[0]}</span>
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[#0A0A0F] font-bold">{e.institution}</p>
                  <p className="text-[#1A56FF] font-medium text-sm mt-0.5">{e.degree}</p>
                  <p className="text-xs text-[#8892A4] mt-1">{e.startDate ?? ''}{e.startDate && ' — '}{e.endDate ? e.endDate : e.startDate ? <span className="text-emerald-500 font-medium">Present</span> : ''}</p>
                  {e.description && <p className="text-sm text-[#8892A4] mt-2 line-clamp-2">{e.description}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {uploadingId === e.educationId
                    ? <Loader2 size={14} className="text-[#1A56FF] animate-spin mx-2" />
                    : <button onClick={() => triggerUpload(e.educationId)} className={BTN_GHOST} title="Upload logo"><ImageIcon size={14} /></button>
                  }
                  <button onClick={() => openEdit(e)} className={BTN_GHOST}><Pencil size={15} /></button>
                  {deleteId === e.educationId ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(e.educationId)} className="px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-100">Delete</button>
                      <button onClick={() => setDeleteId(null)} className="px-2.5 py-1.5 text-[#8892A4] rounded-lg text-xs">Cancel</button>
                    </div>
                  ) : <button onClick={() => setDeleteId(e.educationId)} className="p-2 text-[#8892A4] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>}
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
              <h2 className="text-[#0A0A0F] font-bold text-lg">{editing ? 'Edit Education' : 'New Education'}</h2>
              <button onClick={() => setModal(false)} className={BTN_GHOST}><X size={18} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div><label className={LBL}>Institution *</label><input className={INP} value={form.institution} onChange={e => sf('institution', e.target.value)} placeholder="University / School name" /></div>
              <div><label className={LBL}>Degree</label><input className={INP} value={form.degree} onChange={e => sf('degree', e.target.value)} placeholder="BSc Computer Science" /></div>

              {/* Logo */}
              <div>
                <label className={LBL}>Logo</label>
                {(form.logoUrl || (editing?.logoUrl && !pendingLogoFile)) && (
                  <div className="flex items-center gap-3 mb-3 p-2.5 bg-[#F8F9FF] rounded-xl border border-[#E6EAF4]">
                    <img src={form.logoUrl || editing?.logoUrl || ''} alt="" className="w-8 h-8 object-contain rounded-lg" />
                    <span className="text-xs text-[#8892A4] truncate flex-1">Current logo</span>
                    <button onClick={() => sf('logoUrl', '')} className="text-[#8892A4] hover:text-red-500"><X size={13} /></button>
                  </div>
                )}
                {pendingLogoFile && !form.logoUrl && (
                  <div className="flex items-center gap-3 mb-3 p-2.5 bg-[#F0F7FF] rounded-xl border border-[#1A56FF]/20">
                    <UploadCloud size={16} className="text-[#1A56FF] shrink-0" />
                    <span className="text-xs text-[#1A56FF] truncate flex-1">{pendingLogoFile.name}</span>
                    <button onClick={() => setPendingLogoFile(null)} className="text-[#8892A4] hover:text-red-500"><X size={13} /></button>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <Link2 size={14} className="text-[#8892A4] shrink-0" />
                  <input className={INP} value={form.logoUrl} onChange={e => { sf('logoUrl', e.target.value); if (e.target.value) setPendingLogoFile(null); }} placeholder="https://cdn.example.com/logo.png" />
                </div>
                <div className="flex items-center gap-2 my-2">
                  <div className="flex-1 h-px bg-[#E6EAF4]" />
                  <span className="text-[10px] text-[#C0C8D8] font-medium uppercase tracking-wider">or upload</span>
                  <div className="flex-1 h-px bg-[#E6EAF4]" />
                </div>
                <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-[#E6EAF4] rounded-xl cursor-pointer hover:border-[#1A56FF] hover:bg-[#F8F9FF] transition-all">
                  <UploadCloud size={16} className="text-[#8892A4] shrink-0" />
                  <span className="text-xs text-[#8892A4]">Click to pick an image file</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setPendingLogoFile(f); sf('logoUrl', ''); } e.target.value = ''; }} />
                </label>
              </div>

              <div><label className={LBL}>Description</label><textarea className={`${INP} resize-none`} rows={3} value={form.description} onChange={e => sf('description', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={LBL}>Start</label><input className={INP} value={form.startDate} onChange={e => sf('startDate', e.target.value)} placeholder="2020" /></div>
                <div><label className={LBL}>End (blank = ongoing)</label><input className={INP} value={form.endDate} onChange={e => sf('endDate', e.target.value)} placeholder="2024" /></div>
              </div>
              <div><label className={LBL}>Order</label><input type="number" className={INP} value={form.order} onChange={e => sf('order', e.target.value)} /></div>
            </div>
            <div className="px-6 pb-5 flex justify-end gap-3">
              <button onClick={() => setModal(false)} className="px-4 py-2.5 text-sm text-[#8892A4] hover:text-[#0A0A0F] rounded-xl hover:bg-[#F4F6FF] transition-colors font-medium">Cancel</button>
              <button onClick={handleSave} disabled={saving} className={`${BTN_PRIMARY} disabled:opacity-60`}>
                {saving ? <Loader2 size={15} className="animate-spin" /> : null}{editing ? 'Save Changes' : 'Create'}
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
          <img src={lightboxUrl} alt="Full size" className="max-w-xs max-h-[90vh] rounded-2xl object-contain shadow-2xl" onClick={ev => ev.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
