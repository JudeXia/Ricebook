const User = require('../models/user');
const Profile = require('../models/profile');
const Article = require('../models/article');
const SessionUser = require('../models/sessionUser');
const passport = require('passport');
// const middleware = require("../middleware");
const bcrypt = require('bcryptjs');
// const redis = require('redis').createClient(process.env.REDIS_URL);
const saltRounds = Number(process.env.SALTROUNDS);
const cookieKey = 'sid';
var middleware = {};

// ******************** Middleware ***************************

middleware.isLoggedIn = function(req, res, next) {
  // console.log(req.isAuthenticated());
  if (req.isAuthenticated()) {
    // console.log(req.user);
    req.username = req.user.username;
    Profile.findOne({username: req.user.username}, (err, foundProfile) => {
      if (err) return console.log(err);
      req.userid = foundProfile._id;
      req.displayName = foundProfile.displayName;
      return next();
    })
  } else {
    const sessionKey = req.cookies[cookieKey];
    // console.log(sessionKey);
    SessionUser.findOne({sessionKey: sessionKey}, function(err, sessionUser) {
      if (err) return console.log(err);
      // console.log(req);
      if(sessionUser) {
        req.username = sessionUser.username;
        User.findOne({username: sessionUser.username}, (err, foundUser) => {
          if (err) return console.log(err);
          if(foundUser) {
            Profile.findOne({username: sessionUser.username}, (err, foundProfile) => {
              if (err) return console.log(err);
              req.userid = foundProfile._id;
              req.displayName = foundProfile.displayName;
              return next();
            })
          } else {
            res.status(403).send({result: "User Not found."});
          }
        })
      } else {
        res.status(401).send({result: "Unauthorized"});
      }
    })
  }
}

middleware.isNotLoggedIn = function(req, res, next) {
  const sessionKey = req.cookies[cookieKey];
  SessionUser.findOne({sessionKey: sessionKey}, function(err, sessionUser) {
    if(sessionUser == null) {
      // console.log('to next')
      return next();
    }
    res.status(403).send({result: "Already Logged In"});
    // stub: already logged in
  });
}

middleware.enableCORS = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin)
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Headers','Authorization, Content-Type')
  res.header('Access-Control-Expose-Headers', 'Location, X-Session-Id')
  next();
}

// ******************** Routes ***************************


// Login

function postLogin(req, res) {
  // const username = req.body.loginAccountName;
  // const password = req.body.loginPassword;
  // console.log('Request method        :', req.method)
  // console.log('Request URL           :', req.url)
  // console.log('Request content-type  :', req.headers['content-type'])
  // console.log('Request payload       :', req.body)

  const username = req.body.username;
  const password = req.body.password;
  // console.log(req.body);
  User.findOne({username: username}, function (err, foundUser) {
    if (err) return console.log(err);
    if(foundUser == null) {
      res.status(401).send({result: "Wrong User"}); // stub: Do something to prompt wrong user!
      return;
    } 
    SessionUser.findOne({username: username}, function (err, foundSessionUser) {
      if (err) return console.log(err);
      if(foundSessionUser) {
        SessionUser.findOneAndDelete({sessionKey: foundSessionUser.sessionKey}, function(err) {
          if (err) return console.log(err);
        });
      }
      bcrypt.compare(password, foundUser.hash, function (err, result) {
        if (err) return console.log(err);
        if(result) {
          const sessionKey = process.env.PEPPER + new Date().getTime() + foundUser.username;
          bcrypt.hash(sessionKey, saltRounds, function(err, sessionKeyHash) {
            if (err) return console.log(err);
            const newSessionUser = {
              username: username,
              sessionKey: sessionKeyHash
            }
            SessionUser.create(newSessionUser, function(err, sessionUser) {
              if (err) return console.log(err);
              res.cookie(cookieKey, sessionUser.sessionKey, { maxAge: 3600*1000, httpOnly: true});
              Profile.findOne({username: username}, function (err, foundProfile) {
                if (err) return console.log(err);
                res.status(200).send({
                  username: foundProfile.username, 
                  result: "Logged In"});
              })
              
            });
          });
        } else {
          res.status(401).send({result: "Wrong Password"}); // stub: Do something to prompt wrong password!
        }
      });
    });
  });
}

// Register

function postRegister(req, res) {
  // console.log('postRegister called');
  var profile = req.body.userProfile;
  // console.log(profile);

  
  // Check duplicate items
  Profile.findOne({$or: [
    {'username': profile.username},
    {'email': profile.email},
    {'phone': profile.phone},
   ]}, function(err, foundProfile) {
    if (err) return console.log(err);
    // console.log(foundUser);
    // console.log(profile);
    // console.log(foundProfile)
    if(foundProfile) {
      if(foundProfile.username == profile.username) {
        return res.status(403).send({result: "Username Already Exists! "});
      }
      if(foundProfile.email == profile.email) {
        return res.status(403).send({result: "Email Already Exists! "});
      }
      if(foundProfile.phone == profile.phone) {
        return res.status(403).send({result: "Phone Already Exists! "});
      }
    } else {
      // console.log('Create User')
      // Creare new User first, then create new Profile
      bcrypt.genSalt(saltRounds, function(err, salt) {
        if (err) return console.log(err);
        bcrypt.hash(profile.password, salt, function(err, hash) {
          if (err) return console.log(err);
          var newUser = {
            username: profile.username,
            salt: salt,
            hash: hash,
          }
          User.create(newUser, function(err, user) {
            if (err) return console.log(err);
            // console.log("New User added! ");
            // newProfile = {
            //   username: profile.username,
            //   displayName: profile.displayName,
            //   email: profile.email,
            //   phone: profile.phone,
            //   zipcode: profile.zipcode,
            //   birthday: d.getTime(),
            // };
            Profile.create(profile, function(err, profile) {
              if (err) return console.log(err);
              // console.log("New Profile added! ");
              res.status(200).send({
                username: user.username, 
                displayName: profile.displayName,
                result: "Successfully Registered"});
            })
          })
        });
      });
    }
  });
}

// Logout

function putLogout(req, res) {
  if (req.isAuthenticated()) {
    // console.log('isau')
    req.logout();
    return res.status(200).send({'result': "Logged Out"});
  } else {
    // console.log('call me')
    const sessionKey = req.cookies[cookieKey];
    // console.log(sessionKey);
    SessionUser.findOneAndDelete({sessionKey: sessionKey}, function(err) {
      if (err) return console.log(err);
      res.clearCookie(cookieKey);
      res.status(200).send({'result': "Logged Out"});// stub: Do something to logout!
    });
  }
}

// Put Password

function putPassword(req, res) {
  const newPassword = req.body.password;
  User.findOne({username: req.username}, function(err, findUser) {
    if (err) return console.log(err);
    bcrypt.genSalt(saltRounds, function(err, salt) {
      if (err) return console.log(err);
      bcrypt.hash(newPassword, salt, function(err, hash) {
        if (err) return console.log(err);
        findUser.set({
          salt: salt,
          hash: hash
        });
        findUser.save(function (err, updatedUser) {
          if (err) return console.log(err);
          res.send({
            username: updatedUser.username, 
            result: "Updated Password"
          });
        });
      });
    });
  })
}

function linkAccount(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const usernameGithub = req.body.usernameGithub;
  // console.log(password);
  User.findOne({username: username}, function(err, foundUser) {
    if (err) return console.log(err);
    // Validate password
    if (foundUser) {
      Profile.findOne({username: username}, (err, foundProfile) => {
        if (err) return console.log(err);
        Profile.findOne({username: usernameGithub}, (err, foundGithubProfile) => {
          if (err) return console.log(err);
          // Merge Following
          var githubFollowing = foundGithubProfile.following;
          var originalFollowing = foundProfile.following;
          // console.log(githubFollowing);
          // console.log(originalFollowing);
          githubFollowing.forEach((following) => {
            var exist = false;
            originalFollowing.forEach((iter) => {
              // console.log(iter);
              // console.log(following);
              // console.log(iter == following);
              // console.log(iter.equals(following));
              if (iter.equals(following)) {
                exist = true;
              }
            })
            if (!exist) {
              originalFollowing.push(following);
            }
          });
          // Merge Article
          Article.find({author: foundGithubProfile._id}, (err, foundArticles) => {
            if (err) return console.log(err);
            // console.log(foundArticles);
            foundArticles.forEach((article) => {
              article.author = foundProfile._id;
              article.save((err, savedArticle) => {
                if (err) return console.log(err);
              })
            })
          })
          bcrypt.compare(password, foundUser.hash, function (err, result) {
            if (err) return console.log(err);
            if (result) {               
              // Delete github user
              User.deleteOne({'thirdParty.party': 'github', 'thirdParty.username': usernameGithub}, function(err) {
                if (err) return console.log(err);
                Profile.deleteOne({username: usernameGithub}, (err) => {
                  if (err) return console.log(err);
                  // Add thirdparty to original user
                  thirdParty = {
                    party: 'github', 
                    username: usernameGithub
                  };
                  foundUser.thirdParty.push(thirdParty);
                  foundUser.save(function(err, savedUser) {
                    if (err) return console.log(err);
                    foundProfile.save((err, savedProfile) => {
                      if (err) return console.log(err);
                      res.status(200).send({result: "Account Connected"});
                    })
                  })
                }); 
              })
            } else {
              res.status(401).send({result: "Wrong Password"});
            }
          });
        })
      })
    } else {
      res.status(401).send({result: "Wrong Account"});
    }
  });
}

function getUser(req, res) {
  User.findOne({username: req.username}, function(err, foundUser) {
    if (err) return console.log(err);
    res.status(200).send(foundUser);
  })
}

function unlinkGithub(req, res) {
  User.findOne({username: req.username}, function(err, foundUser) {
    if (err) return console.log(err);
    foundUser.thirdParty = [];
    foundUser.save((err, newUser) => {
      if (err) return console.log(err);
      res.status(200).send({result: "Seccussfully Unlinked Github"});
    })
  })
}


module.exports.middleware = middleware;

module.exports.authRoutes = (app) => {
  app.post('/login', postLogin);
  app.put('/logout', middleware.isLoggedIn, putLogout);
  app.post('/register', postRegister);
  app.put('/password', middleware.isLoggedIn, putPassword);
  app.get('/auth/github', passport.authenticate('github'));
  app.get('/auth/github/callback',passport.authenticate('github'), function(req, res) {
    res.redirect('https://ricebook-hw7.surge.sh/#/main')
  });
  
  app.put('/linkAccount', middleware.isLoggedIn, linkAccount);
  app.get('/getUser', middleware.isLoggedIn, getUser);
  app.put('/unlinkGithub', middleware.isLoggedIn, unlinkGithub);
};