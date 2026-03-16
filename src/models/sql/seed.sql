BEGIN;

INSERT INTO roles (name) VALUES
('admin'),
('vendor'),
('user')
ON CONFLICT (name) DO NOTHING;

INSERT INTO response_categories (name, slug, description) VALUES
('Intro', 'intro', 'Opening responses used to begin a conversation professionally.'),
('Outro', 'outro', 'Closing responses used to end a conversation professionally.'),
('Inactive', 'inactive', 'Follow-up responses for inactive conversations.'),
('Survey', 'survey', 'Responses encouraging customer feedback.'),
('Sympathy', 'sympathy', 'Empathetic responses for difficult situations.'),
('Email', 'email', 'Longer-form email response templates.')
ON CONFLICT (slug) DO NOTHING;

COMMIT;