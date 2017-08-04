const db = require('../../db/config');
const { matchLostItem, matchFoundItem } = require('./controllers/matchhandler');
const { getUserId } = require('./utils');
const { promisify } = require('bluebird');

const createLostPromise = promisify(db.lost.create.bind(db.lost));
const createFoundPromise = promisify(db.found.create.bind(db.found));

exports.postLostItem = (req, res) => {
  // req.session.user = req.session.user || 'frank';
  const item = req.body;
  getUserId(req.session.user)
    .then((userId) => {
      item.user_id = userId;
      createLostPromise(item)
        .then(() => matchLostItem(item))
        .then(() => res.send('post success'));
    });
};

exports.postFoundItem = (req, res) => {
  // req.session.user = req.session.user || 'frank';
  const item = req.body;
  getUserId(req.session.user)
    .then((userId) => {
      item.user_id = userId;
      createFoundPromise(item)
        .then(found => matchFoundItem(found))
        .then(() => res.send('post success'));
    });
};

exports.getStatus = (req, res) => {
  if (req.session.user) res.send(true);
  else res.send(false);
};


exports.postMessages = (req, res) => {
  db.messages.create(req.body, (err) => {
    if (err) throw err;

    // must still write here check data base as a call back
  });
  res.send('success on post messages');
};

exports.getMessages = (req, res) => {
  // console.log('getMessages', req.body);
  getUserId(req.session.user, (userId) => {
    getUserId(req.query.to_user, (toUserId) => {
      db.messages.find({ user_id: userId, to_user_id: toUserId })
        .then(res.send.bind(res));
    });
    //WAITING FOR WALTER
  });
};

exports.getMatches = (req, res) => {
  req.session.user = req.session.user || 'barney';
  getUserId(req.session.user, (userId) => {
    db.found.find({ user_id: userId })
      .then((data) => {
        data = data.filter(item => item.matches.length > 0 && item.matches.found === false);
        res.send(data);
      });
  });
};
