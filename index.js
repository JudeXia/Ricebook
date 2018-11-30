require('dotenv').config();
const   express             = require("express"),
        app                 = express(),
        bodyParser          = require("body-parser"),
        cookieParser        = require("cookie-parser"),
        mongoose            = require("mongoose"),
        User                = require("./models/user"),
        Profile             = require("./models/profile"),
        middleware          = require("./src/auth").middleware,
        seedDB              = require("./seed"),
        passport            = require('passport'), 
        session             = require('express-session'),
        GitHubStrategy      = require('passport-github').Strategy;

const   articlesRoutes          = require("./src/articles"),
        authRoutes              = require("./src/auth").authRoutes,
        followingRoutes         = require("./src/following"),
        profileRoutes           = require("./src/profile");

// seedDB();

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://ricebook-hw7.herokuapp.com/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // console.log(profile);
    const usernameGithub = profile.username + '@github';
    User.findOne({'thirdParty.party': 'github', 'thirdParty.username': usernameGithub}, function(err, user) {
      if (err) { return done(err); }
      // console.log(user)
      if (user) {
        return done(null, user);
      } else {
        User.create({username: usernameGithub, thirdParty: {party: 'github', username: usernameGithub}}, function(err, newUser) {
          if (err)  return done(err);
          const headline = 'Welcome github user!'
          const newProfile = {
            username: usernameGithub, 
            displayName: profile.displayName,
            headline: headline, 
            following:[],
            avatar: profile.photos[0].value
          };
          Profile.create(newProfile, function(err, newProfile) {
            if (err)  return done(err);
            return done(null, newUser);
          });
        })
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(session({secret: process.env.SESSION_SECRET}));
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true });
app.use(cookieParser());
app.use(middleware.enableCORS);
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({limit: '50mb', extended: true}));

articlesRoutes(app);
authRoutes(app);
followingRoutes(app);
profileRoutes(app);


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  const addr = server.address();
  console.log(`Server listening at http://${addr.address}:${addr.port}`);
});