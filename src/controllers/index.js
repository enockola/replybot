// Route handlers for static pages
const homePage = (req, res) => {
    res.render("home", { title: "Replybot Homepage" });
};

const aboutPage = (req, res) => {
    res.render("about", { title: "About" });
};

const dashboardPage = (req, res) => {
    res.render("dashboard", { title: "ReplyBot Canned Response" });
};

const resourcesPage = (req, res) => {
    res.render("resources", { title: "Resources" });
};

const testErrorPage = (req, res, next) => {
    const err = new Error('This is a test error');
    err.status = 500;
    next(err);
};

export { homePage, aboutPage, dashboardPage, resourcesPage, testErrorPage };