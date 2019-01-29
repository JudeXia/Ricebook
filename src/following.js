const User = require('../models/user');
const Profile = require('../models/profile');
const Article = require('../models/article');
const Comment = require('../models/comment');
const middleware = require("./auth").middleware;
const mongoose = require('mongoose');

function getFollowing(req, res) {
  var userid = req.params.user;
  if (!userid) {
    userid = req.userid;
  }
  if (mongoose.Types.ObjectId.isValid(userid)) {
    Profile.findById(userid).exec((err, foundProfile) => {
      if (err) return console.log(err);
      if (foundProfile) {
        return res.status(200).send({
          userid: foundProfile._id,
          username: foundProfile.username,
          displayName: foundProfile.displayName,
          following: foundProfile.following
        });
      } else {
        res.status(404).send({result: "foundProfile Not Found"});
      }
    })
  } else {
    res.status(404).send({result: "Invalid User ID"});
  }
}

function putFollowing(req, res) {
  // console.log('putFollowing');
  var newFollowing = req.params.user;
  if (mongoose.Types.ObjectId.isValid(newFollowing) && newFollowing != req.userid) {
    Profile.findById(newFollowing).exec((err, foundFollwoingProfile) => {
      if (err) return console.log(err);
      if(foundFollwoingProfile) {
        Profile.findById(req.userid).exec((err, foundProfile) => {
          if (err) return console.log(err);
          if (foundProfile) {
            var alreadyExists = false;
            if(foundProfile.following) {
              foundProfile.following.forEach((following) => {
                if(following.equals(newFollowing)) {
                  alreadyExists = true;
                }
              });
              if(!alreadyExists) {
                foundProfile.following.push(newFollowing)
              } else {
                return res.status(403).send({result: "Already Followed"});
              }
            } else {
              // console.log('new')
              foundProfile['following'] = newFollowing;
            }
            foundProfile.save((err, newProfile) => {
              if (err) return console.log(err);
              return res.status(200).send({
                userid: newProfile.userid,
                username: newProfile.username,
                displayName: newProfile.displayName,
                following: newProfile.following
              });
            })
          } else {
            res.status(404).send({result: "Profile Not Found"});
          }
        })
      } else {
        res.status(404).send({result: "New Following Not Found"});
      }
    });
  } else {
    res.status(404).send({result: "Invalid New Following ID"});
  }
}

function deleteFollowing(req, res) {
  var deleteFollowing = req.params.user;
  if (mongoose.Types.ObjectId.isValid(deleteFollowing)) {
    Profile.findById(req.userid).exec((err, foundProfile) => {
      if (err) return console.log(err);
      if (foundProfile) {
        var isFounded = false;
        var index = 0;
        if(foundProfile.following) {
          foundProfile.following.forEach((following, i) => {
            if(following.equals(deleteFollowing)) {
              isFounded = true;
              index = i;
            }
          });
          if(isFounded) {
            foundProfile.following.splice(index, 1);
            foundProfile.save((err, newProfile) => {
              if (err) return console.log(err);
              return res.status(200).send({
                userid: req.userid,
                username: newProfile.username,
                displayName: newProfile.displayName,
                following: newProfile.following
              });
            })
          } else {
            return res.status(403).send({result: "Following Not Found"});
          }
        }
      } else {
        res.status(404).send({result: "Profile Not Found"});
      }
    })
  } else {
    res.status(404).send({result: "Invalid New Following ID"});
  }
}

module.exports = (app) => {
  app.get('/following/:user?', middleware.isLoggedIn, getFollowing);
  app.put('/following/:user', middleware.isLoggedIn, putFollowing);
  app.delete('/following/:user', middleware.isLoggedIn, deleteFollowing);
};