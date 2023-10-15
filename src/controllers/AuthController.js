class AuthController {
  loginView = (req, res) => {

    if(req.session.user) {
      res.redirect("/create");
    }

    const error = req.query.error;

    res.render("login", {
      error: error,
      routes: {
        create: process.env.APP_URL + "/create",
        list: process.env.APP_URL + "/list",
        feed: process.env.APP_URL + "/feed",
        login: process.env.APP_URL + "/login",
      },
    });
  };

  login = async (req, res) => {
    // get username and password from request body
    const { username, password } = req.body;

    // PLACEHOLDER: add logic to check username and password against database
    if (username === "user" && password === "password") {
      req.session.user = username;
      res.redirect("/create");
    } else {
      res.redirect("/login?error=true");
    }
  };
}

export default AuthController;
