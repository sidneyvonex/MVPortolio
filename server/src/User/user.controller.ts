import https from 'https';
import http from 'http';
import { Request, Response } from 'express';
import { registerUserService, loginUserService } from './user.service';
import db from '../db/index';
import { siteSettingsTable } from '../db/schema';

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }
    if (password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
    }
    try {
        const result = await registerUserService(email, password);
        res.status(201).json({ message: result });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        res.status(400).json({ error: message });
    }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }
    try {
        const token = await loginUserService(email, password);
        res.status(200).json({ token });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        res.status(401).json({ error: message });
    }
};

// POST /api/auth/upload/hero  — upload hero section image to Cloudinary and save URL
export const uploadHeroImage = async (req: Request, res: Response) => {
    const imageUrl = (req.file as any)?.path;
    if (!imageUrl) {
        res.status(400).json({ error: 'No image file provided' });
        return;
    }
    try {
        await db
            .insert(siteSettingsTable)
            .values({ key: 'heroImageUrl', value: imageUrl })
            .onConflictDoUpdate({
                target: siteSettingsTable.key,
                set: { value: imageUrl, updatedAt: new Date() },
            });
        res.status(200).json({
            message: 'Hero image uploaded successfully',
            imageUrl,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        res.status(500).json({ error: message });
    }
};

// GET /api/settings/hero — fetch the saved hero image URL
export const getHeroImageUrl = async (_req: Request, res: Response) => {
    try {
        const setting = await db.query.siteSettingsTable.findFirst({
            where: (t, { eq }) => eq(t.key, 'heroImageUrl'),
        });
        if (!setting) {
            res.status(404).json({ error: 'No hero image set yet' });
            return;
        }
        res.status(200).json({ imageUrl: setting.value });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        res.status(500).json({ error: message });
    }
};

// POST /api/settings/resume — save resume URL (admin only)
export const setResumeUrl = async (req: Request, res: Response) => {
    const { url } = req.body;
    if (!url) {
        res.status(400).json({ error: 'url is required' });
        return;
    }
    try {
        await db
            .insert(siteSettingsTable)
            .values({ key: 'resumeUrl', value: url })
            .onConflictDoUpdate({
                target: siteSettingsTable.key,
                set: { value: url, updatedAt: new Date() },
            });
        res.status(200).json({ message: 'Resume URL saved', url });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        res.status(500).json({ error: message });
    }
};

// GET /api/settings/resume — fetch resume URL (public)
export const getResumeUrl = async (_req: Request, res: Response) => {
    try {
        const setting = await db.query.siteSettingsTable.findFirst({
            where: (t, { eq }) => eq(t.key, 'resumeUrl'),
        });
        if (!setting) {
            res.status(404).json({ error: 'No resume URL set yet' });
            return;
        }
        res.status(200).json({ url: setting.value });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        res.status(500).json({ error: message });
    }
};

// POST /api/settings/tagline — save tagline (admin only)
export const setTagline = async (req: Request, res: Response) => {
    const { tagline } = req.body;
    if (!tagline) {
        res.status(400).json({ error: 'tagline is required' });
        return;
    }
    try {
        await db
            .insert(siteSettingsTable)
            .values({ key: 'tagline', value: tagline })
            .onConflictDoUpdate({
                target: siteSettingsTable.key,
                set: { value: tagline, updatedAt: new Date() },
            });
        res.status(200).json({ message: 'Tagline saved', tagline });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        res.status(500).json({ error: message });
    }
};

// GET /api/settings/tagline — fetch tagline (public)
export const getTagline = async (_req: Request, res: Response) => {
    try {
        const setting = await db.query.siteSettingsTable.findFirst({
            where: (t, { eq }) => eq(t.key, 'tagline'),
        });
        if (!setting) {
            res.status(404).json({ error: 'No tagline set yet' });
            return;
        }
        res.status(200).json({ tagline: setting.value });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        res.status(500).json({ error: message });
    }
};

// GET /api/settings — return all settings as a single object (public)
export const getAllSettings = async (_req: Request, res: Response) => {
    try {
        const rows = await db.query.siteSettingsTable.findMany();
        const settings = rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {} as Record<string, string>);
        res.status(200).json(settings);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        res.status(500).json({ error: message });
    }
};

// PUT /api/settings — batch-upsert any settings keys (admin only)
export const updateSettings = async (req: Request, res: Response) => {
    const updates = req.body as Record<string, string>;
    if (!updates || typeof updates !== 'object' || Array.isArray(updates) || Object.keys(updates).length === 0) {
        res.status(400).json({ error: 'Body must be a non-empty object of key-value settings' });
        return;
    }
    try {
        for (const [key, value] of Object.entries(updates)) {
            await db
                .insert(siteSettingsTable)
                .values({ key, value: String(value) })
                .onConflictDoUpdate({
                    target: siteSettingsTable.key,
                    set: { value: String(value), updatedAt: new Date() },
                });
        }
        res.status(200).json({ message: 'Settings updated', updated: Object.keys(updates) });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        res.status(500).json({ error: message });
    }
};

// POST /api/settings/resume/upload — upload PDF resume to Cloudinary (admin only)
export const uploadResumePdf = async (req: Request, res: Response) => {
    const pdfUrl = (req.file as any)?.path;
    if (!pdfUrl) {
        res.status(400).json({ error: 'No PDF file provided' });
        return;
    }
    try {
        await db
            .insert(siteSettingsTable)
            .values({ key: 'resumeUrl', value: pdfUrl })
            .onConflictDoUpdate({
                target: siteSettingsTable.key,
                set: { value: pdfUrl, updatedAt: new Date() },
            });
        res.status(200).json({ message: 'Resume uploaded successfully', resumeUrl: pdfUrl });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        res.status(500).json({ error: message });
    }
};

// GET /api/settings/resume/download — force-download the stored PDF as resume.pdf
export const downloadResume = async (req: Request, res: Response) => {
    try {
        const setting = await db.query.siteSettingsTable.findFirst({
            where: (t, { eq }) => eq(t.key, 'resumeUrl'),
        });
        const resumeUrl = setting?.value;
        if (!resumeUrl) {
            res.status(404).json({ error: 'Resume not found' });
            return;
        }
        // For Cloudinary raw URLs, inject the fl_attachment flag so Cloudinary
        // serves the file with Content-Disposition: attachment and the correct
        // Content-Type — avoids proxying and the 0-byte issue from unhandled redirects.
        if (resumeUrl.includes('res.cloudinary.com') && resumeUrl.includes('/raw/upload/')) {
            const downloadUrl = resumeUrl.replace('/raw/upload/', '/raw/upload/fl_attachment:resume.pdf/');
            res.redirect(307, downloadUrl);
            return;
        }
        // For non-Cloudinary URLs: proxy with redirect-following
        const fetchAndPipe = (url: string, hops = 0) => {
            if (hops > 5) { res.status(502).json({ error: 'Too many redirects' }); return; }
            const proto = url.startsWith('https') ? https : http;
            proto.get(url, (upstream) => {
                const { statusCode, headers } = upstream;
                if ((statusCode === 301 || statusCode === 302 || statusCode === 307 || statusCode === 308) && headers.location) {
                    upstream.resume();
                    fetchAndPipe(headers.location, hops + 1);
                    return;
                }
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
                upstream.pipe(res);
            }).on('error', () => res.status(502).json({ error: 'Failed to fetch resume' }));
        };
        fetchAndPipe(resumeUrl);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        res.status(500).json({ error: message });
    }
};