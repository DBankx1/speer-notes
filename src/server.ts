import { App } from '@/app';
import { AuthRoute } from '@routes/auth.route';
import { ValidateEnv } from '@utils/validateEnv';
import { NoteRoute } from './routes/notes.route';

ValidateEnv();

const app = new App([new AuthRoute(), new NoteRoute()]);

app.listen();
