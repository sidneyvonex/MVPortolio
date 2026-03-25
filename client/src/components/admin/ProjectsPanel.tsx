import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, ImageIcon, Star, ExternalLink, Github, ZoomIn, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { projectsApi } from '../../services/adminApi';
import type { Project } from '../../types';

import { INP, LBL, BTN_PRIMARY, BTN_GHOST } from './adminStyles';

type Form = { title: string; description: string; techStack: string; liveUrl: string; githubUrl: string; featured: boolean; order: string };
const blank: Form = { title: '', description: '', techStack: '', liveUrl: '', githubUrl: '', featured: false, order: '0' };
const toForm = (p: Project): Form => ({ title: p.title, description: p.description, techStack: p.techStack.join(', '), liveUrl: p.liveUrl ?? '', githubUrl: p.githubUrl ?? '', featured: p.featured, order: String(p.order) });
const fromForm = (f: Form): Partial<Project> => ({ title: f.title, description: f.description, techStack: f.techStack.split(',').map(s => s.trim()).filter(Boolean), liveUrl: f.liveUrl || null, githubUrl: f.githubUrl || null, featured: f.featured, order: Number(f.order) || 0 });

export default function ProjectsPanel() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<Form>(blank);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [uploadTargetId, setUploadTargetId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [modalImgUploading, setModalImgUploading] = useState(false);
  const fileRef      = useRef<HTMLInputElement>(null);
  const modalImgRef  = useRef<HTMLInputElement>(null);

  const load = async () => {
    try { setLoading(true); setItems(await projectsApi.getAll()); }
    catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm(blank); setEditing(null); setModal(true); };
  const openEdit = (p: Project) => { setForm(toForm(p)); setEditing(p); setModal(true); };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    const id = toast.loading(editing ? 'Saving changes...' : 'Creating project...');
    try {
      setSaving(true);
      if (editing) await projectsApi.update(editing.projectId, fromForm(form));
      else await projectsApi.create(fromForm(form));
      toast.success(editing ? 'Project updated' : 'Project created', { id });
      setModal(false); await load();
    } catch (e: unknown) { toast.error((e as Error).message || 'Save failed', { id }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    const tid = toast.loading('Deleting...');
    try { await projectsApi.delete(id); toast.success('Project deleted', { id: tid }); setDeleteId(null); await load(); }
    catch { toast.error('Delete failed', { id: tid }); }
  };

  const handleToggle = async (p: Project) => {
    try { await projectsApi.toggleFeatured(p.projectId); await load(); toast.success(p.featured ? 'Removed from featured' : 'Marked as featured'); }
    catch { toast.error('Failed to update'); }
  };

  // Upload from table row
  const triggerUpload = (id: number) => { setUploadTargetId(id); setTimeout(() => fileRef.current?.click(), 10); };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadTargetId === null) return;
    const id = toast.loading('Uploading image...');
    try { setUploadingId(uploadTargetId); await projectsApi.uploadImage(uploadTargetId, file); toast.success('Image uploaded', { id }); await load(); }
    catch { toast.error('Upload failed', { id }); }
    finally { setUploadingId(null); setUploadTargetId(null); e.target.value = ''; }
  };

  // Upload from inside the edit modal
  const handleModalImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    const id = toast.loading('Uploading image...');
    try {
      setModalImgUploading(true);
      await projectsApi.uploadImage(editing.projectId, file);
      toast.success('Image uploaded', { id });
      const updated = await projectsApi.getAll();
      setItems(updated);
      const fresh = updated.find(p => p.projectId === editing.projectId);
      if (fresh) setEditing(fresh);
    } catch { toast.error('Upload failed', { id }); }
    finally { setModalImgUploading(false); e.target.value = ''; }
  };

  const sf = (k: keyof Form, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      {/* Hidden inputs */}
      <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleFileChange} />
      <input type="file" ref={modalImgRef} accept="image/*" className="hidden" onChange={handleModalImageChange} />

      <div className="flex items-center justify-between mb-6">
        <p className="text-[#8892A4] text-sm">{items.length} project{items.length !== 1 ? 's' : ''}</p>
        <button onClick={openAdd} className={BTN_PRIMARY}><Plus size={16} /> Add Project</button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E6EAF4] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={28} className="text-[#1A56FF] animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-[#8892A4] text-sm">No projects yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E6EAF4]">
                  {['Project', 'Tech Stack', 'Links', 'Featured', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-[#8892A4] text-xs uppercase tracking-wider font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(p => (
                  <tr key={p.projectId} className="border-b border-[#F4F6FF] hover:bg-[#F8F9FF] transition-colors last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          className="relative shrink-0 group/img"
                          onClick={() => p.imageUrl && setLightboxUrl(p.imageUrl)}
                          title={p.imageUrl ? 'Click to view full image' : 'No image yet'}
                        >
                          {p.imageUrl
                            ? <>
                                <img src={p.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-[#E6EAF4]" />
                                <div className="absolute inset-0 rounded-xl bg-black/0 group-hover/img:bg-black/30 transition-colors flex items-center justify-center">
                                  <ZoomIn size={14} className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                </div>
                              </>
                            : <div className="w-12 h-12 rounded-xl bg-[#F4F6FF] border border-[#E6EAF4] flex items-center justify-center"><ImageIcon size={14} className="text-[#8892A4]" /></div>
                          }
                        </button>
                        <div>
                          <p className="text-[#0A0A0F] font-semibold">{p.title}</p>
                          <p className="text-[#8892A4] text-xs mt-0.5 line-clamp-1 max-w-[220px]">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {p.techStack.slice(0, 3).map((t: string) => <span key={t} className="px-2 py-0.5 bg-[#EEF2FF] text-[#1A56FF] rounded-md text-xs font-medium">{t}</span>)}
                        {p.techStack.length > 3 && <span className="text-[#8892A4] text-xs">+{p.techStack.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-[#8892A4] hover:text-[#0A0A0F] transition-colors"><Github size={15} /></a>}
                        {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-[#8892A4] hover:text-[#1A56FF] transition-colors"><ExternalLink size={15} /></a>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleToggle(p)} className={`p-2 rounded-xl transition-colors ${p.featured ? 'text-[#FFD600] bg-[#FFD600]/10' : 'text-[#8892A4] hover:text-[#FFD600] hover:bg-[#FFD600]/10'}`}>
                        <Star size={15} fill={p.featured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {uploadingId === p.projectId
                          ? <Loader2 size={14} className="text-[#1A56FF] animate-spin mx-2" />
                          : <button onClick={() => triggerUpload(p.projectId)} className={BTN_GHOST} title="Upload / replace image"><ImageIcon size={15} /></button>
                        }
                        <button onClick={() => openEdit(p)} className={BTN_GHOST}><Pencil size={15} /></button>
                        {deleteId === p.projectId ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(p.projectId)} className="px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors border border-red-100">Delete</button>
                            <button onClick={() => setDeleteId(null)} className="px-2.5 py-1.5 text-[#8892A4] hover:text-[#0A0A0F] rounded-lg text-xs transition-colors">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteId(p.projectId)} className="p-2 text-[#8892A4] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E6EAF4] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6EAF4]">
              <h2 className="text-[#0A0A0F] font-bold text-lg">{editing ? 'Edit Project' : 'New Project'}</h2>
              <button onClick={() => setModal(false)} className={BTN_GHOST}><X size={18} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">

              {/* Image zone (edit only) */}
              {editing && (
                <div>
                  <label className={LBL}>Project Image</label>
                  <button
                    onClick={() => modalImgRef.current?.click()}
                    disabled={modalImgUploading}
                    className="relative w-full rounded-xl border-2 border-dashed border-[#E6EAF4] hover:border-[#1A56FF] transition-colors overflow-hidden group"
                    style={{ height: editing.imageUrl ? 180 : 100 }}
                  >
                    {editing.imageUrl ? (
                      <>
                        <img src={editing.imageUrl} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex flex-col items-center justify-center gap-2">
                          <UploadCloud size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Click to replace image</span>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-2 text-[#8892A4]">
                        {modalImgUploading ? <Loader2 size={22} className="text-[#1A56FF] animate-spin" /> : <UploadCloud size={22} />}
                        <span className="text-xs font-medium">{modalImgUploading ? 'Uploading...' : 'Click to upload project image'}</span>
                        <span className="text-[10px] text-[#C0C8D8]">PNG, JPG, WEBP up to 5 MB</span>
                      </div>
                    )}
                  </button>
                  {editing.imageUrl && (
                    <p className="text-[10px] text-[#8892A4] mt-1">Click the image to replace it</p>
                  )}
                </div>
              )}

              {!editing && (
                <div className="flex items-start gap-2 px-3 py-3 bg-[#F8F9FF] rounded-xl border border-[#E6EAF4]">
                  <ImageIcon size={15} className="text-[#1A56FF] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#8892A4]">After creating the project, use the <strong className="text-[#0A0A0F]">image icon</strong> in the table to upload a cover image.</p>
                </div>
              )}

              <div><label className={LBL}>Title *</label><input className={INP} value={form.title} onChange={e => sf('title', e.target.value)} placeholder="Project name" /></div>
              <div><label className={LBL}>Description *</label><textarea className={`${INP} resize-none`} rows={3} value={form.description} onChange={e => sf('description', e.target.value)} placeholder="Brief description" /></div>
              <div><label className={LBL}>Tech Stack (comma-separated)</label><input className={INP} value={form.techStack} onChange={e => sf('techStack', e.target.value)} placeholder="React, TypeScript, Node.js" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={LBL}>GitHub URL</label><input className={INP} value={form.githubUrl} onChange={e => sf('githubUrl', e.target.value)} placeholder="https://github.com/..." /></div>
                <div><label className={LBL}>Live URL</label><input className={INP} value={form.liveUrl} onChange={e => sf('liveUrl', e.target.value)} placeholder="https://..." /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={LBL}>Order</label><input type="number" className={INP} value={form.order} onChange={e => sf('order', e.target.value)} /></div>
                <div className="flex items-center gap-3 pt-5"><input type="checkbox" id="featured" checked={form.featured} onChange={e => sf('featured', e.target.checked)} className="w-4 h-4 accent-[#1A56FF]" /><label htmlFor="featured" className="text-sm text-[#0A0A0F] font-medium">Featured</label></div>
              </div>
            </div>
            <div className="px-6 pb-5 flex justify-end gap-3">
              <button onClick={() => setModal(false)} className="px-4 py-2.5 text-sm text-[#8892A4] hover:text-[#0A0A0F] rounded-xl hover:bg-[#F4F6FF] transition-colors font-medium">Cancel</button>
              <button onClick={handleSave} disabled={saving} className={`${BTN_PRIMARY} disabled:opacity-60`}>
                {saving ? <Loader2 size={15} className="animate-spin" /> : null}
                {editing ? 'Save Changes' : 'Create Project'}
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
            alt="Full size preview"
            className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
