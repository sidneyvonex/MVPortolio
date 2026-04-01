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

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
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
        className={`fixed top-0 left-0 right-0 z-50 h-16 lg:h-[72px] transition-all duration-500
          ${scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-black/5'
            : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl h-full mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-16 xl:px-24">

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

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu backdrop"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-[52] bg-[#0A0A0F]/45"
            />

            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
              className="lg:hidden fixed left-0 right-0 top-[calc(env(safe-area-inset-top)+4rem)] z-[53] px-4"
            >
              <div className="mx-auto w-full max-w-7xl max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl border border-white/10 bg-[#0A0A0F]/95 backdrop-blur-xl shadow-2xl p-3">
                <div className="flex flex-col gap-1.5">
                  {navLinks.map(({ id, label }, i) => (
                    <motion.button
                      key={id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                      onClick={() => handleNav(id)}
                      className={`w-full text-left px-4 py-3 rounded-xl font-heading text-base font-semibold transition-colors
                        ${activeSection === id
                          ? 'text-[#1A56FF] bg-white/10'
                          : 'text-white/85 hover:text-white hover:bg-white/8'}`}
                    >
                      {label}
                    </motion.button>
                  ))}

                  <motion.a
                    href={resumeUrl}
                    download="resume.pdf"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                    className="mt-1 flex items-center justify-center gap-2 bg-[#1A56FF] text-white px-4 py-3 rounded-xl font-body font-semibold shadow-lg shadow-[#1A56FF]/30"
                  >
                    <Download size={16} />
                    Download Resume
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;