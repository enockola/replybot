// Imports
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

// Declare Variables
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express Server Setup
const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Declare Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/home.html'));
});
app.get('/replybot', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/replybot.html'));
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});