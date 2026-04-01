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

// GET /api/settings/resume/download — proxy-stream the PDF with download headers (follows redirects)
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

        // Fetch the PDF server-side, following up to 5 redirects, then
        // stream it back with headers that force the browser to download the file.
        const proxyDownload = (url: string, hops = 0) => {
            if (hops > 5) {
                if (!res.headersSent) res.status(502).json({ error: 'Too many redirects' });
                return;
            }
            const proto = url.startsWith('https') ? https : http;
            const reqOptions = new URL(url);
            proto.get(
                { hostname: reqOptions.hostname, path: reqOptions.pathname + reqOptions.search, headers: { 'User-Agent': 'node-pdf-proxy' } },
                (upstream) => {
                    const { statusCode, headers: upHeaders } = upstream;
                    if (
                        (statusCode === 301 || statusCode === 302 || statusCode === 307 || statusCode === 308) &&
                        upHeaders.location
                    ) {
                        // Follow redirect — resolve relative locations if needed
                        const next = upHeaders.location.startsWith('http')
                            ? upHeaders.location
                            : `${reqOptions.protocol}//${reqOptions.host}${upHeaders.location}`;
                        upstream.resume();
                        proxyDownload(next, hops + 1);
                        return;
                    }
                    if (statusCode !== 200) {
                        upstream.resume();
                        if (!res.headersSent) res.status(502).json({ error: `Upstream returned ${statusCode}` });
                        return;
                    }
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
                    if (upHeaders['content-length']) res.setHeader('Content-Length', upHeaders['content-length']);
                    upstream.pipe(res);
                }
            ).on('error', () => {
                if (!res.headersSent) res.status(502).json({ error: 'Failed to fetch resume' });
            });
        };

        proxyDownload(resumeUrl);
    } catch (error) {
        if (!res.headersSent) {
            const message = error instanceof Error ? error.message : 'Internal Server Error';
            res.status(500).json({ error: message });
        }
    }
};