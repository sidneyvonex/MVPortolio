import { useState, useEffect, useRef, useCallback } from 'react';
import { Save, Loader2, UploadCloud, ExternalLink, Crosshair } from 'lucide-react';
import { toast } from 'sonner';
import { settingsApi, type SettingsMap } from '../../services/adminApi';
import { INP, LBL } from './adminStyles';

const CARD = 'bg-white rounded-2xl border border-[#E6EAF4] shadow-sm p-5 flex flex-col gap-4';

const empty: SettingsMap = { tagline: '', heroImageUrl: '', heroFocalPoint: '50% 50%', resumeUrl: '', githubUrl: '', linkedinUrl: '', twitterUrl: '', email: '', phone: '', location: '', aboutBio: '' };

export default function SettingsPanel() {
  const [settings, setSettings] = useState<SettingsMap>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const heroRef   = useRef<HTMLInputElement>(null);
  const resumeRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try { setLoading(true); setSettings(await settingsApi.getAll()); }
    catch { toast.error('Failed to load settings'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const id = toast.loading('Saving settings...');
    try {
      setSaving(true);
      await settingsApi.update(settings);
      toast.success('Settings saved', { id });
    } catch (e: unknown) { toast.error((e as Error).message || 'Save failed', { id }); }
    finally { setSaving(false); }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const id = toast.loading('Uploading hero image...');
    try {
      setHeroUploading(true);
      const res = await settingsApi.uploadHero(file);
      setSettings(p => ({ ...p, heroImageUrl: res.heroImageUrl }));
      toast.success('Hero image uploaded', { id });
    } catch { toast.error('Hero image upload failed', { id }); }
    finally { setHeroUploading(false); e.target.value = ''; }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const id = toast.loading('Uploading resume...');
    try {
      setResumeUploading(true);
      const res = await settingsApi.uploadResume(file);
      setSettings(p => ({ ...p, resumeUrl: res.resumeUrl }));
      toast.success('Resume uploaded', { id });
    } catch { toast.error('Resume upload failed', { id }); }
    finally { setResumeUploading(false); e.target.value = ''; }
  };

  const sf = (k: keyof SettingsMap, v: string) => setSettings(p => ({ ...p, [k]: v }));

  const handleFocalClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    sf('heroFocalPoint', `${x}% ${y}%`);
  }, []);

  return (
    <div>
      <input type="file" ref={heroRef}   accept="image/*"       className="hidden" onChange={handleHeroUpload} />
      <input type="file" ref={resumeRef} accept="application/pdf" className="hidden" onChange={handleResumeUpload} />

      <div className="flex items-center justify-between mb-6">
        <p className="text-[#8892A4] text-sm">Global site configuration</p>
        <button onClick={handleSave} disabled={saving || loading} className="flex items-center gap-2 bg-[#1A56FF] hover:bg-[#0D2DB4] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-[#1A56FF]/20">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="text-[#1A56FF] animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Hero Image */}
          <div className={CARD}>
            <h2 className="text-[#0A0A0F] font-semibold text-sm border-b border-[#F4F6FF] pb-3">Hero Image</h2>

            {/* Focal-point picker */}
            {settings.heroImageUrl ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#8892A4]">Click image to set focal point</p>
                  <span className="flex items-center gap-1 text-[10px] font-mono bg-[#F4F6FF] text-[#1A56FF] px-2 py-0.5 rounded-md border border-[#E6EAF4]">
                    <Crosshair size={10} className="shrink-0" />{settings.heroFocalPoint ?? '50% 50%'}
                  </span>
                </div>
                {/* Picker canvas */}
                <div
                  role="button"
                  onClick={handleFocalClick}
                  className="relative w-full h-40 rounded-xl overflow-hidden cursor-crosshair border-2 border-[#E6EAF4] hover:border-[#1A56FF] transition-colors select-none"
                  title="Click to set focal point"
                >
                  <img src={settings.heroImageUrl} alt="Hero preview" className="w-full h-full object-cover pointer-events-none" />
                  {/* Dot indicator */}
                  {(() => {
                    const [rx = '50%', ry = '50%'] = (settings.heroFocalPoint ?? '50% 50%').split(' ');
                    const left = rx;
                    const top = ry;
                    return (
                      <div
                        className="absolute pointer-events-none"
                        style={{ left, top, transform: 'translate(-50%, -50%)' }}
                      >
                        <div className="w-5 h-5 rounded-full border-[3px] border-white shadow-lg bg-[#1A56FF]/60" />
                      </div>
                    );
                  })()}
                </div>
                {/* Preview strip — how mobile will crop */}
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] text-[#8892A4] uppercase tracking-wide font-medium">Circular crop preview (hero photo)</p>
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#E6EAF4] mx-auto">
                    <img
                      src={settings.heroImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ objectPosition: settings.heroFocalPoint ?? '50% 50%' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-28 rounded-xl border-2 border-dashed border-[#E6EAF4] flex items-center justify-center text-[#C0C8D8] text-xs">No image yet — upload or paste a URL below</div>
            )}

            <div>
              <label className={LBL}>Image URL</label>
              <input className={INP} value={settings.heroImageUrl ?? ''} onChange={e => sf('heroImageUrl', e.target.value)} placeholder="https://res.cloudinary.com/..." />
            </div>
            <button onClick={() => heroRef.current?.click()} disabled={heroUploading} className="flex items-center gap-2 justify-center px-4 py-2.5 border border-[#E6EAF4] text-[#8892A4] hover:text-[#1A56FF] hover:border-[#1A56FF] rounded-xl text-sm transition-colors disabled:opacity-50">
              {heroUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
              {heroUploading ? 'Uploading...' : 'Upload from file'}
            </button>
          </div>

          {/* Resume */}
          <div className={CARD}>
            <h2 className="text-[#0A0A0F] font-semibold text-sm border-b border-[#F4F6FF] pb-3">Resume / CV</h2>
            <div>
              <label className={LBL}>Resume URL</label>
              <input className={INP} value={settings.resumeUrl ?? ''} onChange={e => sf('resumeUrl', e.target.value)} placeholder="https://res.cloudinary.com/..." />
            </div>
            {settings.resumeUrl && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#8892A4]">PDF Preview</p>
                  <a href={`${import.meta.env.VITE_API_URL || '/api'}/settings/resume/download`} rel="noopener noreferrer" className="flex items-center gap-1 text-[#1A56FF] text-xs hover:underline">
                    <ExternalLink size={11} /> Download
                  </a>
                </div>
                <iframe
                  src={settings.resumeUrl}
                  title="Resume Preview"
                  className="w-full rounded-xl border border-[#E6EAF4]"
                  style={{ height: '320px' }}
                />
              </div>
            )}
            <button onClick={() => resumeRef.current?.click()} disabled={resumeUploading} className="flex items-center gap-2 justify-center px-4 py-2.5 border border-[#E6EAF4] text-[#8892A4] hover:text-[#1A56FF] hover:border-[#1A56FF] rounded-xl text-sm transition-colors disabled:opacity-50">
              {resumeUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
              {resumeUploading ? 'Uploading...' : 'Upload PDF'}
            </button>
          </div>

          {/* Profile */}
          <div className={CARD}>
            <h2 className="text-[#0A0A0F] font-semibold text-sm border-b border-[#F4F6FF] pb-3">Profile</h2>
            <div>
              <label className={LBL}>Tagline</label>
              <input className={INP} value={settings.tagline ?? ''} onChange={e => sf('tagline', e.target.value)} placeholder="Full-stack developer passionate about..." />
            </div>
            <div>
              <label className={LBL}>About / Bio</label>
              <textarea
                rows={4}
                className={INP + ' resize-none'}
                value={settings.aboutBio ?? ''}
                onChange={e => sf('aboutBio', e.target.value)}
                placeholder="Short bio paragraph shown in the About section..."
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className={CARD}>
            <h2 className="text-[#0A0A0F] font-semibold text-sm border-b border-[#F4F6FF] pb-3">Contact Info</h2>
            <div>
              <label className={LBL}>Email</label>
              <input className={INP} value={settings.email ?? ''} onChange={e => sf('email', e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <label className={LBL}>Phone</label>
              <input className={INP} value={settings.phone ?? ''} onChange={e => sf('phone', e.target.value)} placeholder="+1 234 567 8900" />
            </div>
            <div>
              <label className={LBL}>Location</label>
              <input className={INP} value={settings.location ?? ''} onChange={e => sf('location', e.target.value)} placeholder="City, Country" />
            </div>
          </div>

          {/* Social Links */}
          <div className={CARD}>
            <h2 className="text-[#0A0A0F] font-semibold text-sm border-b border-[#F4F6FF] pb-3">Social Links</h2>
            <div>
              <label className={LBL}>GitHub URL</label>
              <input className={INP} value={settings.githubUrl ?? ''} onChange={e => sf('githubUrl', e.target.value)} placeholder="https://github.com/username" />
            </div>
            <div>
              <label className={LBL}>LinkedIn URL</label>
              <input className={INP} value={settings.linkedinUrl ?? ''} onChange={e => sf('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/username" />
            </div>
            <div>
              <label className={LBL}>Twitter / X URL</label>
              <input className={INP} value={settings.twitterUrl ?? ''} onChange={e => sf('twitterUrl', e.target.value)} placeholder="https://twitter.com/username" />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
