import express from "express";
import { fileURLToPath } from "url";
import path from "path";

const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cannedResponses = [
  {
    name: "Intro",
    slug: "intro",
    description:
      "Opening responses used to greet the customer and begin the conversation in a warm, professional way.",
    responses: [
      {
        text: "Thank you for contacting BYU-Idaho! My name is Enoch. How can I assist you today?",
      },
      {
        text: "Hello! Welcome to BYU-Idaho support. This is Enoch. What can I help you with today?",
      },
      {
        text: "Hi there! Thank you for reaching out to BYU-Idaho support. My name is Enoch, and I’d be happy to assist you.",
      },
      {
        text: "Good day, and thank you for contacting support. My name is Enoch. How may I help you today?",
      },
      {
        text: "Welcome to BYU-Idaho support! I’m Enoch, and I’m here to help with any questions or concerns you may have.",
      },
    ],
  },
  {
    name: "Outro",
    slug: "outro",
    description:
      "Closing responses used to end the conversation politely and professionally.",
    responses: [
      {
        text: "Thank you for reaching out! If you have any more questions, feel free to contact us again. Have a great day!",
      },
      {
        text: "It was a pleasure assisting you. Please let us know if there’s anything else we can help with.",
      },
      {
        text: "I’m glad I could assist you today. If anything else comes up, don’t hesitate to reach out.",
      },
      {
        text: "Thank you for contacting BYU-Idaho support. We appreciate your time, and we wish you a wonderful day.",
      },
    ],
  },
  {
    name: "Inactive",
    slug: "inactive",
    description:
      "Follow-up responses used when the customer has stopped replying or the conversation has gone quiet.",
    responses: [
      {
        text: "It seems our conversation has been inactive for a while. If you still need assistance, please let us know.",
      },
      {
        text: "We haven’t heard from you in a bit. If you have any further questions, don’t hesitate to ask.",
      },
      {
        text: "Just checking in to see if you still need help. We’re here if you’d like to continue.",
      },
      {
        text: "Since we haven’t received a response, we’ll go ahead and pause here for now. Feel free to reach out again anytime.",
      },
    ],
  },
  {
    name: "Survey",
    slug: "survey",
    description:
      "Responses encouraging customers to provide feedback about their support experience.",
    responses: [
      {
        text: "We value your feedback! Please take a moment to complete a brief survey about your experience.",
      },
      {
        text: "Your opinion matters to us. Would you be willing to complete a short survey about your experience?",
      },
      {
        text: "We’d love to hear your thoughts. Your feedback helps us improve the support experience for everyone.",
      },
      {
        text: "If you have a moment, please complete our short survey and let us know how we did today.",
      },
    ],
  },
  {
    name: "Sympathy",
    slug: "sympathy",
    description:
      "Empathetic responses used to acknowledge frustration, inconvenience, or difficult situations.",
    responses: [
      {
        text: "I’m sorry to hear about the difficulties you’re facing. We’re here to support you through it.",
      },
      {
        text: "We understand this might be a challenging time for you. Please let us know how we can help.",
      },
      {
        text: "I’m sorry for the frustration this situation has caused. Let’s work through it together.",
      },
      {
        text: "I understand how upsetting this can be, and I appreciate your patience while we help resolve it.",
      },
      {
        text: "I’m sorry you’ve had this experience. I’ll do my best to help you find a solution.",
      },
    ],
  },
  {
    name: "Email",
    slug: "email",
    description:
      "Longer, more formal message templates designed for email communication.",
    responses: [
      {
        text: "Dear [Name],\n\nThank you for reaching out. We appreciate your inquiry and will get back to you shortly.\n\nBest regards,\nEnoch",
      },
      {
        text: "Hello [Name],\n\nWe’re following up on your request and wanted to share more information. Let us know if we can assist further.\n\nSincerely,\nEnoch",
      },
      {
        text: "Dear [Name],\n\nThank you for contacting BYU-Idaho support. We have received your message and are currently reviewing your request. We will follow up with you as soon as possible.\n\nBest regards,\nEnoch",
      },
      {
        text: "Hello [Name],\n\nI wanted to follow up regarding your recent inquiry. Please let us know if you need any clarification or additional assistance.\n\nKind regards,\nEnoch",
      },
    ],
  },
];

const app = express();

const NODE_ENV = (process.env.NODE_ENV || "production").toLowerCase();

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

app.use((req, res, next) => {
  res.locals.NODE_ENV = NODE_ENV;
  next();
});

app.get("/", (req, res) => {
  res.render("home", { title: "Replybot Homepage" });
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard", { title: "ReplyBot Canned Response" });
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

app.get("/resources", (req, res) => {
  res.render("resources", { title: "Resources" });
});

// Course response list and details page
app.get("/responses", (req, res) => {
  console.log("Responses route hit");
  console.log("Canned responses:", cannedResponses);

  res.render("responses", {
    title: "Canned Responses",
    cannedResponses,
  });
});

app.get('/responses/:slug', (req, res, next) => {
  const slug = req.params.slug;

  const responseCategory = cannedResponses.find(
    category => category.slug === slug
  );

  if (!responseCategory) {
    const err = new Error(`Response category "${slug}" not found`);
    err.status = 404;
    return next(err);
  }

  res.render('response-details', {
    title: responseCategory.name,
    category: responseCategory,
    cannedResponses
  });
});

app.get("/test-error", (req, res, next) => {
  const err = new Error("This is a test error");
  err.status = 500;
  next(err);
});

app.use((req, res, next) => {
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

app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
