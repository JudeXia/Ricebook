var mongoose = require("mongoose");
var User = require("./models/user");
var SessionUser = require("./models/sessionUser");
var Profile = require("./models/profile");
var Article = require("./models/article");
var Comment = require("./models/comment");
const bcrypt = require('bcryptjs');
const saltRounds = Number(process.env.SALTROUNDS);
var async = require('async');

async function seedDB() {
  await User.deleteMany({});
  await SessionUser.deleteMany({});
  await Profile.deleteMany({});
  await Article.deleteMany({});
  await Comment.deleteMany({});
  console.log("All Users, Sessions, Profiles Removed! ");
  var profileids = [];
  var usernames = [];
  for(var i = 0; i < usersData.length; i++) {
    userData = usersData[i];
    var salt = bcrypt.genSaltSync(saltRounds);
    var hash = bcrypt.hashSync(userData.password, salt);
    var user = {
      username: userData.username,
      salt: salt,
      hash: hash,
    }
    let newUser = await User.create(user);
    console.log("New User Added! ");
    profileData = profilesData[i];
    profileData['userid'] = newUser.id;
    let profile = await Profile.create(profileData)
    profileids.push(profile._id);
    usernames.push(profile.username);
    console.log("New Profile Added! ");
    articles = articlesData[i];
    for(var j = 0; j < articles.length; j++) {
      article = articles[j];
      article.author = profile;
      let newArticle = await Article.create(article);
      comments = commentsData[i][j];
      for(var k = 0; k < comments.length; k++) {
        comment = comments[k];
        var author = {
          id: profile._id,
          displayName: profile.displayName, 
          avatar: profile.avatar
        };
        comment.author = author;
        let newComment = await Comment.create(comment);
        newArticle.comments.push(newComment);
        await newArticle.save();
      }
    }
  }

  // Add Following
  for(var i = 0; i < usernames.length; i++) {
    let foundProfile = await Profile.findOne({username: usernames[i]});
    foundProfile.following = [];
    for(var j = 0; j < followingsData[i].length; j++) {
      foundProfile.following.push(profileids[ followingsData[i][j] ]);
    }
    await foundProfile.save();
  }

}

module.exports = seedDB;


var usersData = [
  {
    username: "xx21",
    password: "asd", 
  }, 
  {
    username: "sdzcxx", 
    password: "asd",
  },
  {
    username: "John", 
    password: "asd",
  },
  {
    username: "Paul", 
    password: "asd",
  },
  {
    username: "George", 
    password: "asd",
  },
  {
    username: "Ringo", 
    password: "asd",
  },
];

var profilesData = [
  {
    username: "xx21",
    displayName: "Jude Xia",
    email: "xx21@rice.edu",
    phone: "1234567890",
    zipcode: "77005",
    birthday: "765954000000",
    headline: "I'm Jude. ",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRQOka_pE2dn3ydIjhEObfhxNpByDH7EzGVs81JoME9NBge6y6",
    headline: "I'm Jude. ",
  }, 
  {
    username: "sdzcxx",
    displayName: "Xiao Xia",
    email: "xiao.xia@rice.edu",
    phone: "1234567890",
    zipcode: "12345",
    birthday: "765954000000",
    headline: "I'm Xiao. ",
    avatar: "https://farm4.staticflickr.com/3023/2788344191_c73cd3d676.jpg",
  },
  {
    username: "John",
    displayName: "John Lennon",
    email: "John.Lennon@rice.edu",
    phone: "1234567890",
    zipcode: "77005",
    birthday: "765954000000",
    headline: "Won't you please please help me! ",
    avatar: "https://scontent.fhou2-1.fna.fbcdn.net/v/t1.0-9/39129979_2062587203759982_6080978967290970112_n.jpg?_nc_cat=1&oh=3bb29d8c67cdbe634b1057cb392d3369&oe=5C5DE40A",
  },
  {
    username: "Paul",
    displayName: "Paul McCartney",
    email: "Paul.McCartney@rice.edu",
    phone: "1234567890",
    zipcode: "12345",
    birthday: "765954000000",
    headline: "Can't buy me love. ",
    avatar: "https://scontent.fhou2-1.fna.fbcdn.net/v/t1.0-9/35731693_10156681697128313_8188101480465563648_n.jpg?_nc_cat=1&oh=01232ccf4384f8896b2fecf82a8f54c5&oe=5C4B64D0",
  },
  {
    username: "George",
    displayName: "George Harrison",
    email: "George.Harrison@rice.edu",
    phone: "1234567890",
    zipcode: "12345",
    birthday: "765954000000",
    headline: "Something in the way she moves. ",
    avatar: "https://scontent.fhou2-1.fna.fbcdn.net/v/t1.0-9/39074834_2387224717985130_7376078930370887680_n.jpg?_nc_cat=104&oh=608afccdd0bf6e0af4e9d59202d6d274&oe=5C1949C2",
  },
  {
    username: "Ringo",
    displayName: "Ringo Starr",
    email: "Ringo.Starr@rice.edu",
    phone: "1234567890",
    zipcode: "12345",
    birthday: "765954000000",
    headline: "We all live in a Yellow Submarine~ ",
    avatar: "https://scontent.fhou2-1.fna.fbcdn.net/v/t1.0-9/19895040_10154863278047677_415679017027204794_n.jpg?_nc_cat=108&oh=8fa9bfce2896944fc7fc0c78b3c8b53c&oe=5C6187ED",
  },
];

var articlesData = [
  [
    {
      text: "Let me take you down, 'cause I'm going to Strawberry Fields. Nothing is real and nothing to get hung aboutStrawberry Fields forever",
      image: "https://ksassets.timeincuk.net/wp/uploads/sites/55/2015/10/GettyImages-84843330-copy-920x584.jpg",
    }
  ],
  [
    {
      text: "When I was younger so much younger than today, I never needed anybody's help in any way. But now these days are gone and I'm not so self assured. Now I find I've changed my mind, I've opened up the doors",
      image: "https://2ab9pu2w8o9xpg6w26xnz04d-wpengine.netdna-ssl.com/wp-content/uploads/2018/10/john-lennon-album-cover--1200x632.jpg",
    }
  ],
  [
    {
      text: "Words are flowing out like endless rain into a paper cup. They slither while they pass, they slip away across the universe. Pools of sorrow waves of joy are drifting through my opened mind. Possessing and caressing me.",
      image: "https://www.penningtonlibrary.org/wp-content/uploads/2018/10/The-Beatles.jpg",
    }, 
    {
      text: "When I was younger so much younger than today, I never needed anybody's help in any way. But now these days are gone and I'm not so self assured. Now I find I've changed my mind, I've opened up the doors",
      image: "https://www.rockhall.com/sites/default/files/styles/header_image_portrait/public/beatles_002.jpg?itok=usxm7KOE",
    }, 
  ],
  [
    {
      text: "Yesterday all my troubles seemed so far away. Now it looks as though they're here to stay. Oh, I believe in yesterday. Suddenly, I'm not half the man I used to be. There's a shadow hanging over me. Oh, yesterday came suddenly. Why she had to go? I don't know, she wouldn't say. I said something wrong. Now I long for yesterday. ",
    }
  ], 
  [
    {
      text: "Something in the way she moves. Attracts me like no other lover. Something in the way she woos me. I don't want to leave her now. You know I believe and how"
    },
  ],
  [
    {
      text: "In the town where I was born, lived a man who sailed to sea, and he told us of his life. In the land of submarines",
      image: "https://s3.amazonaws.com/allaboutjazz/photos/2010/jazz-honors-the-beatles.jpg"
    }
  ]
];

var commentsData = [
  [
    [
      {
        text: 'This is the first comment of article 1'
      }, 
      {
        text: 'This is the second comment of article 1'
      }
    ]
  ],
  [
    [
      {
        text: 'This is the first comment of article 2'
      }, 
      {
        text: 'This is the second comment of article 2'
      }
    ]
  ], 

  [
    [
      {
        text: 'This is the first comment of article 3'
      }, 
      {
        text: 'This is the second comment of article 3'
      }
    ], 
    [
      {
        text: 'This is the first comment of article 4'
      }, 
      {
        text: 'This is the second comment of article 4'
      }
    ]
  ], 

  [
    [
      {
        text: 'This is the first comment of article 5'
      }, 
      {
        text: 'This is the second comment of article 5'
      }
    ], 
  ],

  [
    [
      {
        text: 'This is the first comment of article 6'
      }, 
      {
        text: 'This is the second comment of article 6'
      }
    ], 
  ],

  [
    [
      {
        text: 'This is the first comment of article 7'
      }, 
      {
        text: 'This is the second comment of article 7'
      }
    ], 
  ]
]

var followingsData = [
  [1, 2, 3, 4, 5], 
  [0, 2], 
  [0, 1],
  [0, 1],
  [0, 1],
  [0, 1],
]