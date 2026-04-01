import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Github, Linkedin, Mail, ArrowDown, Briefcase, Code2, MapPin } from 'lucide-react';
import HeroBackground from '../three/HeroBackground';
import { api } from '../../services/api';

const TYPED_STRINGS = [
  'Full Stack Developer',
  'React & Node.js Engineer',
  'TypeScript Enthusiast',
  'Problem Solver',
];

const TypingAnimation = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const current = TYPED_STRINGS[currentIndex];

    if (!deleting && displayed === current) {
      timeoutRef.current = setTimeout(() => setDeleting(true), 2000);
      return;
    }

    if (deleting && displayed === '') {
      setDeleting(false);
      setCurrentIndex((i) => (i + 1) % TYPED_STRINGS.length);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setDisplayed(prev =>
        deleting ? prev.slice(0, -1) : current.slice(0, prev.length + 1)
      );
    }, deleting ? 50 : 100);

    return () => clearTimeout(timeoutRef.current);
  }, [displayed, deleting, currentIndex]);

  return (
    <span className="text-[#FFD600]">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
};

const Hero = () => {
  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: api.settings.get,
    staleTime: 1000 * 60 * 2,
  });

  const s = settings as Record<string, string> | undefined;
  const tagline  = s?.tagline  || 'Code that solves real problems — not just runs. Building scalable web applications from frontend to backend.';
  const photoUrl = s?.heroImageUrl || 'https://res.cloudinary.com/diia0dapa/image/upload/v1774165277/portfolio/hero/1774165274168-heroImage.png';
  const focalPt  = s?.heroFocalPoint || '50% 50%';
  const githubUrl   = s?.githubUrl   || 'https://github.com/bensidney';
  const linkedinUrl = s?.linkedinUrl || 'https://linkedin.com/in/bensidney';
  const emailVal    = s?.email       || 'bensidneyndungu@gmail.com';

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1A56FF 0%, #0D2DB4 100%)' }}
    >
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-30">
        <HeroBackground />
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-20 right-32 w-64 h-64 bg-[#FFD600]
                      rounded-full opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-16 w-48 h-48 bg-white
                      rounded-full opacity-5 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-24
                      w-full pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — Text */}
          <div className="flex flex-col gap-6">

            {/* Status row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 flex-wrap"
            >
              <span className="flex items-center gap-1.5 text-white/60 font-body text-sm">
                <MapPin size={13} className="text-[#FFD600]" />
                Kenya
              </span>
              <span className="w-px h-3.5 bg-white/20" />
              <span className="flex items-center gap-1.5 font-body text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-emerald-400 font-medium">Open to work</span>
              </span>
            </motion.div>

            {/* Name */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p className="text-white/70 font-body text-lg mb-1">
                I'm
              </p>
              <h1 className="font-heading font-extrabold text-white leading-tight"
                style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
                Bensidney<br />
                <span className="text-[#FFD600]">Githu</span> Ndung'u
              </h1>
            </motion.div>

            {/* Typing animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-heading font-bold text-2xl md:text-3xl text-white"
            >
              <TypingAnimation />
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-body text-white/70 text-lg max-w-md leading-relaxed"
            >
              {tagline}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  document.getElementById('portfolio')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="bg-[#FFD600] text-[#0A0A0F] font-body font-semibold
                           px-8 py-3.5 rounded-full hover:bg-yellow-400
                           transition-colors shadow-lg"
              >
                View Projects
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  document.getElementById('contact')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="bg-transparent text-white font-body font-semibold
                           px-8 py-3.5 rounded-full border-2 border-white/40
                           hover:border-white hover:bg-white/10
                           transition-all"
              >
                Contact Me
              </motion.button>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-4 mt-2"
            >
              {[
                { icon: Github, href: githubUrl, label: 'GitHub' },
                { icon: Linkedin, href: linkedinUrl, label: 'LinkedIn' },
                { icon: Mail, href: `mailto:${emailVal}`, label: 'Email' },
              ].map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, y: -3 }}
                  className="w-10 h-10 rounded-full bg-white/10
                             border border-white/20 flex items-center
                             justify-center text-white hover:bg-white/20
                             transition-colors"
                  aria-label={label}
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Right — Photo + Floating Cards */}
          <div className="relative flex justify-center items-center">

            {/* Photo circle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* Outer ring */}
              <div className="w-72 h-72 md:w-80 md:h-80 rounded-full
                              border-2 border-[#FFD600]/40 p-2">
                {/* Inner ring */}
                <div className="w-full h-full rounded-full
                                border-2 border-white/20 p-2">
                  {/* Photo placeholder / actual photo */}
                  <div className="w-full h-full rounded-full
                                  bg-white/10 backdrop-blur-sm
                                  flex items-center justify-center
                                  border border-white/10 overflow-hidden">
                    {photoUrl
                      ? <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" style={{ objectPosition: focalPt }} />
                      : <span className="text-white/40 font-heading text-lg">Your Photo</span>
                    }
                  </div>
                </div>
              </div>

              {/* Floating card — Experience */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="absolute -left-12 top-8 bg-white rounded-2xl
                           px-4 py-3 shadow-xl flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl
                                flex items-center justify-center">
                  <Briefcase size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-heading font-bold text-[#0A0A0F] text-sm">
                    1+
                  </p>
                  <p className="font-body text-[#8892A4] text-xs">
                    Years Experience
                  </p>
                </div>
              </motion.div>

              {/* Floating card — Projects */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 3.5,
                             ease: 'easeInOut', delay: 0.5 }}
                className="absolute -right-12 bottom-12 bg-white rounded-2xl
                           px-4 py-3 shadow-xl flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-[#FFD600]/10 rounded-xl
                                flex items-center justify-center">
                  <Code2 size={18} className="text-[#FFD600]" />
                </div>
                <div>
                  <p className="font-heading font-bold text-[#0A0A0F] text-sm">
                    5+
                  </p>
                  <p className="font-body text-[#8892A4] text-xs">
                    Projects Built
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll down indicator */}
        <motion.button
          onClick={scrollToAbout}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2
                     flex flex-col items-center gap-2 text-white/60
                     hover:text-white transition-colors"
        >
          <span className="font-body text-xs">Scroll Down</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ArrowDown size={18} />
          </motion.div>
        </motion.button>
      </div>
    </section>
  );
};

export default Hero;