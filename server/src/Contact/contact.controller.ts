import { Request, Response } from 'express';
import {getAllContactMessagesService,getContactMessageByIdService,createContactMessageService,markContactMessageReadService,deleteContactMessageService} from './contact.service';

// GET /api/contact
export const getAllContactMessages = async (req: Request, res: Response) => {
    try {
        const messages = await getAllContactMessagesService();
        if (messages.length === 0) {
            res.status(404).json({ message: 'No contact messages found' });
            return;
        }
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        res.status(500).json({ error: message });
    }
};

// GET /api/contact/:contactMessageId
export const getContactMessageById = async (req: Request, res: Response) => {
    const contactMessageId = parseInt(req.params.contactMessageId as string);
    if (isNaN(contactMessageId)) {
        res.status(400).json({ error: 'Invalid contact message ID' });
        return;
    }
    try {
        const messageData = await getContactMessageByIdService(contactMessageId);
        if (!messageData) {
            res.status(404).json({ error: 'Contact message not found' });
            return;
        }
        res.status(200).json(messageData);
    } catch (error) {
        console.error('Error fetching contact message:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        res.status(500).json({ error: message });
    }
};

// POST /api/contact
export const createContactMessage = async (req: Request, res: Response) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        res.status(400).json({ error: 'Name, email, and message are required' });
        return;
    }
    try {
        const result = await createContactMessageService({ name, email, message });
        res.status(201).json({ message: result });
    } catch (error) {
        console.error('Error creating contact message:', error);
        const msg = error instanceof Error ? error.message : 'Internal Server Error';
        res.status(500).json({ error: msg });
    }
};

// PATCH /api/contact/:contactMessageId/read
export const markContactMessageRead = async (req: Request, res: Response) => {
    const contactMessageId = parseInt(req.params.contactMessageId as string);
    if (isNaN(contactMessageId)) {
        res.status(400).json({ error: 'Invalid contact message ID' });
        return;
    }
    try {
        const result = await markContactMessageReadService(contactMessageId);
        res.status(200).json({ message: result });
    } catch (error) {
        console.error('Error marking message as read:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        res.status(500).json({ error: message });
    }
};

// DELETE /api/contact/:contactMessageId
export const deleteContactMessage = async (req: Request, res: Response) => {
    const contactMessageId = parseInt(req.params.contactMessageId as string);
    if (isNaN(contactMessageId)) {
        res.status(400).json({ error: 'Invalid contact message ID' });
        return;
    }
    try {
        const result = await deleteContactMessageService(contactMessageId);
        res.status(200).json({ message: result });
    } catch (error) {
        console.error('Error deleting contact message:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        res.status(500).json({ error: message });
    }
};