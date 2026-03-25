export interface Project {
  projectId: number;
  title: string;
  description: string;
  techStack: string[];
  imageUrl: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
  order: number;
  createdAt: string | null;
}

export interface Skill {
  skillId: number;
  name: string;
  category: string;
  iconUrl: string | null;
  order: number;
}

export interface Experience {
  experienceId: number;
  company: string;
  role: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  bullets: string[] | null;
  order: number;
}

export interface Education {
  educationId: number;
  institution: string;
  degree: string;
  description: string | null;
  logoUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  order: number;
}

export interface Testimonial {
  testimonialId: number;
  name: string;
  role: string;
  avatarUrl: string | null;
  message: string;
  rating: number;
  order: number;
}

export interface Community {
  communityId: number;
  name: string;
  role: string | null;
  description: string | null;
  logoUrl: string | null;
  bioUrl: string | null;
  order: number;
}