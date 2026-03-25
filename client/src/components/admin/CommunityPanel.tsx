import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, ImageIcon, ExternalLink, ZoomIn, UploadCloud, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { communityApi } from '../../services/adminApi';
import type { Community } from '../../types';

import { INP, LBL, BTN_PRIMARY, BTN_GHOST } from './adminStyles';

type Form = { name: string; role: string; description: string; logoUrl: string; bioUrl: string; order: string };
const blank: Form = { name: '', role: '', description: '', logoUrl: '', bioUrl: '', order: '0' };
const toForm = (c: Community): Form => ({ name: c.name, role: c.role ?? '', description: c.description ?? '', logoUrl: c.logoUrl ?? '', bioUrl: c.bioUrl ?? '', order: String(c.order) });
const fromForm = (f: Form) => ({ name: f.name, role: f.role || null, description: f.description || null, logoUrl: f.logoUrl || undefined, bioUrl: f.bioUrl || null, order: Number(f.order) || 0 });

export default function CommunityPanel() {
  const [items, setItems] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Community | null>(null);
  const [form, setForm] = useState<Form>(blank);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [uploadTargetId, setUploadTargetId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try { setLoading(true); setItems(await communityApi.getAll()); }
    catch { toast.error('Failed to load community entries'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm(blank); setEditing(null); setPendingLogoFile(null); setModal(true); };
  const openEdit = (c: Community) => { setForm(toForm(c)); setEditing(c); setPendingLogoFile(null); setModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    const id = toast.loading(editing ? 'Saving...' : 'Creating...');
    try {
      setSaving(true);
      if (editing) {
        await communityApi.update(editing.communityId, fromForm(form));
        if (pendingLogoFile) { await communityApi.uploadLogo(editing.communityId, pendingLogoFile); setPendingLogoFile(null); }
      } else {
        await communityApi.create(fromForm(form));
        if (pendingLogoFile) {
          const all = await communityApi.getAll();
          const newItem = [...all].filter(c => c.name === form.name).sort((a, b) => b.communityId - a.communityId)[0];
          if (newItem) await communityApi.uploadLogo(newItem.communityId, pendingLogoFile);
          setPendingLogoFile(null);
        }
      }
      toast.success(editing ? 'Updated' : 'Created', { id });
      setModal(false); await load();
    } catch (e: unknown) { toast.error((e as Error).message || 'Save failed', { id }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (cid: number) => {
    const id = toast.loading('Deleting...');
    try { await communityApi.delete(cid); toast.success('Deleted', { id }); setDeleteId(null); await load(); }
    catch { toast.error('Delete failed', { id }); }
  };

  const triggerUpload = (id: number) => { setUploadTargetId(id); setTimeout(() => fileRef.current?.click(), 10); };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadTargetId === null) return;
    const id = toast.loading('Uploading logo...');
    try { setUploadingId(uploadTargetId); await communityApi.uploadLogo(uploadTargetId, file); toast.success('Logo uploaded', { id }); await load(); }
    catch { toast.error('Upload failed', { id }); }
    finally { setUploadingId(null); setUploadTargetId(null); e.target.value = ''; }
  };

  const sf = (k: keyof Form, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleFileChange} />
      <div className="flex items-center justify-between mb-6">
        <p className="text-[#8892A4] text-sm">{items.length} entr{items.length !== 1 ? 'ies' : 'y'}</p>
        <button onClick={openAdd} className={BTN_PRIMARY}><Plus size={16} /> Add Community</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={28} className="text-[#1A56FF] animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-[#8892A4] text-sm bg-white rounded-2xl border border-[#E6EAF4]">No community entries yet.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(c => (
            <div key={c.communityId} className="bg-white rounded-2xl border border-[#E6EAF4] shadow-sm p-5">
              <div className="flex items-start gap-4">
                <button
                  className="relative w-12 h-12 rounded-xl bg-[#F4F6FF] border border-[#E6EAF4] flex items-center justify-center shrink-0 overflow-hidden group/logo"
                  onClick={() => c.logoUrl && setLightboxUrl(c.logoUrl)}
                  title={c.logoUrl ? 'Click to view' : undefined}
                >
                  {c.logoUrl
                    ? <>
                        <img src={c.logoUrl} alt="" className="w-8 h-8 object-contain" />
                        <div className="absolute inset-0 bg-black/0 group-hover/logo:bg-black/30 rounded-xl transition-colors flex items-center justify-center">
                          <ZoomIn size={12} className="text-white opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                        </div>
                      </>
                    : <span className="text-[#1A56FF] font-bold text-lg">{c.name[0]}</span>
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[#0A0A0F] font-bold">{c.name}</p>
                    {c.role && <span className="px-2 py-0.5 bg-[#EEF2FF] text-[#1A56FF] rounded-full text-xs font-medium">{c.role}</span>}
                  </div>
                  {c.description && <p className="text-sm text-[#8892A4] mt-1 line-clamp-2">{c.description}</p>}
                  {c.bioUrl && <a href={c.bioUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[#1A56FF] hover:underline mt-1"><ExternalLink size={11} />View Profile</a>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {uploadingId === c.communityId
                    ? <Loader2 size={14} className="text-[#1A56FF] animate-spin mx-2" />
                    : <button onClick={() => triggerUpload(c.communityId)} className={BTN_GHOST} title="Upload logo"><ImageIcon size={14} /></button>
                  }
                  <button onClick={() => openEdit(c)} className={BTN_GHOST}><Pencil size={15} /></button>
                  {deleteId === c.communityId ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(c.communityId)} className="px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-100">Delete</button>
                      <button onClick={() => setDeleteId(null)} className="px-2.5 py-1.5 text-[#8892A4] rounded-lg text-xs">Cancel</button>
                    </div>
                  ) : <button onClick={() => setDeleteId(c.communityId)} className="p-2 text-[#8892A4] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>}
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
              <h2 className="text-[#0A0A0F] font-bold text-lg">{editing ? 'Edit Community' : 'New Community Entry'}</h2>
              <button onClick={() => setModal(false)} className={BTN_GHOST}><X size={18} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div><label className={LBL}>Name *</label><input className={INP} value={form.name} onChange={e => sf('name', e.target.value)} placeholder="Organisation / Community name" /></div>
              <div><label className={LBL}>Role</label><input className={INP} value={form.role} onChange={e => sf('role', e.target.value)} placeholder="e.g. Lead Facilitator" /></div>

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
              <div><label className={LBL}>Profile / Bio URL</label><input className={INP} value={form.bioUrl} onChange={e => sf('bioUrl', e.target.value)} placeholder="https://..." /></div>
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
