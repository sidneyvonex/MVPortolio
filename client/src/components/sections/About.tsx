import { motion } from 'framer-motion';
import { Code2, Globe, Server, Layers } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fadeInLeft, fadeInRight, fadeInUp, staggerContainer } from '../../lib/animations';
import { api } from '../../services/api';

const stats = [
  { value: '1+',  label: 'Years Experience',  bg: 'bg-[#1A56FF]/10', text: 'text-[#1A56FF]' },
  { value: '5+',  label: 'Projects Built',     bg: 'bg-[#FFD600]/20', text: 'text-[#0A0A0F]' },
  { value: '2+',  label: 'Certifications',     bg: 'bg-[#0D2DB4]/10', text: 'text-[#0D2DB4]' },
  { value: '10+', label: 'Technologies',       bg: 'bg-[#F4F6FF]',    text: 'text-[#1A56FF]' },
];

const whatIDo = [
  {
    icon: Globe,
    title: 'Frontend Development',
    description: 'Building responsive, performant UIs with React, Next.js and Tailwind CSS.',
    accent: '#1A56FF',
  },
  {
    icon: Server,
    title: 'Backend Development',
    description: 'Designing RESTful APIs with Node.js, Express and PostgreSQL.',
    accent: '#FFD600',
  },
  {
    icon: Layers,
    title: 'Full Stack Apps',
    description: 'End-to-end architecture with auth, role-based access and CI/CD.',
    accent: '#0D2DB4',
  },
  {
    icon: Code2,
    title: 'DevOps & Tools',
    description: 'Docker, GitHub Actions, AWS, Jest — shipping reliable software.',
    accent: '#1A56FF',
  },
];

const About = () => {
  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: api.settings.get,
    staleTime: 1000 * 60 * 5,
  });
  const s = settingsData as Record<string, string> | undefined;

  const photoUrl  = s?.heroImageUrl || 'https://res.cloudinary.com/diia0dapa/image/upload/v1774165277/portfolio/hero/1774165274168-heroImage.png';
  const aboutBio  = s?.aboutBio    || null;
  const bio1 = aboutBio ?? 'Results-driven Full-Stack Software Engineer with 1+ years of experience building and deploying production-ready web applications using TypeScript, React, Next.js, Node.js, and PostgreSQL.';
  const bio2 = 'Strong understanding of end-to-end application architecture, RESTful APIs, authentication, and role-based access control. Currently pursuing a BSc. in Software Engineering at the University of Eastern Africa, Baraton.';

  return (
    <section id="about" className="min-h-screen bg-white section-padding">
      <div className="max-w-7xl mx-auto">

        {/* Section Heading */}
        <motion.div
          variants={fadeInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-16"
        >
          <div className="w-12 h-1 bg-[#1A56FF] rounded-full" />
          <h2 className="section-heading">About Me</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT — Photo + Stats */}
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative"
          >
            {/* Photo */}
            <div className="relative w-full max-w-sm mx-auto">
              <div className="absolute -top-4 -left-4 w-full h-full
                              bg-[#F4F6FF] rounded-3xl -z-10" />
              <div className="absolute -bottom-4 -right-4 w-full h-full
                              border-2 border-[#1A56FF]/20 rounded-3xl -z-10" />
              <div className="w-full aspect-square rounded-3xl bg-[#F4F6FF]
                              flex items-center justify-center overflow-hidden
                              border border-gray-100">
                {photoUrl ? (
                  <img src={photoUrl} alt="About" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#8892A4] font-body">Your Photo Here</span>
                )}
              </div>
              <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#FFD600] rounded-full" />
              <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-[#1A56FF] rounded-full" />
            </div>

            {/* Stats */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4 mt-12"
            >
              {stats.map(({ value, label, bg, text }) => (
                <motion.div
                  key={label}
                  variants={fadeInUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`${bg} rounded-2xl p-5 text-center
                             cursor-default shadow-sm hover:shadow-lg
                             transition-all duration-300`}
                >
                  <p className={`font-heading font-extrabold text-3xl ${text}`}>{value}</p>
                  <p className="font-body text-sm mt-1 text-[#8892A4]">{label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT — Bio + What I Do */}
          <motion.div
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col gap-8"
          >
            {/* Bio */}
            <div>
              <p className="font-body text-[#8892A4] text-lg mb-1">Who am I?</p>
              <h3 className="font-heading font-bold text-2xl text-[#0A0A0F] mb-4">
                {"I'm "}
                <span className="text-[#1A56FF]">Bensidney Githu Ndung&apos;u</span>
                {", Full Stack Developer"}
              </h3>
              <p className="font-body text-[#8892A4] leading-relaxed">
                {bio1}
              </p>
              <p className="font-body text-[#8892A4] leading-relaxed mt-3">
                {bio2}
              </p>
            </div>

            {/* What I Do */}
            <div>
              <p className="font-mono text-xs text-[#8892A4] mb-4">// what_i_do[]</p>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {whatIDo.map(({ icon: Icon, title, description, accent }) => (
                  <motion.div
                    key={title}
                    variants={fadeInUp}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="relative bg-white rounded-2xl p-5 border border-gray-100
                               shadow-sm hover:shadow-lg transition-all duration-300
                               overflow-hidden group cursor-default"
                  >
                    <span
                      className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2
                                 opacity-30 group-hover:opacity-100 transition-opacity"
                      style={{ borderColor: accent }}
                    />
                    <span
                      className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2
                                 opacity-30 group-hover:opacity-100 transition-opacity"
                      style={{ borderColor: accent }}
                    />
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: `${accent}18` }}
                    >
                      <Icon size={20} style={{ color: accent }} />
                    </div>
                    <p className="font-heading font-bold text-sm text-[#0A0A0F] mb-1">{title}</p>
                    <p className="font-body text-xs text-[#8892A4] leading-relaxed">{description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* CTAs */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="bg-[#1A56FF] text-white font-body font-semibold
                           px-6 py-3 rounded-full hover:bg-[#0D2DB4]
                           transition-colors shadow-md"
              >
                {"Let's Work Together"}
              </motion.button>

            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
