import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail, Phone, MapPin, Github, Linkedin,
  Send, CheckCircle2, AlertCircle, Clock, Globe, Briefcase
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fadeInLeft, fadeInRight, fadeInUp } from '../../lib/animations';
import { api } from '../../services/api';

// ── Zod Schema ──
const contactSchema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters'),
  email:   z.string().email('Please enter a valid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactForm = z.infer<typeof contactSchema>;

// ── Main Component ──
const Contact = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: api.settings.get,
    staleTime: 1000 * 60 * 5,
  });
  const s = settingsData as Record<string, string> | undefined;

  const email      = s?.email      || 'bensidneyndungu@gmail.com';
  const phone      = s?.phone      || '+254 798 696 008';
  const location   = s?.location   || 'Nairobi, Kenya';
  const githubUrl  = s?.githubUrl  || 'https://github.com/bensidney';
  const linkedinUrl = s?.linkedinUrl || 'https://linkedin.com/in/bensidney';

  const contactInfo = [
    { icon: Mail,   label: 'Email',    value: email,    href: `mailto:${email}`,                  color: 'bg-[#1A56FF]/10 text-[#1A56FF]'  },
    { icon: Phone,  label: 'Phone',    value: phone,    href: `tel:${phone.replace(/\s+/g, '')}`, color: 'bg-[#FFD600]/15 text-[#B8960C]'  },
    { icon: MapPin, label: 'Location', value: location, href: null,                               color: 'bg-[#0D2DB4]/10 text-[#0D2DB4]'  },
  ];

  const socialLinks = [
    { icon: Github,   label: 'GitHub',   href: githubUrl,  color: 'hover:bg-[#0A0A0F] hover:text-white'          },
    { icon: Linkedin, label: 'LinkedIn', href: linkedinUrl, color: 'hover:bg-[#1A56FF] hover:text-white'         },
    { icon: Mail,     label: 'Email',    href: `mailto:${email}`, color: 'hover:bg-[#FFD600] hover:text-[#0A0A0F]' },
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    setStatus('loading');
    try {
      await api.contact.send(data);
      setStatus('success');
      reset();
      setTimeout(() => setStatus('idle'), 4000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <section id="contact" className="min-h-screen bg-[#F4F6FF] section-padding">
      <div className="max-w-7xl mx-auto">

        {/* Section Heading */}
        <motion.div
          variants={fadeInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-4"
        >
          <div className="w-12 h-1 bg-[#1A56FF] rounded-full" />
          <h2 className="section-heading">Contact Me</h2>
        </motion.div>

        <motion.p
          variants={fadeInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="font-body text-[#8892A4] mb-16 ml-16"
        >
          Feel free to reach out — I'd love to hear from you!
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Left — Contact Info ── */}
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col gap-8"
          >
            <div>
              <h3 className="font-heading font-bold text-2xl
                             text-[#0A0A0F] mb-3">
                Let's Talk
              </h3>
              <p className="font-body text-[#8892A4] leading-relaxed">
                I'm currently open to new opportunities, freelance projects,
                and collaborations. Whether you have a question or just want
                to say hi — my inbox is always open!
              </p>
            </div>

            {/* Contact items */}
            <div className="flex flex-col gap-4">
              {contactInfo.map(({ icon: Icon, label, value, href, color }) => (
                <motion.div
                  key={label}
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                  className="flex items-center gap-4 p-4 bg-white
                             rounded-2xl border border-gray-100
                             hover:border-[#1A56FF]/20 hover:shadow-md
                             transition-all duration-300"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center
                                  justify-center shrink-0 ${color}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="font-body text-[#8892A4] text-xs">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="font-body font-medium text-[#0A0A0F]
                                   text-sm hover:text-[#1A56FF] transition-colors"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="font-body font-medium text-[#0A0A0F] text-sm">
                        {value}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <div>
              <p className="font-body text-[#8892A4] text-sm mb-4">
                Find me on
              </p>
              <div className="flex gap-3">
                {socialLinks.map(({ icon: Icon, label, href, color }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-11 h-11 rounded-xl border border-gray-200
                               flex items-center justify-center
                               text-[#8892A4] bg-white ${color}
                               transition-all duration-200`}
                    aria-label={label}
                  >
                    <Icon size={18} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Availability status */}
            <motion.div
              variants={fadeInUp}
              className="p-5 rounded-2xl bg-white border border-gray-100
                         flex flex-col gap-3"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full
                                   rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5
                                   bg-emerald-500" />
                </span>
                <span className="font-mono text-xs font-semibold text-emerald-600
                                 tracking-wide">
                  AVAILABLE FOR WORK
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs text-[#8892A4]">
                <span className="flex items-center gap-1.5"><Clock size={11} /> Response time</span>
                <span className="text-[#0A0A0F] font-medium">~ 24 hrs</span>
                <span className="flex items-center gap-1.5"><Globe size={11} /> Timezone</span>
                <span className="text-[#0A0A0F] font-medium">EAT (UTC +3)</span>
                <span className="flex items-center gap-1.5"><Briefcase size={11} /> Open to</span>
                <span className="text-[#0A0A0F] font-medium">Remote / Hybrid</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right — Contact Form ── */}
          <motion.div
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white rounded-3xl p-8 border border-gray-100
                         shadow-sm flex flex-col gap-5"
            >
              <h3 className="font-heading font-bold text-xl text-[#0A0A0F]">
                Send a Message
              </h3>

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-sm font-medium text-[#0A0A0F]">
                  Your Name
                </label>
                <input
                  {...register('name')}
                  placeholder="Bensidney Ndung'u"
                  className={`font-body text-sm px-4 py-3 rounded-xl
                             border bg-[#F4F6FF] outline-none
                             transition-all duration-200
                             focus:border-[#1A56FF] focus:bg-white
                             focus:ring-2 focus:ring-[#1A56FF]/10
                             ${errors.name
                               ? 'border-red-300'
                               : 'border-gray-200'}`}
                />
                {errors.name && (
                  <p className="font-body text-red-500 text-xs flex
                               items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-sm font-medium text-[#0A0A0F]">
                  Email Address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className={`font-body text-sm px-4 py-3 rounded-xl
                             border bg-[#F4F6FF] outline-none
                             transition-all duration-200
                             focus:border-[#1A56FF] focus:bg-white
                             focus:ring-2 focus:ring-[#1A56FF]/10
                             ${errors.email
                               ? 'border-red-300'
                               : 'border-gray-200'}`}
                />
                {errors.email && (
                  <p className="font-body text-red-500 text-xs flex
                               items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-sm font-medium text-[#0A0A0F]">
                  Message
                </label>
                <textarea
                  {...register('message')}
                  rows={5}
                  placeholder="Hi Bensidney, I'd love to work with you on..."
                  className={`font-body text-sm px-4 py-3 rounded-xl
                             border bg-[#F4F6FF] outline-none resize-none
                             transition-all duration-200
                             focus:border-[#1A56FF] focus:bg-white
                             focus:ring-2 focus:ring-[#1A56FF]/10
                             ${errors.message
                               ? 'border-red-300'
                               : 'border-gray-200'}`}
                />
                {errors.message && (
                  <p className="font-body text-red-500 text-xs flex
                               items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={status === 'loading'}
                whileHover={{ scale: status === 'loading' ? 1 : 1.02 }}
                whileTap={{ scale: status === 'loading' ? 1 : 0.98 }}
                className={`flex items-center justify-center gap-2
                           font-body font-semibold text-sm px-6 py-3.5
                           rounded-xl transition-all duration-300
                           ${status === 'loading'
                             ? 'bg-[#1A56FF]/50 cursor-not-allowed text-white'
                             : status === 'success'
                             ? 'bg-green-500 text-white'
                             : status === 'error'
                             ? 'bg-red-500 text-white'
                             : 'bg-[#1A56FF] hover:bg-[#0D2DB4] text-white shadow-md'
                           }`}
              >
                {status === 'loading' && (
                  <div className="w-4 h-4 border-2 border-white/30
                                  border-t-white rounded-full animate-spin" />
                )}
                {status === 'success' && <CheckCircle2 size={16} />}
                {status === 'error' && <AlertCircle size={16} />}
                {status === 'idle' && <Send size={16} />}

                {status === 'loading' && 'Sending...'}
                {status === 'success' && 'Message Sent!'}
                {status === 'error'   && 'Failed — Try Again'}
                {status === 'idle'    && 'Send Message'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;