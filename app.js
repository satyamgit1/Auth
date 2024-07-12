const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const favicon = require("serve-favicon"); 
const userModel = require("./models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var path = require('path');

// Set up middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); 

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files including favicon
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico'))); 

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/create", async (req, res) => {
  try {
    console.log(req.body); 
    let { username, email, password, age } = req.body;

    if (!password) {
      return res.status(400).send({ error: "Password is required" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    let createdUser = await userModel.create({
      username,
      email,
      password: hash,
      age,
    });

    let token = jwt.sign({ email }, "shhhhhhh");
    res.cookie("token", token);
    res.send(createdUser);
  } catch (error) {
    console.error(error); 
    res.status(500).send({ error: "Failed to create user" });
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  try {
    // console.log(req.body); // Log the request body for debugging
    let user = await userModel.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("User not found");

    // Log the user's password for debugging
    console.log("User's hashed password from DB:", user.password);
    console.log("Password from request body:", req.body.password);

    bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error comparing passwords");
      }

      if (isMatch) {
        let token = jwt.sign({ email: user.email }, "shhhhhhh");
        res.cookie("token", token);
        return res.send("Logged in");
      } else {
        return res.status(400).send("Incorrect password");
      }
    });
  } catch (error) {
    console.error(error); 
    res.status(500).send({ error: "Failed to log in" });
  }
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
