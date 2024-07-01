const router = require("express").Router();
const Post = require("../models/post-model");

const authCheck = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.redirect("/auth/login");
  }
};

router.get("/", authCheck, async (req, res) => {
  //console.log("profile...");
  let postFound = await Post.find({ author: req.user._id });
  return res.render("profile", { user: req.user, posts: postFound }); //deSerializeUser()裡面的done的第二參數已經將req.user定義為我們用findOne找到的User
});

router.get("/post", authCheck, (req, res) => {
  return res.render("post", { user: req.user });
});

router.post("/post", authCheck, async (req, res) => {
  try {
    let { title, content } = req.body;
    let newPost = new Post({
      title: title,
      content: content,
      author: req.user._id,
    });
    await newPost.save();
    return res.redirect("/profile");
  } catch (e) {
    req.flash("error_msg", "請確認標題與內容是否有填寫");
    return res.redirect("/profile/post");
  }
});

module.exports = router;
