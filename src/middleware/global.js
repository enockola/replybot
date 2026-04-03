/**
 * Helper function to get the current greeting based on the time of day.
 */
const getCurrentGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
        return 'Good Morning!';
    }

    if (currentHour < 18) {
        return 'Good Afternoon!';
    }

    return 'Good Evening!';
};

/**
 * Middleware to add local variables to res.locals for use in all templates.
 * Templates can access these values but are not required to use them.
 */
const addLocalVariables = (req, res, next) => {
    res.locals.currentYear = new Date().getFullYear();
    res.locals.NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
    res.locals.queryParams = { ...req.query };
    res.locals.greeting = `<p>${getCurrentGreeting()}</p>`;

    const themes = ['blue-theme', 'green-theme', 'red-theme'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    res.locals.bodyClass = randomTheme;

    res.locals.isLoggedIn = !!req.session?.user;
    res.locals.user = req.session?.user || null;

    console.log('addLocalVariables ran:', res.locals.isLoggedIn);
    next();
};

export { addLocalVariables };