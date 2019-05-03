let arango = require("./arango.js");
const _ = require('@sailshq/lodash');

let utils = {
    "assembleQueryString" : function(collection, criteria) { 
        //Translate the collection and object provided into an AQL
        let query = `FOR records IN ${collection}`;
        if(criteria.where)
            query += ` FILTER ${criteria.where}`;
        if(criteria.limit) {
            if(criteria.skip)
                query += ` LIMIT ${criteria.skip},${criteria.limit}`;
            else query += ` LIMIT 0,${criteria.limit}`;
        }
        if(criteria.sort && criteria.sort.length > 0) {
            query += ` SORT`;
                criteria.sort.forEach((oneSortOption) => {
                query += ` records.${_.first(_.keys(oneSortOption))} ${oneSortOption[_.first(_.keys(oneSortOption))]},`;
            });
            query = query.substring(0, query.length-1);
        }
        
        return query;
    }
}
module.exports = {
    /**
     * Creates a JSON object in a collection, using the specified arango connection 
     */
    "create" : function(connection, collection, data, cb) {
        //Translate the collection and object provided into an AQL
        delete data._key;
        delete data._id;
        delete data._rev;
        delete data.id;
        let query = `INSERT ${JSON.stringify(data)} INTO ${collection} RETURN NEW`;
        //Perform the AQL on the database
        arango.query(connection, query, (error, records) => {
            //sails prohibits returning second arguments in create methods
            //therefore, only return an error if present
            if(error) return cb(new Error(error));
            return cb(null, records);
        });
    },
    /**
     * Returns records from a collection, using the specified arango collection, based on the specified criteria
     */
    "find" : function(connection, collection, criteria, cb) { 
        let query = `${utils.assembleQueryString(collection, criteria)} RETURN records`;
        //Perform the AQL on the database
        arango.query(connection, query, (error, records) => {
            if(error) return cb(new Error(error));
            return cb(null, records);
        });
    },
    /**
     * Updates a set of records in a collection based on a set of criteria
     */
    "update" : function(connection, collection, criteria, newValues, cb) {
        criteria.limit = 0;
        let query = `${utils.assembleQueryString(collection, criteria)} UPDATE records WITH ${JSON.stringify(newValues)} IN ${collection} RETURN NEW`;
        //Perform the AQL on the database
        arango.query(connection, query, (error, records) => {
            if(error) return cb(new Error(error));
            return cb(null, records);
        });
    },
    /**
     * destroys a set of records in a collection based on a set of criteria
     */
    "destroy" : function(connection, collection, criteria, cb) {
        criteria.limit = 0;
        let query = `${utils.assembleQueryString(collection, criteria)} REMOVE records IN ${collection} RETURN OLD`;
        console.log(query)
        //Perform the AQL on the database
        arango.query(connection, query, (error, records) => {
            if(error) return cb(new Error(error));
            return cb(null, records);
        });
    }
}