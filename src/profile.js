const User = require('../models/user');
const Profile = require('../models/profile');
const Article = require('../models/article');
const Comment = require('../models/comment');
const middleware = require("./auth").middleware;
const uploadImage = require("./uploadCloudinary");
const mongoose = require('mongoose');
const auth = require('./auth');

// ************************ Headline ********************

function getHeadline(req, res) {
	const reqUserIds = req.params.users;
	if (reqUserIds) {
		// get multiple headlines
		var strUserIds = reqUserIds.split(',');
		userIds = strUserIds.filter(userId => mongoose.Types.ObjectId.isValid(userId))
		if(userIds.length != strUserIds.length) {
			res.status(404).send({result: "Invalid Object ID Exists"});
		} else {
			// console.log(userIds)
			Profile.find({_id: {$in: userIds}}, (err, foundProfiles) => {
				if (err) return console.log(err);
				if(foundProfiles) {
					if(foundProfiles.length != userIds.length) {
						res.status(404).send({result: "Invalid User ID Exists"});
					} else {
						var headlines = [];
						foundProfiles.forEach((foundProfile) => {
							headlines.push({
								userid: foundProfile._id,
								username: foundProfile.username,
								displayName: foundProfile.displayName,
								headline: foundProfile.headline
							});
						})
						res.status(200).send({headlines: headlines});
					}
				} else {
					res.status(404).send({result: "Profile Not Found"});
				}
			})
		}
	} else {
		// only get headline for current user
		Profile.findOne({username: req.username}, (err, foundProfile) => {
			if (err) return console.log(err);
			const headline = {
				userid: foundProfile._id,
				username: foundProfile.username,
				displayName: foundProfile.displayName,
				headline: foundProfile.headline
			};
			res.status(200).send({headlines: [headline]});
		});
	}

}

function putHeadline(req, res) {
	const headline = req.body.headline;
	Profile.findById(req.userid, (err, foundProfile) => {
		if (err) return console.log(err);
		foundProfile.headline = headline;
		foundProfile.save(() => {
			res.status(200).send({
				userid: req.userid,
				username: req.username,
				displayName: req.displayName,
				headline: headline
			});
		});
	});
}


// ************************ Email ********************

function getEmail(req, res) {
	var userid = req.params.user;
	if(!userid) {
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
					email: foundProfile.email
				});
			} else {
				res.status(404).send({result: "Profile Not Found"});
			}
		})
  } else {
    res.status(404).send({result: "Invalid User ID"});
  }
}

function putEmail(req, res) {
	const email = req.body.email;
	Profile.findById(req.userid, (err, foundProfile) => {
		if (err) return console.log(err);
		foundProfile.email = email;
		foundProfile.save(() => {
			res.status(200).send({
				userid: req.userid,
				username: req.username,
				displayName: req.displayName,
				email: email
			});
		});
	})
}

// ************************ Zipcode ********************

function getZipcode(req, res) {
	var userid = req.params.user;
	if(!userid) {
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
					zipcode: foundProfile.zipcode
				});
			} else {
				res.status(404).send({result: "Profile Not Found"});
			}
		})
  } else {
    res.status(404).send({result: "Invalid User ID"});
  }
}

function putZipcode(req, res) {
	const zipcode = req.body.zipcode;
	Profile.findById(req.userid, (err, foundProfile) => {
		if (err) return console.log(err);
		foundProfile.zipcode = zipcode;
		foundProfile.save(() => {
			res.status(200).send({
				userid: req.userid,
				username: req.username,
				displayName: req.displayName,
				zipcode: zipcode
			});
		});
	})
}

// ************************ Phone ********************

function getPhone(req, res) {
	var userid = req.params.user;
	if(!userid) {
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
					phone: foundProfile.phone
				});
			} else {
				res.status(404).send({result: "Profile Not Found"});
			}
		})
  } else {
    res.status(404).send({result: "Invalid User ID"});
  }
}

function putPhone(req, res) {
	const phone = req.body.phone;
	Profile.findById(req.userid, (err, foundProfile) => {
		if (err) return console.log(err);
		foundProfile.phone = phone;
		foundProfile.save(() => {
			res.status(200).send({
				userid: req.userid,
				username: req.username,
				displayName: req.displayName,
				phone: phone
			});
		});
	})
}

// ************************ DOB ********************

function getDOB(req, res) {
	var userid = req.params.user;
	if(!userid) {
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
					birthday: foundProfile.birthday
				});
			} else {
				res.status(404).send({result: "Profile Not Found"});
			}
		})
  } else {
    res.status(404).send({result: "Invalid User ID"});
  }
}

// ************************ Avatar ********************

function getAvatars(req, res) {
	const reqUserIds = req.params.users;
	if (reqUserIds) {
		// get multiple avatars
		var strUserIds = reqUserIds.split(',');
		userIds = strUserIds.filter(userId => mongoose.Types.ObjectId.isValid(userId))
		if(userIds.length != strUserIds.length) {
			res.status(404).send({result: "Invalid Object ID Exists"});
		} else {
			// console.log(userIds)
			Profile.find({_id: {$in: userIds}}, (err, foundProfiles) => {
				if (err) return console.log(err);
				if(foundProfiles) {
					if(foundProfiles.length != userIds.length) {
						res.status(404).send({result: "Invalid User ID Exists"});
					} else {
						var avatars = [];
						foundProfiles.forEach((foundProfile) => {
							avatars.push({
								userid: foundProfile._id,
								username: foundProfile.username,
								displayName: foundProfile.displayName,
								avatar: foundProfile.avatar
							});
						})
						res.status(200).send({avatars: avatars});
					}
				} else {
					res.status(404).send({result: "Profile Not Found"});
				}
			})
		}
	} else {
    // only get avatar for current user
    // console.log(req.username);
    // console.log(req.userid);
    // console.log(req.displayName);
		Profile.findOne({username: req.username}, (err, foundProfile) => {
			if (err) return console.log(err);
			const avatar = {
				userid: foundProfile._id,
				username: foundProfile.username,
				displayName: foundProfile.displayName,
				avatar: foundProfile.avatar
			};
			res.status(200).send({avatars: [avatar]});
		});
	}

}

function putAvatar(req, res) {
	Profile.findById(req.userid, (err, foundProfile) => {
		if (err) return console.log(err);
		if(foundProfile.avatar_id) {
			cloudinary.uploader.destroy(foundProfile.avatar_id, (err) => {
				if (err) return console.log(err);
			});
		}
		foundProfile.avatar = req.fileurl;
		foundProfile.avatar_id = req.fileid;
		foundProfile.save(() => {
			res.status(200).send({
				userid: req.userid,
				username: req.username,
				displayName: req.displayName,
				avatar: foundProfile.avatar
			});
		});
	});
}

function getProfileId(req, res) {
  // console.log(req.displayName);
  var displayName = req.displayName;
  if (req.params.username) {
    displayName = req.params.username;
  }
	Profile.findOne({displayName: displayName}).exec((err, foundProfile) => {
		if (err) return console.log(err);
		if (foundProfile) {
			return res.status(200).send({
				userid: foundProfile._id,
				username: foundProfile.username,
				displayName: foundProfile.displayName,
			});
		} else {
			res.status(404).send({result: "Profile Not Found"});
		}
	})
}

module.exports = (app) => {
	app.get('/headlines/:users?', middleware.isLoggedIn, getHeadline);
	app.put('/headline', middleware.isLoggedIn, putHeadline);

	app.get('/email/:user?', middleware.isLoggedIn, getEmail);
	app.put('/email', middleware.isLoggedIn, putEmail);

	app.get('/zipcode/:user?', middleware.isLoggedIn, getZipcode);
	app.put('/zipcode', middleware.isLoggedIn, putZipcode);

	app.get('/phone/:user?', middleware.isLoggedIn, getPhone);
	app.put('/phone', middleware.isLoggedIn, putPhone);

	app.get('/avatars/:users?', middleware.isLoggedIn, getAvatars);
	app.put('/avatar', middleware.isLoggedIn, uploadImage, putAvatar);

	app.get('/dob/:user?', middleware.isLoggedIn, getDOB);

  app.get('/profileid/:username?', middleware.isLoggedIn, getProfileId);

};