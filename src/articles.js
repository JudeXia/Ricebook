const User = require('../models/user');
const Profile = require('../models/profile');
const Article = require('../models/article');
const Comment = require('../models/comment');
const middleware = require("./auth").middleware;
const mongoose = require('mongoose');
const uploadImage = require("./uploadCloudinary");


function getArticle(req, res) {
  const id = req.params.id;
  const offset = req.params.offset;
  const username = req.username;
  const userid = req.userid;
  // console.log(id);
  if (!id) {
    // If no id provided, return all the following's articles
    Profile.findOne({
      username: username
    }, function (err, foundProfile) {
      if (err) return console.log(err);
      // console.log(foundProfile)
      // console.log(foundProfile);
      if (foundProfile.following) {
        foundProfile.following.push(userid);
      } else {
        foundProfile['following'] = [userid];
      }
      // console.log(foundProfile['following'])
      Article.
        find().
        where('author').
        equals({
          $in: foundProfile.following
        }).
        sort({createdAt: -1}).
        limit(10).
        skip(10 * offset).
        populate({path: 'author', select:['displayName', 'avatar']}).
        populate("comments").
        exec(function (err, foundArticles) {
          if (err) return console.log(err);
          return res.status(200).send({
            articles: foundArticles
          });
        });
    });
  } else {
    // Validate the id first
    if (mongoose.Types.ObjectId.isValid(id)) {
      // Try to find the article with this id.
      Article.findById(id).populate("comments").exec(function (err, foundArticle) {
        if (err) return console.log(err);
        if (foundArticle) {
          return res.status(200).send({
            articles: foundArticle
          });
        } else {
          // Failed. Try to find user with this id
          Profile.findById(id, function (err, foundProfile) {
            if (err) return console.log(err);
            if (foundProfile) {
              Article.find().where('author.id').equals(foundProfile._id).populate("comments").exec(function (err, foundArticles) {
                if (err) return console.log(err);
                if (foundArticles) {
                  return res.status(200).send({
                    articles: foundArticles
                  });
                } else {
                  return res.status(404).send({
                    result: "Article Not Found"
                  });
                }
              });
            } else {
              // Failed again. 404
              return res.status(404).send({
                result: "Article Not Found"
              });
            }
          });
        }
      });
    } else {
      return res.status(404).send({
        result: "Invalid ID"
      });
    }
  }
}

function putArticle(req, res) {
  const id = req.params.id;
  const text = req.body.text;
  const commentId = req.body.commentId;
  if (mongoose.Types.ObjectId.isValid(id)) {
    Article.findById(id, (err, foundArticle) => {
      if (err) return console.log(err);
      if (foundArticle) {
        if (!commentId) {
          if (foundArticle.author.id.equals(req.userid)) {
            foundArticle.text = text;
            foundArticle.save(() => {
              res.status(200).send({
                result: "Article Updated"
              });
            });
          } else {
            res.status(401).send({
              result: "Article Unauthorized"
            });
          }
        } else {
          if (commentId === '-1') {
            Profile.findById(req.userid, (err, foundProfile) => {
              if (err) return console.log(err);
              const comment = {
                text: text,
                author: {
                  id: req.userid,
                  displayName: req.displayName, 
                  avatar: foundProfile.avatar
                }
              }
              Comment.create(comment, (err, newComment) => {
                if (err) return console.log(err);
                foundArticle.comments.push(newComment);
                foundArticle.save(() => {
                  res.status(200).send({
                    result: "Comment Created"
                  });
                });
              })
            })
          } else {
            if (mongoose.Types.ObjectId.isValid(id)) {
              Comment.findById(commentId, (err, foundComment) => {
                if (err) return console.log(err);
                if (foundComment) {
                  if (foundComment.author.id.equals(req.userid)) {
                    foundComment.text = text;
                    foundComment.save(() => {
                      res.status(200).send({
                        result: "Comment Updated"
                      });
                    });
                  } else {
                    res.status(401).send({
                      result: "Comment Unauthorized"
                    });
                  }
                } else {
                  res.status(404).send({
                    result: "Comment Not Found"
                  });
                }
              });
            } else {
              res.status(404).send({
                result: "Invalid Comment ID"
              });
            }
          }
        }
      } else {
        res.status(404).send({
          result: "Article Not Found"
        });
      }
    });
  } else {
    res.status(404).send({
      result: "Invalid Article ID"
    });
  }
}

function postArticle(req, res) {
  const text = req.body.text;
  let image = null;
  let image_id = null;
  if (req.fileurl) {
    image = req.fileurl;
    image_id = req.fileid;
  }
  const author = req.userid;
  const article = {
    text: text,
    image: image,
    image_id: image_id,
    author: author
  }
  Article.create(article, (err, newArticle) => {
    if (err) return console.log(err);
    res.status(200).send({
      result: "New Article Created"
    });
  });
}

module.exports = (app) => {
  app.get('/articles/:id?/:offset', middleware.isLoggedIn, getArticle);
  app.put('/articles/:id', middleware.isLoggedIn, putArticle);
  app.post('/article', middleware.isLoggedIn, uploadImage, postArticle);
};