import { PrismaClient} from "@prisma/client";
import { HttpException } from "@/exceptions/httpException";
import { Service } from 'typedi';
import { Note } from "@/interfaces/notes.interface";
import { Share } from "@/interfaces/share.interface";
import { CreateOrUpdateNoteDto, ShareNoteWithUserDto } from "@/dtos/notes.dto";

@Service()
export class NoteService {
    public client: PrismaClient;
    public notes;
    public shares;
    public users;
    

    constructor(prisma: PrismaClient)
    {
        this.client = prisma;
        this.notes = this.client.note;
        this.shares = this.client.share;
        this.users = this.client.user;
    }

    public async getAllUserNotes(userId: number): Promise<Note[]> {
        const allUserNotes: Note[] = await this.notes.findMany({ where: {
            authorId: userId
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        // add notes shared to user
        const sharedUserNotes = await this.shares.findMany({where: {
            userId
        }, include: {note: true}});

        sharedUserNotes.forEach(sharedNote => {
            allUserNotes.push(sharedNote.note);
        });

        return allUserNotes;
    }

    public async createNote(userId: number, data: CreateOrUpdateNoteDto): Promise<Note> {
        const note: Note = await this.notes.create({
            data: {
                body: data.body,
                authorId: userId
            }
        });

        return note;
    }

    public async getUserNote(userId: number, noteId: number): Promise<Note> {
        const note: Note = await this.notes.findUnique({ where: { id: noteId }});

        if (!note) throw new HttpException(404, "Note not found");

        const sharedNote: Share = await this.shares.findFirst({ where: { userId, noteId }})

        // check if user is the note creator or note was shared to this user
        if(note.authorId != userId && !sharedNote)
        {
            throw new HttpException(401, "You do not have access to this note");
        }

        return note;
    }

    public async updateUserNote(userId: number, noteId: number, data: CreateOrUpdateNoteDto): Promise<Note> {
        const note: Note = await this.notes.findUnique({ where: { id: noteId }});

        if(!note) throw new HttpException(404, "Note not found");

        if(note.authorId != userId) throw new HttpException(401, "You do not have access to this note");

        const updatedNote: Note = await this.notes.update({
            data: {
                body: data.body
            },
            where: {
                id: noteId,
            }
        });

        return updatedNote;
    }

    public async deleteNote(userId: number, noteId: number): Promise<void> {
        const note: Note = await this.notes.findUnique({ where: { id: noteId }});

        if(!note) throw new HttpException(404, "Note not found");

        if(note.authorId != userId) throw new HttpException(401, "You do not have access to this note");

        await this.notes.delete({
            where: {
                id: noteId
            }
        });
    }

    public async shareNote(userId: number, noteId: number, data: ShareNoteWithUserDto): Promise<void>
    {
        const note: Note = await this.notes.findUnique({ where: { id: noteId }});

        if(!note) throw new HttpException(404, "Note not found");

        if(note.authorId != userId) throw new HttpException(401, "You do not have access to this note");

        var userToShare = await this.users.findUnique({where: {id: data.userId}});

        if(!userToShare) throw new HttpException(404, `User with id: ${data.userId} does not exist`);

        await this.shares.create({
            data: {
                userId: data.userId,
                noteId
            }
        });
    }

    public async searchNotes (userId: number, queryString: any): Promise<Note[]>
    {
        const results = await this.notes.findMany({
            where: {
                authorId: userId,
                body: {
                    search: queryString
                },
            }
        });

        // search shared notes with the query string
        const sharedNotes = await this.shares.findMany({
            where: {
                userId,
                note: {
                    body: {
                        search: queryString
                    }
                }
            },
            include: {
                note: true
            }
        });

        // add searched notes to the result;
        sharedNotes.forEach(sharedNote => {
            results.push(sharedNote.note);
        });

        return results;
    }
}