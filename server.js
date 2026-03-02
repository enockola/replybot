import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ define NODE_ENV safely
const NODE_ENV = (process.env.NODE_ENV || 'production').toLowerCase();

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use((req, res, next) => {
  res.locals.NODE_ENV = NODE_ENV;
  next();
});

app.get('/', (req, res) => {
  res.render('home', { title: 'Replybot Homepage' });
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard', { title: 'ReplyBot Canned Response' });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

app.get('/resources', (req, res) => {
  res.render('resources', { title: 'Resources' });
});

// ✅ now NODE_ENV exists
if (NODE_ENV.includes('dev')) {
  const ws = await import('ws');

  try {
    const wsPort = PORT + 1;
    const wsServer = new ws.WebSocketServer({ port: wsPort });

    wsServer.on('listening', () => {
      console.log(`WebSocket server is running on port ${wsPort}`);
    });

    wsServer.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });
  } catch (error) {
    console.error('Failed to start WebSocket server:', error);
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});