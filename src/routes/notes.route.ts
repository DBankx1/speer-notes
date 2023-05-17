import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { NoteController } from '@/controllers/notes.controller';
import { ValidationMiddleware } from '@/middlewares/validation.middleware';
import { CreateOrUpdateNoteDto, ShareNoteWithUserDto } from '@/dtos/notes.dto';
import { PrismaClient } from '@prisma/client';

export class NoteRoute implements Routes {
  public path = '/notes';
  public router = Router();
  public prismaClient = new PrismaClient();
  public authPrismaClient = new PrismaClient();
  public noteController = new NoteController(this.prismaClient);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, AuthMiddleware(this.authPrismaClient), this.noteController.getUserNotes);
    this.router.post(this.path, [AuthMiddleware(this.authPrismaClient), ValidationMiddleware(CreateOrUpdateNoteDto)], this.noteController.createNote);
    this.router.get(`${this.path}/:id(\\d+)`, AuthMiddleware(this.authPrismaClient), this.noteController.getUserNote);
    this.router.put(`${this.path}/:id(\\d+)`, [AuthMiddleware(this.authPrismaClient), ValidationMiddleware(CreateOrUpdateNoteDto)], this.noteController.updateUserNote);
    this.router.delete(`${this.path}/:id(\\d+)`, AuthMiddleware(this.authPrismaClient), this.noteController.deleteNote);
    this.router.post(`${this.path}/:id(\\d+)/share`, [AuthMiddleware(this.authPrismaClient), ValidationMiddleware(ShareNoteWithUserDto)], this.noteController.shareNote);
    this.router.get(`${this.path}/search`, AuthMiddleware(this.authPrismaClient), this.noteController.searchNotes);
  }
}
