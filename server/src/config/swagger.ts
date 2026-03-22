import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Portfolio API',
            version: '1.0.0',
            description: `
## Portfolio Backend API

All **Admin** endpoints require a Bearer token in the Authorization header.

Get a token by calling \`POST /api/auth/login\`.

** Public**  No authentication required  
** Admin**Requires \`Authorization: Bearer <token>\`
            `,
        },
        servers: [{ url: '/api', description: 'API base path' }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                // Auth
                LoginBody: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', minLength: 8 },
                    },
                },
                // Projects
                Project: {
                    type: 'object',
                    properties: {
                        projectId: { type: 'integer' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        techStack: { type: 'array', items: { type: 'string' } },
                        imageUrl: { type: 'string', nullable: true },
                        liveUrl: { type: 'string', nullable: true },
                        githubUrl: { type: 'string', nullable: true },
                        featured: { type: 'boolean' },
                        order: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time', nullable: true },
                    },
                },
                ProjectBody: {
                    type: 'object',
                    required: ['title', 'description', 'techStack'],
                    properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        techStack: { type: 'string', description: 'Comma-separated or JSON array' },
                        imageUrl: { type: 'string' },
                        liveUrl: { type: 'string' },
                        githubUrl: { type: 'string' },
                        featured: { type: 'boolean' },
                        order: { type: 'integer' },
                    },
                },
                // Skills
                Skill: {
                    type: 'object',
                    properties: {
                        skillId: { type: 'integer' },
                        name: { type: 'string' },
                        category: { type: 'string' },
                        iconUrl: { type: 'string', nullable: true },
                        order: { type: 'integer' },
                    },
                },
                SkillBody: {
                    type: 'object',
                    required: ['name', 'category'],
                    properties: {
                        name: { type: 'string' },
                        category: { type: 'string' },
                        iconUrl: { type: 'string' },
                        order: { type: 'integer' },
                    },
                },
                // Experience
                Experience: {
                    type: 'object',
                    properties: {
                        experienceId: { type: 'integer' },
                        company: { type: 'string' },
                        role: { type: 'string' },
                        location: { type: 'string', nullable: true },
                        startDate: { type: 'string' },
                        endDate: { type: 'string', nullable: true, description: 'null = current job' },
                        bullets: { type: 'array', items: { type: 'string' }, nullable: true },
                        order: { type: 'integer' },
                    },
                },
                ExperienceBody: {
                    type: 'object',
                    required: ['company', 'role', 'startDate'],
                    properties: {
                        company: { type: 'string' },
                        role: { type: 'string' },
                        location: { type: 'string' },
                        startDate: { type: 'string' },
                        endDate: { type: 'string' },
                        bullets: { type: 'array', items: { type: 'string' } },
                        order: { type: 'integer' },
                    },
                },
                // Testimonials
                Testimonial: {
                    type: 'object',
                    properties: {
                        testimonialId: { type: 'integer' },
                        name: { type: 'string' },
                        role: { type: 'string' },
                        avatarUrl: { type: 'string', nullable: true },
                        message: { type: 'string' },
                        rating: { type: 'integer', minimum: 1, maximum: 5 },
                        order: { type: 'integer' },
                    },
                },
                TestimonialBody: {
                    type: 'object',
                    required: ['name', 'role', 'message'],
                    properties: {
                        name: { type: 'string' },
                        role: { type: 'string' },
                        avatarUrl: { type: 'string' },
                        message: { type: 'string' },
                        rating: { type: 'integer', minimum: 1, maximum: 5 },
                        order: { type: 'integer' },
                    },
                },
                // Contact
                ContactMessage: {
                    type: 'object',
                    properties: {
                        contactMessageId: { type: 'integer' },
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        message: { type: 'string' },
                        read: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time', nullable: true },
                    },
                },
                ContactBody: {
                    type: 'object',
                    required: ['name', 'email', 'message'],
                    properties: {
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        message: { type: 'string' },
                    },
                },
                // Education
                Education: {
                    type: 'object',
                    properties: {
                        educationId: { type: 'integer' },
                        institution: { type: 'string' },
                        degree: { type: 'string' },
                        description: { type: 'string', nullable: true },
                        logoUrl: { type: 'string', nullable: true },
                        startDate: { type: 'string', nullable: true },
                        endDate: { type: 'string', nullable: true },
                        order: { type: 'integer' },
                    },
                },
                EducationBody: {
                    type: 'object',
                    required: ['institution', 'degree'],
                    properties: {
                        institution: { type: 'string' },
                        degree: { type: 'string' },
                        description: { type: 'string' },
                        logoUrl: { type: 'string' },
                        startDate: { type: 'string' },
                        endDate: { type: 'string' },
                        order: { type: 'integer' },
                    },
                },
                // Community
                Community: {
                    type: 'object',
                    properties: {
                        communityId: { type: 'integer' },
                        name: { type: 'string' },
                        role: { type: 'string', nullable: true },
                        description: { type: 'string', nullable: true },
                        logoUrl: { type: 'string', nullable: true },
                        bioUrl: { type: 'string', nullable: true },
                        order: { type: 'integer' },
                    },
                },
                CommunityBody: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string' },
                        role: { type: 'string' },
                        description: { type: 'string' },
                        logoUrl: { type: 'string' },
                        bioUrl: { type: 'string' },
                        order: { type: 'integer' },
                    },
                },
                // Generic responses
                MessageResponse: {
                    type: 'object',
                    properties: { message: { type: 'string' } },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: { error: { type: 'string' } },
                },
                ImageUploadResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        imageUrl: { type: 'string', description: 'Cloudinary URL' },
                    },
                },
            },
        },
    },
    apis: [
        path.join(__dirname, '../User/user.routes.ts'),
        path.join(__dirname, '../Projects/projects.routes.ts'),
        path.join(__dirname, '../Skills/skills.routes.ts'),
        path.join(__dirname, '../Experience/experience.routes.ts'),
        path.join(__dirname, '../Testimonials/Testimonials.routes.ts'),
        path.join(__dirname, '../Contact/contact.routes.ts'),
        path.join(__dirname, '../Education/education.routes.ts'),
        path.join(__dirname, '../Community/community.routes.ts'),
    ],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customSiteTitle: 'Portfolio API Docs',
        swaggerOptions: { persistAuthorization: true },
    }));
    app.get('/api/docs.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};
