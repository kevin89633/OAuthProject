const router = require("express").Router();
const passport = require("passport");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const saltround = 12;

router.get("/login", (req, res) => {
  return res.render("login", { user: req.user });
});

//Logout route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.send(err);
    return res.redirect("/");
  });
});

//Regist Page route
router.get("/signup", (req, res) => {
  return res.render("signup", { user: req.user });
});

//Regist route
router.post("/signup", async (req, res) => {
  let { name, email, password } = req.body;
  if (password.length < 8) {
    req.flash("error_msg", "密碼長度太短");
    return res.redirect("/auth/signup");
  }
  //Check email had been registed or not
  const foundEmail = await User.findOne({ email: email }).exec();
  if (foundEmail) {
    req.flash("error_msg", "信箱已經被註冊過");
    return res.redirect("/auth/signup");
  }
  let hashedPassword = await bcrypt.hash(password, saltround);
  let newUser = new User({
    name: name,
    email: email,
    password: hashedPassword,
  });
  await newUser.save();
  req.flash("success_msg", "註冊成功! 請登入系統");
  return res.redirect("/auth/login");
});

//Local user regist, using passport-local
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login",
    failureFlash: "帳號或密碼不正確", //failureFlash這個值會被套在index.js裡面的res.locals.error = req.flash("error")中;
  }),
  (req, res) => {
    return res.redirect("/profile");
  }
);

//Google Auth用
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

//OAuth完成之後要把使用者轉導向的網址, 要與google console設定一致
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  console.log("redirect...");
  return res.redirect("/profile");
});

module.exports = router;
