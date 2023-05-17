import request from 'supertest';
import { App } from '@/app';
import { NoteRoute } from '@/routes/notes.route';
import { CreateOrUpdateNoteDto, ShareNoteWithUserDto } from '@/dtos/notes.dto';
import { User } from '@/interfaces/users.interface';
import bcrypt from 'bcrypt';
import { AuthService } from '@/services/auth.service';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

afterAll(async () => {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
  });

describe('Testing Notes', () => {
    describe('[GET] /', () => {

        it('should fail if no auth token', async () => {
            const noteRoute = new NoteRoute();

            const app = new App([noteRoute]);

            return request(app.getServer())
                .get(`/api${noteRoute.path}`)
                .expect(401);
        });


        it('should return all notes user has created and shared with', async () => {

            const user: User = {
                id: 1,
                email: "test@email.com",
                password: await bcrypt.hash("test12345", 10),
            }

            const authService = new AuthService();

            const tokenData = authService.createToken(user);

            const noteRoute = new NoteRoute();
            const prismaClient = noteRoute.noteController.noteService.client;

            noteRoute.authPrismaClient.user.findUnique = jest.fn().mockResolvedValue(user);

            prismaClient.note.findMany = jest.fn().mockResolvedValue([{
                id: 1,
                body: "here as one",
                authorId: user.id,
                createdAt: Date.now,
                updatedAt: Date.now
            }]);

            prismaClient.share.findMany = jest.fn().mockResolvedValue([
                {
                  id: 1,
                  noteId: 2,
                  userId: user.id,
                  sharedAt: Date.now,
                  note: {
                    id: 2,
                    authorId: 3,
                    body: 'this is a very good note with keywords like minute',
                    createdAt: Date.now,
                    updatedAt: Date.now
                  }
                },
                {
                  id: 2,
                  noteId: 3,
                  userId: user.id,
                  sharedAt: Date.now,
                  note: {
                    id: 3,
                    authorId: 3,
                    body: 'this is another word with a keyword by dami and would be shared with others',
                    createdAt: Date.now,
                    updatedAt: Date.now
                  }
                }
              ]);

            const app = new App([noteRoute]);

            const test = await request(app.getServer())
                .get(`/api${noteRoute.path}`)
                .set('Authorization', `Bearer ${tokenData.token}`)
                .expect(200);

             expect(test.body.data.length).toBe(3);   
        });


        it('Should search for all posts containing keywords', async () => {
            const user: User = {
                id: 1,
                email: "test@email.com",
                password: await bcrypt.hash("test12345", 10),
            }

            const authService = new AuthService();

            const tokenData = authService.createToken(user);

            const noteRoute = new NoteRoute();
            const prismaClient = noteRoute.noteController.noteService.client;

            noteRoute.authPrismaClient.user.findUnique = jest.fn().mockResolvedValue(user);

            prismaClient.note.findMany = jest.fn().mockResolvedValue([{
                id: 1,
                body: "wimbeldon as one",
                authorId: user.id,
                createdAt: Date.now,
                updatedAt: Date.now
            }]);

            prismaClient.share.findMany = jest.fn().mockResolvedValue([
                {
                  id: 1,
                  noteId: 2,
                  userId: user.id,
                  sharedAt: Date.now,
                  note: {
                    id: 2,
                    authorId: 3,
                    body: 'this is a wimbeldon very good note with keywords like minute',
                    createdAt: Date.now,
                    updatedAt: Date.now
                  }
                }
              ]);

            const app = new App([noteRoute]);

            const test = await request(app.getServer())
                .get(`/api${noteRoute.path}/search?q=wimbeldon`)
                .set('Authorization', `Bearer ${tokenData.token}`)
                .expect(200);

             expect(test.body.data.length).toBe(2);  

        });
    });


    describe('[POST] /', () => {
        it('should create a post with user', async () => {
            const user: User = {
                id: 1,
                email: "test@email.com",
                password: await bcrypt.hash("test12345", 10),
            }

            const authService = new AuthService();

            const tokenData = authService.createToken(user);

            const noteData: CreateOrUpdateNoteDto = {
                body: "This is one for the books"
            };

            const noteRoute = new NoteRoute();

            const prismaClient = noteRoute.noteController.noteService.client;

            noteRoute.authPrismaClient.user.findUnique = jest.fn().mockResolvedValue(user);

            prismaClient.note.create = jest.fn().mockResolvedValue({
                id: 1,
                body: noteData.body,
                authorId: user.id,
                createdAt: Date.now,
                updatedAt: Date.now
            });

            const app = new App([noteRoute]);

            const test = await request(app.getServer())
                .post(`/api${noteRoute.path}`)
                .send(noteData)
                .set('Authorization', `Bearer ${tokenData.token}`)
                .expect(201);

             expect(test.body.data.authorId).toBe(user.id);
             expect(test.body.data.body).toBe(noteData.body);  
        });

        it("Should be able to share note with another user", async () => {
            const user: User = {
                id: 1,
                email: "test@email.com",
                password: await bcrypt.hash("test12345", 10),
            }

            const userToShare: User = {
                id: 2,
                email: "test2@email.com",
                password: await bcrypt.hash("test12345", 10)
            }

            const authService = new AuthService();

            const tokenData = authService.createToken(user);

            const shareData: ShareNoteWithUserDto = {
                userId: userToShare.id
            };

            const noteRoute = new NoteRoute();

            const prismaClient = noteRoute.noteController.noteService.client;

            noteRoute.authPrismaClient.user.findUnique = jest.fn().mockResolvedValue(user);

            prismaClient.note.findUnique = jest.fn().mockResolvedValue({
                id: 1,
                body: "this is a note",
                authorId: user.id,
                createdAt: Date.now,
                updatedAt: Date.now
            });

            prismaClient.user.findUnique = jest.fn().mockResolvedValue(userToShare);

            prismaClient.share.create = jest.fn().mockResolvedValue({
                id: 1,
                userId: shareData.userId,
                noteId: 1
            });

            const app = new App([noteRoute]);

            const test = await request(app.getServer())
                .post(`/api${noteRoute.path}/1/share`)
                .send(shareData)
                .set('Authorization', `Bearer ${tokenData.token}`)
                .expect(200);

            expect(prismaClient.share.create).toBeCalled();    
        });

        it("Should not be able to share note with another user if user not found", async () => {
            const user: User = {
                id: 1,
                email: "test@email.com",
                password: await bcrypt.hash("test12345", 10),
            }

            const userToShare: User = {
                id: 2,
                email: "test2@email.com",
                password: await bcrypt.hash("test12345", 10)
            }

            const authService = new AuthService();

            const tokenData = authService.createToken(user);

            const shareData: ShareNoteWithUserDto = {
                userId: userToShare.id
            };

            const noteRoute = new NoteRoute();

            const prismaClient = noteRoute.noteController.noteService.client;

            noteRoute.authPrismaClient.user.findUnique = jest.fn().mockResolvedValue(user);

            prismaClient.note.findUnique = jest.fn().mockResolvedValue({
                id: 1,
                body: "this is a note",
                authorId: user.id,
                createdAt: Date.now,
                updatedAt: Date.now
            });

            prismaClient.user.findUnique = jest.fn().mockResolvedValue(undefined);

            prismaClient.share.create = jest.fn().mockResolvedValue({
                id: 1,
                userId: shareData.userId,
                noteId: 1
            });

            const app = new App([noteRoute]);

            const test = await request(app.getServer())
                .post(`/api${noteRoute.path}/1/share`)
                .send(shareData)
                .set('Authorization', `Bearer ${tokenData.token}`)
                .expect(404);

            expect(prismaClient.share.create).not.toBeCalled();    
        });

        it("Should not be able to share note with another user if user not is not owner of note", async () => {
            const user: User = {
                id: 1,
                email: "test@email.com",
                password: await bcrypt.hash("test12345", 10),
            }

            const userToShare: User = {
                id: 2,
                email: "test2@email.com",
                password: await bcrypt.hash("test12345", 10)
            }

            const authService = new AuthService();

            const tokenData = authService.createToken(user);

            const shareData: ShareNoteWithUserDto = {
                userId: userToShare.id
            };

            const noteRoute = new NoteRoute();

            const prismaClient = noteRoute.noteController.noteService.client;

            noteRoute.authPrismaClient.user.findUnique = jest.fn().mockResolvedValue(user);

            prismaClient.note.findUnique = jest.fn().mockResolvedValue({
                id: 1,
                body: "this is a note",
                authorId: 3,
                createdAt: Date.now,
                updatedAt: Date.now
            });

            prismaClient.user.findUnique = jest.fn().mockResolvedValue(undefined);

            prismaClient.share.create = jest.fn().mockResolvedValue({
                id: 1,
                userId: shareData.userId,
                noteId: 1
            });

            const app = new App([noteRoute]);

            const test = await request(app.getServer())
                .post(`/api${noteRoute.path}/1/share`)
                .send(shareData)
                .set('Authorization', `Bearer ${tokenData.token}`)
                .expect(401);

            expect(prismaClient.share.create).not.toBeCalled();    
        });
    });

    describe('[DELETE] /', () => {
        it('should delete note if user owns it', async () => {
            const user: User = {
                id: 1,
                email: "test@email.com",
                password: await bcrypt.hash("test12345", 10),
            }

            const authService = new AuthService();

            const tokenData = authService.createToken(user);

            const noteRoute = new NoteRoute();

            const prismaClient = noteRoute.noteController.noteService.client;

            noteRoute.authPrismaClient.user.findUnique = jest.fn().mockResolvedValue(user);

            prismaClient.note.findUnique = jest.fn().mockResolvedValue({
                id: 1,
                body: "this is a note",
                authorId: 1,
                createdAt: Date.now,
                updatedAt: Date.now
            });

            prismaClient.note.delete = jest.fn().mockResolvedValue({id: 1,
                body: "this is a note",
                authorId: 1,
                createdAt: Date.now,
                updatedAt: Date.now
            });

            const app = new App([noteRoute]);

            const test = await request(app.getServer())
                .delete(`/api${noteRoute.path}/1`)
                .set('Authorization', `Bearer ${tokenData.token}`)
                .expect(200);

            expect(prismaClient.note.delete).toBeCalled();  
        });

        it('should not delete note if user doesnt owns it', async () => {
            const user: User = {
                id: 1,
                email: "test@email.com",
                password: await bcrypt.hash("test12345", 10),
            }

            const authService = new AuthService();

            const tokenData = authService.createToken(user);

            const noteRoute = new NoteRoute();

            const prismaClient = noteRoute.noteController.noteService.client;

            prismaClient.note.findUnique = jest.fn().mockResolvedValue({
                id: 1,
                body: "this is a note",
                authorId: 3,
                createdAt: Date.now,
                updatedAt: Date.now
            });

            prismaClient.note.delete = jest.fn().mockResolvedValue({id: 1,
                body: "this is a note",
                authorId: 3,
                createdAt: Date.now,
                updatedAt: Date.now
            });

            const app = new App([noteRoute]);

            const test = await request(app.getServer())
                .delete(`/api${noteRoute.path}/1`)
                .set('Authorization', `Bearer ${tokenData.token}`)
                .expect(401);

            expect(prismaClient.note.delete).not.toBeCalled();  
        });
    });

    describe('[PUT] /', () => {
        it('should update users note', async () => {
            const user: User = {
                id: 1,
                email: "test@email.com",
                password: await bcrypt.hash("test12345", 10),
            }

            const authService = new AuthService();

            const tokenData = authService.createToken(user);

            const noteData: CreateOrUpdateNoteDto = {
                body: 'This is an updated note'
            };

            const noteRoute = new NoteRoute();

            const prismaClient = noteRoute.noteController.noteService.client;

            noteRoute.authPrismaClient.user.findUnique = jest.fn().mockResolvedValue(user);

            prismaClient.note.findUnique = jest.fn().mockResolvedValue({
                id: 1,
                body: "this is a note",
                authorId: 1,
                createdAt: Date.now,
                updatedAt: Date.now
            });

            prismaClient.note.update = jest.fn().mockResolvedValue({id: 1,
                body: noteData.body,
                authorId: 1,
                createdAt: Date.now,
                updatedAt: Date.now
            });

            const app = new App([noteRoute]);

            const test = await request(app.getServer())
                .put(`/api${noteRoute.path}/1`)
                .send(noteData)
                .set('Authorization', `Bearer ${tokenData.token}`)
                .expect(200);

            expect(prismaClient.note.update).toBeCalled();  
            expect(test.body.data.body).toBe(noteData.body);
        });

        it('should not update users note if not users own', async () => {
            const user: User = {
                id: 1,
                email: "test@email.com",
                password: await bcrypt.hash("test12345", 10),
            }

            const authService = new AuthService();

            const tokenData = authService.createToken(user);

            const noteData: CreateOrUpdateNoteDto = {
                body: 'This is an updated note'
            };

            const noteRoute = new NoteRoute();

            const prismaClient = noteRoute.noteController.noteService.client;

            noteRoute.authPrismaClient.user.findUnique = jest.fn().mockResolvedValue(user);

            prismaClient.note.findUnique = jest.fn().mockResolvedValue({
                id: 1,
                body: "this is a note",
                authorId: 3,
                createdAt: Date.now,
                updatedAt: Date.now
            });

            prismaClient.note.update = jest.fn().mockResolvedValue({id: 1,
                body: noteData.body,
                authorId: 1,
                createdAt: Date.now,
                updatedAt: Date.now
            });

            const app = new App([noteRoute]);

            const test = await request(app.getServer())
                .put(`/api${noteRoute.path}/1`)
                .send(noteData)
                .set('Authorization', `Bearer ${tokenData.token}`)
                .expect(401);

            expect(prismaClient.note.update).not.toBeCalled();
        });
    });
});  