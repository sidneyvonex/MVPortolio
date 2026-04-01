import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Download, Terminal } from 'lucide-react';
import { useActiveSection, sections } from '../../hooks/useActiveSection';
import { api } from '../../services/api';
import type { SettingsMap } from '../../services/adminApi';

// Only show a subset in the top nav (not hero)
const navLinks = sections.filter(s => s.id !== 'hero');

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { activeSection, scrollToSection } = useActiveSection();

  const { data: settings } = useQuery<SettingsMap>({
    queryKey: ['settings'],
    queryFn: () => api.settings.get() as Promise<SettingsMap>,
  });
  const BASE_URL = import.meta.env.VITE_API_URL || '/api';
  const resumeUrl = settings?.resumeUrl ? `${BASE_URL}/settings/resume/download` : '#';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (id: string) => {
    scrollToSection(id);
    setMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
          ${scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-black/5'
            : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-16 xl:px-24 py-4">

          {/* Brand mark */}
          <motion.button
            onClick={() => handleNav('hero')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 shrink-0"
          >
            <span
              className={`flex items-center justify-center w-8 h-8 rounded-lg text-white text-xs font-bold
                bg-gradient-to-br from-[#1A56FF] to-[#0D2DB4] shadow-md`}
            >
              <Terminal size={14} />
            </span>
            <span className={`font-heading font-bold text-base tracking-tight transition-colors duration-300
              ${scrolled ? 'text-[#0A0A0F]' : 'text-white'}`}
            >
              Code<span className="text-[#1A56FF]">Sidney</span>
            </span>
          </motion.button>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-5">
            {navLinks.map(({ id, label }) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  onClick={() => handleNav(id)}
                  className={`relative pb-1 font-body text-sm font-medium
                    transition-colors duration-200
                    ${scrolled
                      ? isActive ? 'text-[#1A56FF]' : 'text-[#0A0A0F]/70 hover:text-[#1A56FF]'
                      : isActive ? 'text-white' : 'text-white/75 hover:text-white'
                    }`}
                >
                  {label}
                  {isActive && (
                    <motion.span
                      layoutId="navUnderline"
                      className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full
                        ${scrolled ? 'bg-[#1A56FF]' : 'bg-[#FFD600]'}`}
                      transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <motion.a
              href={resumeUrl}
              download="resume.pdf"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl
                font-body text-sm font-semibold transition-all duration-300
                ${scrolled
                  ? 'bg-[#1A56FF] text-white shadow-md shadow-[#1A56FF]/30 hover:bg-[#0D2DB4]'
                  : 'bg-white text-[#1A56FF] hover:bg-white/90 shadow-md shadow-black/20'
                }`}
            >
              <Download size={14} />
              Resume
            </motion.a>
          </div>

          {/* Mobile hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen(!menuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors duration-300
              ${scrolled
                ? 'text-[#0A0A0F] hover:bg-gray-100'
                : 'text-white hover:bg-white/10'}`}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-[#0A0A0F]/95 backdrop-blur-xl
                       flex flex-col items-center justify-center gap-2 px-8"
          >
            {/* Brand in overlay */}
            <div className="absolute top-6 left-4 right-4 flex justify-between items-center px-2">
              <span className="font-heading font-bold text-white text-lg">
                Code<span className="text-[#1A56FF]">Sidney</span>
              </span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMenuOpen(false)}
                className="text-white/60 hover:text-white p-2"
              >
                <X size={22} />
              </motion.button>
            </div>

            {/* Decorative code snippet */}
            <div className="mb-8 font-mono text-xs text-white/20 text-center leading-6">
              <span className="text-[#1A56FF]/60">const</span> navigate = <span className="text-[#FFD600]/60">(section)</span> {'=>'} ...
            </div>

            {/* Nav links */}
            {sections.map(({ id, label }, i) => (
              <motion.button
                key={id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                onClick={() => handleNav(id)}
                className={`w-full max-w-xs text-left px-6 py-3.5 rounded-xl font-heading text-lg font-semibold
                  transition-all duration-200 flex items-center justify-between group
                  ${activeSection === id
                    ? 'text-[#1A56FF] bg-[#1A56FF]/10'
                    : 'text-white/80 hover:text-white hover:bg-white/5'}`}
              >
                {label}
                <span className={`text-xs font-mono font-normal transition-opacity
                  ${activeSection === id ? 'opacity-60 text-[#1A56FF]' : 'opacity-0 group-hover:opacity-30'}`}>
                  #{id}
                </span>
              </motion.button>
            ))}

            <motion.a
              href={resumeUrl}
              download="resume.pdf"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mt-6 flex items-center gap-2 bg-[#1A56FF] text-white
                         px-8 py-3.5 rounded-xl font-body font-semibold
                         shadow-lg shadow-[#1A56FF]/30"
            >
              <Download size={16} />
              Download Resume
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;