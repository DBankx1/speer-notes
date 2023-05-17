import { NextFunction, Response } from 'express';
import { Container } from 'typedi';
import { RequestWithUser } from '@interfaces/auth.interface';
import { Note } from '@interfaces/notes.interface';
import { NoteService } from '@services/note.service';
import { CreateOrUpdateNoteDto, ShareNoteWithUserDto } from '@/dtos/notes.dto';
import { PrismaClient } from '@prisma/client';

export class NoteController {
    public prisma: PrismaClient;
    public noteService;

    constructor(prisma: PrismaClient){
        this.prisma = prisma;
        this.noteService =  new NoteService(prisma);
    }

    public getUserNotes = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const findAllUserNotes: Note[] = await this.noteService.getAllUserNotes(req.user.id);
            res.status(200).json({ data: findAllUserNotes, message: 'findAll'})
        } catch (error) {
            next(error);
        }
    }

    public createNote = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const noteData: CreateOrUpdateNoteDto = req.body;
            const createdNote: Note = await this.noteService.createNote(req.user.id, noteData);
            res.status(201).json({ data: createdNote, message: 'create'});
        } catch (error) {
        next(error);
        }
    }

    public getUserNote = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const note: Note = await this.noteService.getUserNote(req.user.id, Number(req.params.id));
            res.status(200).json({ data: note , message: 'get'});
        } catch (error) {
            next(error);
        }
    }

    public updateUserNote = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data: CreateOrUpdateNoteDto = req.body;
            const updatedNote: Note = await this.noteService.updateUserNote(req.user.id, Number(req.params.id), data);
            res.status(200).json({ data: updatedNote, message: 'update'});
        } catch (error) {
            next(error);
        }
    }

    public deleteNote = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.noteService.deleteNote(req.user.id, Number(req.params.id));
            res.status(200).json({ data: 'Note was deleted successfully', message: 'delete' });
        } catch (error) {
            next(error);
        }
    }

    public shareNote = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data: ShareNoteWithUserDto =  req.body;
            await this.noteService.shareNote(req.user.id, Number(req.params.id), data);
            res.status(200).json({ data: `Note was shared with user with id: ${data.userId}`, message: 'share'})
        } catch (error) {
            next(error);
        }
    }

    public searchNotes = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            var notes: Note[] = await this.noteService.searchNotes(req.user.id, req.query.q);
            res.status(200).json({ data: notes, message: 'search'})
        } catch (error) {
            next(error);
        }
    }
}