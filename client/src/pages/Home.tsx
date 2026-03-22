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
import { useDynamicHead } from '../hooks/useDynamicHead';

const Home = () => {
  useDynamicHead();
  return (
    <main className="relative">
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
