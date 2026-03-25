import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, ImageIcon, Star, ZoomIn, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { testimonialsApi } from '../../services/adminApi';
import type { Testimonial } from '../../types';

import { INP, LBL, BTN_PRIMARY, BTN_GHOST } from './adminStyles';

type Form = { name: string; role: string; message: string; rating: string; order: string };
const blank: Form = { name: '', role: '', message: '', rating: '5', order: '0' };
const toForm = (t: Testimonial): Form => ({ name: t.name, role: t.role, message: t.message, rating: String(t.rating), order: String(t.order) });
const fromForm = (f: Form) => ({ name: f.name, role: f.role, message: f.message, rating: Number(f.rating), order: Number(f.order) || 0 });

const Stars = ({ n }: { n: number }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => <Star key={i} size={12} className={i <= n ? 'text-[#FFD600] fill-[#FFD600]' : 'text-[#E6EAF4] fill-[#E6EAF4]'} />)}
  </div>
);

export default function TestimonialsPanel() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<Form>(blank);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [uploadTargetId, setUploadTargetId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [modalAvatarUploading, setModalAvatarUploading] = useState(false);
  const fileRef       = useRef<HTMLInputElement>(null);
  const modalAvatarRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try { setLoading(true); setItems(await testimonialsApi.getAll()); }
    catch { toast.error('Failed to load testimonials'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm(blank); setEditing(null); setModal(true); };
  const openEdit = (t: Testimonial) => { setForm(toForm(t)); setEditing(t); setModal(true); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.message.trim()) { toast.error('Name and message are required'); return; }
    const id = toast.loading(editing ? 'Saving...' : 'Creating...');
    try {
      setSaving(true);
      if (editing) await testimonialsApi.update(editing.testimonialId, fromForm(form));
      else await testimonialsApi.create(fromForm(form));
      toast.success(editing ? 'Testimonial updated' : 'Testimonial created', { id });
      setModal(false); await load();
    } catch (e: unknown) { toast.error((e as Error).message || 'Save failed', { id }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (tid: number) => {
    const id = toast.loading('Deleting...');
    try { await testimonialsApi.delete(tid); toast.success('Deleted', { id }); setDeleteId(null); await load(); }
    catch { toast.error('Delete failed', { id }); }
  };

  const triggerUpload = (id: number) => { setUploadTargetId(id); setTimeout(() => fileRef.current?.click(), 10); };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadTargetId === null) return;
    const id = toast.loading('Uploading avatar...');
    try { setUploadingId(uploadTargetId); await testimonialsApi.uploadAvatar(uploadTargetId, file); toast.success('Avatar uploaded', { id }); await load(); }
    catch { toast.error('Upload failed', { id }); }
    finally { setUploadingId(null); setUploadTargetId(null); e.target.value = ''; }
  };

  const handleModalAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    const id = toast.loading('Uploading avatar...');
    try {
      setModalAvatarUploading(true);
      await testimonialsApi.uploadAvatar(editing.testimonialId, file);
      toast.success('Avatar uploaded', { id });
      const updated = await testimonialsApi.getAll();
      setItems(updated);
      const fresh = updated.find(t => t.testimonialId === editing.testimonialId);
      if (fresh) setEditing(fresh);
    } catch { toast.error('Upload failed', { id }); }
    finally { setModalAvatarUploading(false); e.target.value = ''; }
  };

  const sf = (k: keyof Form, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleFileChange} />
      <input type="file" ref={modalAvatarRef} accept="image/*" className="hidden" onChange={handleModalAvatarChange} />

      <div className="flex items-center justify-between mb-6">
        <p className="text-[#8892A4] text-sm">{items.length} testimonial{items.length !== 1 ? 's' : ''}</p>
        <button onClick={openAdd} className={BTN_PRIMARY}><Plus size={16} /> Add Testimonial</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={28} className="text-[#1A56FF] animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-[#8892A4] text-sm bg-white rounded-2xl border border-[#E6EAF4]">No testimonials yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map(t => (
            <div key={t.testimonialId} className="bg-white rounded-2xl border border-[#E6EAF4] shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    className="relative shrink-0 group/av"
                    onClick={() => t.avatarUrl && setLightboxUrl(t.avatarUrl)}
                    title={t.avatarUrl ? 'Click to view full' : undefined}
                  >
                    <div className="w-11 h-11 rounded-full bg-[#EEF2FF] border border-[#E6EAF4] overflow-hidden flex items-center justify-center">
                      {t.avatarUrl
                        ? <img src={t.avatarUrl} alt="" className="w-full h-full object-cover" />
                        : <span className="text-[#1A56FF] font-bold">{t.name[0]}</span>
                      }
                    </div>
                    {t.avatarUrl && (
                      <div className="absolute inset-0 rounded-full bg-black/0 group-hover/av:bg-black/30 transition-colors flex items-center justify-center">
                        <ZoomIn size={12} className="text-white opacity-0 group-hover/av:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </button>
                  <div className="min-w-0">
                    <p className="text-[#0A0A0F] font-bold text-sm">{t.name}</p>
                    <p className="text-[#8892A4] text-xs">{t.role}</p>
                    <Stars n={t.rating} />
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {uploadingId === t.testimonialId
                    ? <Loader2 size={14} className="text-[#1A56FF] animate-spin mx-1" />
                    : <button onClick={() => triggerUpload(t.testimonialId)} className={BTN_GHOST} title="Upload avatar"><ImageIcon size={14} /></button>
                  }
                  <button onClick={() => openEdit(t)} className={BTN_GHOST}><Pencil size={14} /></button>
                  {deleteId === t.testimonialId ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(t.testimonialId)} className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-100">Del</button>
                      <button onClick={() => setDeleteId(null)} className="px-2 py-1 text-[#8892A4] rounded-lg text-xs">✕</button>
                    </div>
                  ) : <button onClick={() => setDeleteId(t.testimonialId)} className="p-2 text-[#8892A4] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>}
                </div>
              </div>
              <p className="mt-3 text-sm text-[#8892A4] line-clamp-3 italic">"{t.message}"</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E6EAF4] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6EAF4]">
              <h2 className="text-[#0A0A0F] font-bold text-lg">{editing ? 'Edit Testimonial' : 'New Testimonial'}</h2>
              <button onClick={() => setModal(false)} className={BTN_GHOST}><X size={18} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">

              {/* Avatar zone (edit only) */}
              {editing && (
                <div>
                  <label className={LBL}>Avatar Photo</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => modalAvatarRef.current?.click()}
                      disabled={modalAvatarUploading}
                      className="relative w-16 h-16 rounded-full border-2 border-dashed border-[#E6EAF4] hover:border-[#1A56FF] transition-colors overflow-hidden group shrink-0"
                      title="Click to upload avatar"
                    >
                      {editing.avatarUrl
                        ? <>
                            <img src={editing.avatarUrl} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-full transition-colors flex items-center justify-center">
                              <UploadCloud size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </>
                        : <div className="w-full h-full flex flex-col items-center justify-center gap-0.5">
                            {modalAvatarUploading ? <Loader2 size={16} className="text-[#1A56FF] animate-spin" /> : <UploadCloud size={16} className="text-[#8892A4]" />}
                          </div>
                      }
                    </button>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium text-[#0A0A0F]">{editing.avatarUrl ? 'Avatar uploaded' : 'No avatar yet'}</p>
                      <p className="text-xs text-[#8892A4]">{modalAvatarUploading ? 'Uploading...' : 'Click circle to upload photo'}</p>
                    </div>
                  </div>
                </div>
              )}

              {!editing && (
                <div className="flex items-start gap-2 px-3 py-3 bg-[#F8F9FF] rounded-xl border border-[#E6EAF4]">
                  <ImageIcon size={15} className="text-[#1A56FF] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#8892A4]">After creating, use the <strong className="text-[#0A0A0F]">image icon</strong> on the card to upload an avatar.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div><label className={LBL}>Name *</label><input className={INP} value={form.name} onChange={e => sf('name', e.target.value)} placeholder="Full name" /></div>
                <div><label className={LBL}>Role</label><input className={INP} value={form.role} onChange={e => sf('role', e.target.value)} placeholder="CEO at Acme" /></div>
              </div>
              <div><label className={LBL}>Message *</label><textarea className={`${INP} resize-none`} rows={4} value={form.message} onChange={e => sf('message', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LBL}>Rating</label>
                  <select className={INP} value={form.rating} onChange={e => sf('rating', e.target.value)}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n !== 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div><label className={LBL}>Order</label><input type="number" className={INP} value={form.order} onChange={e => sf('order', e.target.value)} /></div>
              </div>
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

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
          <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" onClick={() => setLightboxUrl(null)}>
            <X size={22} />
          </button>
          <img
            src={lightboxUrl}
            alt="Full size"
            className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
