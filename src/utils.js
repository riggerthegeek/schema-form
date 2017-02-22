// /**
//  * utils
//  *
//  * Utility functions
//  */
//
// "use strict";
//
//
// /* Node modules */
//
//
// /* Third-party modules */
// import {_} from "lodash";
//
//
// /* Files */
//
//
// export class Utils {
//
//
//     /**
//      * Std Form Object
//      *
//      * This creates the standard form object
//      * which can be extended later.
//      *
//      * @param {string} name
//      * @param {object} schema
//      * @param {object} opts
//      * @returns {object}
//      */
//     static stdFormObject (name, schema, opts = {}) {
//
//         const formObject = _.has(opts, ["global", "formDefaults"]) ? _.cloneDeep(opts.global.formDefaults) : {};
//
//         if (opts.global && opts.global.suppressPropertyTitles === true) {
//             formObject.title = schema.title;
//         } else {
//             formObject.title = schema.title || name;
//         }
//
//         if (schema.description) { formObject.description = schema.description; }
//         if (opts.required === true || schema.required === true) { formObject.required = true; }
//         if (schema.maxLength) { formObject.maxlength = schema.maxLength; }
//         if (schema.minLength) { formObject.minlength = schema.minLength; }
//         if (schema.readOnly || schema.readonly) { formObject.readonly  = true; }
//         if (schema.minimum) { formObject.minimum = schema.minimum + (schema.exclusiveMinimum ? 1 : 0); }
//         if (schema.maximum) { formObject.maximum = schema.maximum - (schema.exclusiveMaximum ? 1 : 0); }
//
//         /* Validity states */
//         formObject.$pristine = true;
//         formObject.$valid = false;
//
//         return formObject;
//
//     }
//
//
//     /**
//      * Strip Null Type
//      *
//      * Strips out null types from the definition.
//      *
//      * @param {object} type
//      * @returns {object}
//      */
//     static stripNullType (type) {
//
//         if (_.isArray(type) && type.length === 2) {
//             if (type[0] === "null") {
//                 return type[1];
//             } else if (type[1] === "null") {
//                 return type[0];
//             }
//         }
//
//         return type;
//
//     }
//
//
// }
