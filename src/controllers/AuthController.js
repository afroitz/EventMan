class AuthController {
  loginView = (req, res) => {

    if(req.session.user) {
      return res.redirect("/create");
    }

    const error = req.query.error;

    res.render("login", {
      error: error,
      routes: {
        create: "/create",
        list: "/list",
        feed: "/feed",
        login: "/login",
        getFromGioele: "/get-events-from-gioele",
      },
    });
  };

  login = async (req, res) => {
    // get username and password from request body
    const { username, password } = req.body;

    // PLACEHOLDER: add logic to check username and password against database
    if (username === process.env.TEST_USER && password === process.env.TEST_PASSWORD) {
      req.session.user = username;
      res.redirect("/create");
    } else {
      res.redirect("/login?error=true");
    }
  };
}

export default AuthController;
