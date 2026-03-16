BEGIN;

DROP TABLE IF EXISTS ticket_status_history CASCADE;
DROP TABLE IF EXISTS ticket_messages CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS canned_responses CASCADE;
DROP TABLE IF EXISTS response_categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE response_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE canned_responses (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES response_categories(id) ON DELETE RESTRICT,
    content TEXT NOT NULL,
    created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_category_content UNIQUE (category_id, content)
);

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_vendor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'received',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ticket_messages (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ticket_status_history (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (name) VALUES
('admin'),
('vendor'),
('user');

INSERT INTO response_categories (name, slug, description, display_order) VALUES
('Intro', 'intro', 'Opening responses used to greet the customer and begin the conversation in a warm, professional way.', 1),
('Outro', 'outro', 'Closing responses used to end the conversation politely and professionally.', 2),
('Inactive', 'inactive', 'Follow-up responses used when the customer has stopped replying or the conversation has gone quiet.', 3),
('Survey', 'survey', 'Responses encouraging customers to provide feedback about their support experience.', 4),
('Sympathy', 'sympathy', 'Empathetic responses used to acknowledge frustration, inconvenience, or difficult situations.', 5),
('Email', 'email', 'Longer, more formal message templates designed for email communication.', 6);

-- Intro
INSERT INTO canned_responses (category_id, content)
SELECT rc.id, v.content
FROM response_categories rc
JOIN (
    VALUES
    ('Thank you for contacting BYU-Idaho! My name is Enoch. How can I assist you today?'),
    ('Hello! Welcome to BYU-Idaho support. This is Enoch. What can I help you with today?'),
    ('Hi there! Thank you for reaching out to BYU-Idaho support. My name is Enoch, and I’d be happy to assist you.'),
    ('Good day, and thank you for contacting support. My name is Enoch. How may I help you today?'),
    ('Welcome to BYU-Idaho support! I’m Enoch, and I’m here to help with any questions or concerns you may have.')
) AS v(content) ON TRUE
WHERE rc.slug = 'intro';

-- Outro
INSERT INTO canned_responses (category_id, content)
SELECT rc.id, v.content
FROM response_categories rc
JOIN (
    VALUES
    ('Thank you for reaching out! If you have any more questions, feel free to contact us again. Have a great day!'),
    ('It was a pleasure assisting you. Please let us know if there’s anything else we can help with.'),
    ('I’m glad I could assist you today. If anything else comes up, don’t hesitate to reach out.'),
    ('Thank you for contacting BYU-Idaho support. We appreciate your time, and we wish you a wonderful day.')
) AS v(content) ON TRUE
WHERE rc.slug = 'outro';

-- Inactive
INSERT INTO canned_responses (category_id, content)
SELECT rc.id, v.content
FROM response_categories rc
JOIN (
    VALUES
    ('It seems our conversation has been inactive for a while. If you still need assistance, please let us know.'),
    ('We haven’t heard from you in a bit. If you have any further questions, don’t hesitate to ask.'),
    ('Just checking in to see if you still need help. We’re here if you’d like to continue.'),
    ('Since we haven’t received a response, we’ll go ahead and pause here for now. Feel free to reach out again anytime.')
) AS v(content) ON TRUE
WHERE rc.slug = 'inactive';

-- Survey
INSERT INTO canned_responses (category_id, content)
SELECT rc.id, v.content
FROM response_categories rc
JOIN (
    VALUES
    ('We value your feedback! Please take a moment to complete a brief survey about your experience.'),
    ('Your opinion matters to us. Would you be willing to complete a short survey about your experience?'),
    ('We’d love to hear your thoughts. Your feedback helps us improve the support experience for everyone.'),
    ('If you have a moment, please complete our short survey and let us know how we did today.')
) AS v(content) ON TRUE
WHERE rc.slug = 'survey';

-- Sympathy
INSERT INTO canned_responses (category_id, content)
SELECT rc.id, v.content
FROM response_categories rc
JOIN (
    VALUES
    ('I’m sorry to hear about the difficulties you’re facing. We’re here to support you through it.'),
    ('We understand this might be a challenging time for you. Please let us know how we can help.'),
    ('I’m sorry for the frustration this situation has caused. Let’s work through it together.'),
    ('I understand how upsetting this can be, and I appreciate your patience while we help resolve it.'),
    ('I’m sorry you’ve had this experience. I’ll do my best to help you find a solution.')
) AS v(content) ON TRUE
WHERE rc.slug = 'sympathy';

-- Email
INSERT INTO canned_responses (category_id, content)
SELECT rc.id, v.content
FROM response_categories rc
JOIN (
    VALUES
    (E'Dear [Name],\n\nThank you for reaching out. We appreciate your inquiry and will get back to you shortly.\n\nBest regards,\nEnoch'),
    (E'Hello [Name],\n\nWe’re following up on your request and wanted to share more information. Let us know if we can assist further.\n\nSincerely,\nEnoch'),
    (E'Dear [Name],\n\nThank you for contacting BYU-Idaho support. We have received your message and are currently reviewing your request. We will follow up with you as soon as possible.\n\nBest regards,\nEnoch'),
    (E'Hello [Name],\n\nI wanted to follow up regarding your recent inquiry. Please let us know if you need any clarification or additional assistance.\n\nKind regards,\nEnoch')
) AS v(content) ON TRUE
WHERE rc.slug = 'email';

COMMIT;