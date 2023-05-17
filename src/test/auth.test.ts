import bcrypt from 'bcrypt';
import request from 'supertest';
import {App} from '@/app';
import { CreateUserDto } from '@dtos/users.dto';
import { AuthRoute } from '@routes/auth.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing Auth', () => {
  describe('[POST] /signup', () => {
    it('response should have the Create userData', async () => {
      const userData: CreateUserDto = {
        email: 'test@email.com',
        password: 'test12345',
      };

      const authRoute = new AuthRoute();
      const users = authRoute.auth.auth.users;

      users.findUnique = jest.fn().mockReturnValue(null);
      users.create = jest.fn().mockReturnValue({
        id: 1,
        email: userData.email,
        password: await bcrypt.hash(userData.password, 10),
      });
      const app = new App([authRoute]);
      return request(app.getServer()).post(`/api${authRoute.path}/signup`).send(userData).expect(201);
    });

    it('should fail if password less than 9 characters', async () => {
      const userData: CreateUserDto = {
        email: 'test@email.com',
        password: '123',
      };

      const authRoute = new AuthRoute();
      const users = authRoute.auth.auth.users;

      users.findUnique = jest.fn().mockReturnValue(null);
      users.create = jest.fn().mockReturnValue({
        id: 1,
        email: userData.email,
        password: await bcrypt.hash(userData.password, 10),
      });
      const app = new App([authRoute]);
      return request(app.getServer()).post(`/api${authRoute.path}/signup`).send(userData).expect(400);
    });

    it('should fail if email already exsits', async () => {
      const userData: CreateUserDto = {
        email: 'test@email.com',
        password: '123',
      };

      const authRoute = new AuthRoute();
      const users = authRoute.auth.auth.users;

      users.findUnique = jest.fn().mockReturnValue({
        id: 1,
        email: userData.email,
        password: await bcrypt.hash(userData.password, 10),
      });

      const app = new App([authRoute]);

      return request(app.getServer()).post(`/api${authRoute.path}/signup`).send(userData).expect(400);
    });
  });


  describe('[POST] /login', () => {
    it('response should have the Set-Cookie header with the Authorization token', async () => {
      const userData: CreateUserDto = {
        email: 'test@email.com',
        password: 'test12345',
      };

      const authRoute = new AuthRoute();
      const users = authRoute.auth.auth.users;

      users.findUnique = jest.fn().mockReturnValue({
        id: 1,
        email: userData.email,
        password: await bcrypt.hash(userData.password, 10),
      });

      const app = new App([authRoute]);
      return request(app.getServer())
        .post(`/api${authRoute.path}/login`)
        .send(userData)
        .expect('Set-Cookie', /^Authorization=.+/);
    });
  });
});
