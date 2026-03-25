import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import DotNavigation from '../components/layout/DotNavigation';
import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Resume from '../components/sections/Resume';
import Skills from '../components/sections/Skills';
import Portfolio from '../components/sections/Portfolio';
import Education from '../components/sections/Education';
import Community from '../components/sections/Community';
import Testimonials from '../components/sections/Testimonials';
import Contact from '../components/sections/Contact';
import PageLoader from '../components/ui/PageLoader';
import { useDynamicHead } from '../hooks/useDynamicHead';
import { api } from '../services/api';

const Home = () => {
  useDynamicHead();

  const { isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: api.settings.get,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  if (isLoading) return <PageLoader />;

  return (
    <main className="relative animate-fadeIn">
      <Navbar />
      <DotNavigation />
      <Hero />
      <About />
      <Resume />
      <Skills />
      <Portfolio />
      <Education />
      <Community />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
};

export default Home;
