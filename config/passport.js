const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user-model");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

passport.serializeUser((user, done) => {
  console.log("Serialize User....");
  //看一下user被帶入的值
  //console.log(user);

  done(null, user._id);
});

//deserializeUser在執行時, 第一個參數id會自動拿到serializeUser內done的第二個參數
passport.deserializeUser(async (id, done) => {
  console.log(
    "Deserialize User...使用Serialize User儲存的id去找到資料庫內的資料"
  );
  let foundUser = await User.findOne({ _id: id });
  console.log(foundUser);
  done(null, foundUser); //deserializeUser的done執行時, 第二個參數將會被設定在req.user內部, 也就是將req.user這個屬性設定為foundUser
});

passport.use(
  new GoogleStrategy(
    {
      //client與Google間完成OAuth的步驟
      clientID: process.env.GOOGLE_CLIENT_ID, //到Google取得的client ID
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, //到Google取得的secret
      callbackURL: "/auth/google/redirect", //也可以打完整URL
    },

    async (accessToken, refreshToken, profile, done) => {
      //profile為從Google取得的用戶資料
      //console.log(profile);
      try {
        let foundUser = await User.findOne({ googleID: profile.id }).exec();
        if (foundUser) {
          console.log("使用者已被註冊");
          done(null, foundUser);
        } else {
          console.log("偵測到新用戶, 儲存進DB");
          let newUser = new User({
            name: profile.displayName,
            googleID: profile.id,
            thumbnail: profile.photos[0].value,
            email: profile.emails[0].value,
          });
          let savedUser = await newUser.save();
          console.log("成功創建新用戶");
          done(null, savedUser);
        }
      } catch (e) {
        console.log(e);
      }
    }
  )
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    console.log("local strategy...");
    let foundUser = await User.findOne({ email: username });
    if (foundUser) {
      let result = await bcrypt.compare(password, foundUser.password);
      if (result) {
        done(null, foundUser); //驗證成功的話done就會把第二個參數的foundUser丟給SerializeUser那邊去做序列化
      } else {
        done(null, false);
      }
    } else {
      done(null, false); //這個done的第二個參數被設定成false代表沒有驗證成功
    }
  })
);
