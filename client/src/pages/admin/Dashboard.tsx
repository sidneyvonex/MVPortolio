import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';
import {
  Terminal, FolderOpen, Zap, Briefcase, GraduationCap,
  Users, MessageSquare, Mail, Settings, LogOut, ChevronRight, Menu, X,
} from 'lucide-react';
import { isAuthenticated, clearToken } from '../../lib/auth';
import { useAdminHead } from '../../hooks/useAdminHead';
import ProjectsPanel    from '../../components/admin/ProjectsPanel';
import SkillsPanel      from '../../components/admin/SkillsPanel';
import ExperiencePanel  from '../../components/admin/ExperiencePanel';
import EducationPanel   from '../../components/admin/EducationPanel';
import CommunityPanel   from '../../components/admin/CommunityPanel';
import TestimonialsPanel from '../../components/admin/TestimonialsPanel';
import ContactPanel     from '../../components/admin/ContactPanel';
import SettingsPanel    from '../../components/admin/SettingsPanel';

type Section = 'projects' | 'skills' | 'experience' | 'education' | 'community' | 'testimonials' | 'messages' | 'settings';

const navItems: { id: Section; label: string; icon: LucideIcon }[] = [
  { id: 'projects',     label: 'Projects',     icon: FolderOpen    },
  { id: 'skills',       label: 'Skills',       icon: Zap           },
  { id: 'experience',   label: 'Experience',   icon: Briefcase     },
  { id: 'education',    label: 'Education',    icon: GraduationCap },
  { id: 'community',    label: 'Community',    icon: Users         },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  { id: 'messages',     label: 'Messages',     icon: Mail          },
  { id: 'settings',     label: 'Settings',     icon: Settings      },
];

const sectionTitles: Record<Section, string> = {
  projects:     'Projects',
  skills:       'Skills',
  experience:   'Experience',
  education:    'Education',
  community:    'Community',
  testimonials: 'Testimonials',
  messages:     'Messages',
  settings:     'Settings',
};

type SidebarProps = {
  mobile?: boolean;
  collapsed: boolean;
  active: Section;
  onCollapse: () => void;
  onClose: () => void;
  onSelect: (id: Section) => void;
  onLogout: () => void;
};

const SidebarContent = ({ mobile = false, collapsed, active, onCollapse, onClose, onSelect, onLogout }: SidebarProps) => (
  <div className="flex flex-col h-full">
    {/* Logo */}
    <div className={`flex items-center gap-3 border-b border-[#E6EAF4] min-h-[64px] ${mobile ? 'px-5' : collapsed ? 'px-4 justify-center' : 'px-5'}`}>
      <div className="w-9 h-9 bg-[#1A56FF] rounded-xl flex items-center justify-center shrink-0">
        <Terminal size={18} className="text-white" />
      </div>
      {(!collapsed || mobile) && (
        <div className="flex-1 min-w-0">
          <p className="text-[#0A0A0F] font-bold text-sm leading-none truncate tracking-tight">CodeSidney</p>
          <p className="text-[#8892A4] text-[11px] mt-0.5">Admin Panel</p>
        </div>
      )}
      {!mobile && (
        <button
          onClick={onCollapse}
          className="text-[#8892A4] hover:text-[#0A0A0F] transition-colors shrink-0 ml-auto p-1 rounded-lg hover:bg-[#F4F6FF]"
        >
          <ChevronRight size={14} className={`transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      )}
      {mobile && (
        <button onClick={onClose} className="ml-auto p-1.5 rounded-lg text-[#8892A4] hover:text-[#0A0A0F] hover:bg-[#F4F6FF]">
          <X size={18} />
        </button>
      )}
    </div>

    {/* Nav */}
    <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
      {navItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          title={(!mobile && collapsed) ? label : undefined}
          className={`w-full flex items-center gap-3 rounded-xl text-left transition-all duration-150 font-medium text-sm
            ${(!mobile && collapsed) ? 'px-3 py-2.5 justify-center' : 'px-3.5 py-2.5'}
            ${active === id
              ? 'bg-[#1A56FF] text-white shadow-sm shadow-[#1A56FF]/20'
              : 'text-[#8892A4] hover:text-[#0A0A0F] hover:bg-[#F4F6FF]'
            }`}
        >
          <Icon size={16} className="shrink-0" />
          {(mobile || !collapsed) && <span className="truncate">{label}</span>}
        </button>
      ))}
    </nav>

    {/* Bottom */}
    <div className="p-3 border-t border-[#E6EAF4] flex flex-col gap-0.5">
      <a
        href="/"
        title={(!mobile && collapsed) ? 'Portfolio' : undefined}
        className={`flex items-center gap-3 rounded-xl transition-colors text-sm font-medium text-[#8892A4] hover:text-[#0A0A0F] hover:bg-[#F4F6FF]
          ${(!mobile && collapsed) ? 'px-3 py-2.5 justify-center' : 'px-3.5 py-2.5'}`}
      >
        <ChevronRight size={16} className="shrink-0 rotate-180" />
        {(mobile || !collapsed) && <span>Portfolio</span>}
      </a>
      <button
        onClick={onLogout}
        title={(!mobile && collapsed) ? 'Logout' : undefined}
        className={`flex items-center gap-3 rounded-xl transition-colors text-sm font-medium text-[#8892A4] hover:text-red-500 hover:bg-red-50
          ${(!mobile && collapsed) ? 'px-3 py-2.5 justify-center' : 'px-3.5 py-2.5'}`}
      >
        <LogOut size={16} className="shrink-0" />
        {(mobile || !collapsed) && <span>Logout</span>}
      </button>
    </div>
  </div>
);

export default function AdminDashboard() {
  const navigate   = useNavigate();
  const [active, setActive]       = useState<Section>('projects');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useAdminHead(`${sectionTitles[active]} — Admin | CodeSidney`);

  useEffect(() => {
    if (!isAuthenticated()) navigate({ to: '/admin/login' });
  }, [navigate]);

  // Close mobile drawer when section changes
  const selectSection = (id: Section) => { setActive(id); setMobileOpen(false); };

  const handleLogout = () => { clearToken(); navigate({ to: '/admin/login' }); };

  const panels: Record<Section, React.ReactNode> = {
    projects:     <ProjectsPanel />,
    skills:       <SkillsPanel />,
    experience:   <ExperiencePanel />,
    education:    <EducationPanel />,
    community:    <CommunityPanel />,
    testimonials: <TestimonialsPanel />,
    messages:     <ContactPanel />,
    settings:     <SettingsPanel />,
  };

  return (
    <div className="min-h-screen bg-[#F4F6FF] flex">

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-[#E6EAF4] z-50 shadow-xl transition-transform duration-200 lg:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent mobile collapsed={collapsed} active={active} onCollapse={() => setCollapsed(p => !p)} onClose={() => setMobileOpen(false)} onSelect={selectSection} onLogout={handleLogout} />
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside
        className={`hidden lg:flex flex-col sticky top-0 h-screen bg-white border-r border-[#E6EAF4] shadow-sm transition-all duration-200 shrink-0`}
        style={{ width: collapsed ? '64px' : '220px' }}
      >
        <SidebarContent collapsed={collapsed} active={active} onCollapse={() => setCollapsed(p => !p)} onClose={() => setMobileOpen(false)} onSelect={selectSection} onLogout={handleLogout} />
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#E6EAF4] px-4 sm:px-6 h-16 flex items-center gap-4 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl text-[#8892A4] hover:text-[#0A0A0F] hover:bg-[#F4F6FF] transition-colors"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-[#0A0A0F] font-bold text-lg leading-none">{sectionTitles[active]}</h1>
            <p className="text-[#8892A4] text-xs mt-0.5">Manage your content</p>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {panels[active]}
        </div>
      </main>
    </div>
  );
}
