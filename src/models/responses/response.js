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


const getAllResponses = () => {
  return cannedResponses;
};

const getResponseCategoryBySlug = (slug) => {
  return cannedResponses.find((category) => category.slug === slug) || null;
};

const getResponseCategoryByName = (name) => {
  return (
    cannedResponses.find(
      (category) => category.name.toLowerCase() === name.toLowerCase()
    ) || null
  );
};

const getAllResponseSlugs = () => {
  return cannedResponses.map((category) => category.slug);
};

export {
  getAllResponses,
  getResponseCategoryBySlug,
  getResponseCategoryByName,
  getAllResponseSlugs,
};