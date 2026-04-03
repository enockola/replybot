import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import flash from 'connect-flash';
import { pool } from './src/models/db.js';
// import { startSessionCleanup } from './src/utils/session-cleanup.js';

import routes from './src/controllers/routes.js';
import { addLocalVariables } from "./src/middleware/global.js";
import { setupDatabase, testConnection } from './src/models/setup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();

// Initialize PostgreSQL session store
const pgSession = connectPgSimple(session);

// Configure session middleware
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: NODE_ENV.includes('dev') !== true,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(flash());

// Temporarily disable automatic session cleanup
// startSessionCleanup();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

app.use(addLocalVariables);
app.use('/', routes);

app.use((req, res, next) => {
    if (req.url.startsWith('/.well-known/')) {
        return res.status(404).end();
    }

    console.log(`404 hit for: ${req.method} ${req.url}`);

    const err = new Error("Page Not Found");
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    if (res.headersSent || res.finished) {
        return next(err);
    }

    const status = err.status || 500;
    const template = status === 404 ? "404" : "500";

    const context = {
        title: status === 404 ? "Page Not Found" : "Server Error",
        error: NODE_ENV === "production" ? "An error occurred" : err.message,
        stack: NODE_ENV === "production" ? null : err.stack,
        NODE_ENV,
    };

    try {
        res.status(status).render(`errors/${template}`, context);
    } catch (renderErr) {
        if (!res.headersSent) {
            res
                .status(status)
                .send(`<h1>Error ${status}</h1><p>An error occurred.</p>`);
        }
    }
});

if (NODE_ENV.includes("dev")) {
    const ws = await import("ws");

    try {
        const wsPort = PORT + 1;
        const wsServer = new ws.WebSocketServer({ port: wsPort });

        wsServer.on("listening", () => {
            console.log(`WebSocket server is running on port ${wsPort}`);
        });

        wsServer.on("error", (error) => {
            console.error("WebSocket server error:", error);
        });
    } catch (error) {
        console.error("Failed to start WebSocket server:", error);
    }
}

try {
    await testConnection();
    await setupDatabase();
} catch (error) {
    console.error('Server startup aborted:', error.message);
    process.exit(1);
}

app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});