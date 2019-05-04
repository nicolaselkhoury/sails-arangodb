/**
 * Module dependencies
 */

const _ = require('@sailshq/lodash');

const modifiers = {
    "and": {"type": "pre_ops", "action": "iterate", "value" : "AND"},
    "or":{"type":"pre_ops", "action": "iterate", "value": "OR"}, 
    "!=":{"type":"in_ops", "action": "compare", "value" : "!="},
    "<=":{"type":"in_ops", "action": "compare", "value" : "<="},
    ">=":{"type":"in_ops", "action": "compare", "value" : ">="},
    "<":{"type":"in_ops", "action": "compare", "value" : "<"},
    ">":{"type":"in_ops", "action": "compare", "value" : ">"},
    "in":{"type":"in_ops", "action": "compare", "value" : "IN"},
    "nin":{"type":"in_ops", "action": "compare", "value" : "NOT IN"},
    "like":{"type":"in_ops", "action": "compare", "value" : "LIKE"}
}

module.exports = function normalizeWhereClause (filters) {
    for (const key in filters) {
        if (modifiers[key]){
            switch(modifiers[key].action) {
                case "iterate":
                    let iterate = "(";
                    for (const [index, element] of filters[key].entries()) {
                        if (index > 0)
                            iterate += ") " + key + " (";
                        iterate += normalizeWhereClause(element);
                    }
                    iterate += ")";
                    return iterate;
                    break;
                case "compare":
                    if(Array.isArray(filters[key]))
                        return modifiers[key].value + " " + JSON.stringify(filters[key]);
                    else if (typeof filters[key] == "string")
                        return modifiers[key].value + " '" + filters[key] + "'"; 
                    else return modifiers[key].value + " " + filters[key];
                    break;
                default:
            }
        }
        else {
            if (typeof filters[key] == "string") 
                return "records." + key + " == '" + filters[key] + "'";
            else if (typeof filters[key] == "number" || typeof filters[key] == "boolean") 
                return "records." + key + " == " + filters[key];
            else
                return "records." + key + " " + normalizeWhereClause(filters[key]); 
        }
        return filters;
    }
    return filters;
};
