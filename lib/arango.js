"use strict";

const Database = require('arangojs');
let db = null;

let lib = {
    "createConnection" : function (connection) {
        let url = "http://"+ connection.host + ":" + connection.port
        //create URL string
        let db = new Database({
                url: url
            });
        db.useDatabase(connection.database);
        if(connection.username && connection.password)
            db.useBasicAuth(connection.username, connection.password);
        return db;
    },
    /**
     * Performs a query on an Arango Database
     */
    "query" : function (connection, query, cb) {
        (async () => {
            try {
                const cursor = await connection.query(query);
                const response = await cursor.all();
                return cb(null, response);
            } catch (error) {
                return cb (new Error(error));
            }
        })()
    },

    /**
     * Performs a transaction on an Arango database
     */
    "transaction" : function (options, cb) {
        utils.dbConnect().transaction(options.collections, options.action, options.params).then(function(result) {
                return cb (null, result);
        }).catch(function(err){
            return cb(err);
        });
    }
};

module.exports = lib;