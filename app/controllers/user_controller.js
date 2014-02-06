// Generated by CoffeeScript 1.6.2
var Client, checkDocType, client, db, git, keys;

load('application');

git = require('git-rev');

Client = require("request-json").JsonClient;

keys = require('./lib/encryption');

checkDocType = require('./lib/token').checkDocType;

client = new Client("http://localhost:9102/");

db = require('./helpers/db_connect_helper').db_connect();

before('permissions_add', function() {
  var _this = this;

  return checkDocType(req.header('authorization'), "User", function(err, isAuthenticated, isAuthorized) {
    return next();
  });
}, {
  only: ['create', 'merge']
});

before('lock request', function() {
  var _this = this;

  this.lock = "" + params.id;
  return app.locker.runIfUnlock(this.lock, function() {
    app.locker.addLock(_this.lock);
    return next();
  });
}, {
  only: ['merge']
});

after('unlock request', function() {
  return app.locker.removeLock(this.lock);
}, {
  only: ['merge']
});

before('get doc', function() {
  var _this = this;

  return db.get(params.id, function(err, doc) {
    if (err && err.error === "not_found") {
      app.locker.removeLock(_this.lock);
      return send({
        error: "not found"
      }, 404);
    } else if (err) {
      console.log("[Get doc] err: " + JSON.stringify(err));
      app.locker.removeLock(_this.lock);
      return send({
        error: err
      }, 500);
    } else if (doc != null) {
      _this.doc = doc;
      return next();
    } else {
      app.locker.removeLock(_this.lock);
      return send({
        error: "not found"
      }, 404);
    }
  });
}, {
  only: ['merge']
});

before('permissions', function() {
  var _this = this;

  return checkDocType(req.header('authorization'), this.doc.docType, function(err, isAuthenticated, isAuthorized) {
    return next();
  });
}, {
  only: ['merge']
});

action('create', function() {
  delete body._attachments;
  if (params.id) {
    return db.get(params.id, function(err, doc) {
      if (doc) {
        return send({
          error: "The document exists"
        }, 409);
      } else {
        return db.save(params.id, body, function(err, res) {
          if (err) {
            return send({
              error: err.message
            }, 409);
          } else {
            return send({
              "_id": res.id
            }, 201);
          }
        });
      }
    });
  } else {
    return db.save(body, function(err, res) {
      if (err) {
        railway.logger.write("[Create] err: " + JSON.stringify(err));
        return send({
          error: err.message
        }, 500);
      } else {
        return send({
          "_id": res.id
        }, 201);
      }
    });
  }
});

action('merge', function() {
  delete body._attachments;
  return db.merge(params.id, body, function(err, res) {
    if (err) {
      console.log("[Merge] err: " + JSON.stringify(err));
      return send({
        error: err.message
      }, 500);
    } else {
      return send({
        success: true
      }, 200);
    }
  });
});
