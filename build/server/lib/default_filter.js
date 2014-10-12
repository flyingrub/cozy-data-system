// Generated by CoffeeScript 1.7.1
var db;

db = require('../helpers/db_connect_helper').db_connect();

module.exports.get = function(id) {
  return "function(doc, req){\n    if(doc._deleted) {\n        return true;\n    }\n    if ((doc.docType && doc.docType === \"File\")\n      || (doc.docType && doc.docType === \"Folder\")) {\n        return true;\n    } else if (doc._id === '" + id + "') {\n        return true;\n    } else {\n        return false;\n    }\n}";
};

module.exports.getDocType = function(id) {
  return "function (doc, req) {\n    if ((doc.docType && doc.docType === \"File\")\n      || (doc.docType && doc.docType === \"Folder\")) {\n        return true;\n    } else if (doc._id === '" + id + "') {\n        return true;\n    } else {\n        return false;\n    }\n}";
};

module.exports.asView = function(id) {
  return "function (doc) {\n    if (doc._id === '" + id + "' || (doc.docType && doc.docType === \"File\")\n|| (doc.docType && doc.docType === \"Folder\"))  {\n        emit(doc._id, null);\n    }\n}";
};
