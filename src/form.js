/**
 * Form
 *
 * This is actually concerned with the
 * generation of our form. This will
 * be the main object that is interacted
 * with.
 *
 * A form can be thought of as a collection
 * of Elements.
 */

"use strict";


/* Node modules */


/* Third-party modules */
import {_} from "lodash";


/* Files */
import {Element} from "./element";


export class Form {


    constructor (schema, definition, { engine, templates }) {
        this._definition = definition;
        this._engine = engine;
        this._schema = schema;
        this._templates = templates;

        /* Merge the schema and the definition */
        this._merged = Form.merge(this._schema, this._definition);
    }


    /**
     * Generate
     *
     * This generates the form HTML and what it
     * knows about the form elements. This is
     * designed to be embedded in your view file.
     *
     * It can receive an optional attributes object.
     * Anything is receives will be put as a
     * key/value pair in the <form>.
     *
     * For example, { class: "form-class", action="/login", method="POST" }
     * will generate <form class="form-class" action="/login" method="POST">.
     * No checks or formatting take place in here
     * so it's up to you to get it right.
     *
     * @param {object} attrs
     * @returns {string}
     */
    generate (attrs = {}) {

        /* Generate the input fields */
        const input = this._merged.reduce((result, form) => {

            /* If no type, we can't do much */
            if (!form.type) {
                return result;
            }

            /* Get the template */
            const template = this._templates[form.type] || this._templates["default"];

            result += this._engine(template)({
                form
            });

            return result;

        }, "");

        /* Wrap the input in a <form> element */
        const formAttrs =_.reduce(attrs, (result, value, key) => {
            result += ` ${key}="${value}"`;
            return result;
        }, "");

        /* Combine them and return */
        return `<form${formAttrs}>${input}</form>`;

    }


    /**
     * Default Form
     *
     * This is the form as the schema
     * sees it
     *
     * @param {object} schema
     */
    static defaultForm (schema) {

        if (schema.type === "object") {

            /* The lookup object provides a fast way of referencing */
            const lookup = {};

            const form = _.reduce(schema.properties, (result, value, key) => {

                /* The required key could be set by on the schema */
                const required = schema.required && schema.required.indexOf(key) !== -1;
                const element = Element.byElementRule(key, value, {
                    required
                });

                if (element) {
                    lookup[key] = element;
                    result.push(element);
                }

                return result;

            }, []);

            return {
                form,
                lookup
            };

        } else {
            throw new SyntaxError(`SchemaForm error: Only type "object" is allow at root level: ${schema.type}`);
        }

    }


    /**
     * Merge
     *
     * This merges the schema and the definition
     * into a single entity.
     *
     * @param {object} schema
     * @param {Array} definition
     * @returns {*[]}
     */
    static merge (schema, definition) {

        /* If definition is not an array, default to everything */
        if (_.isArray(definition) === false) { definition = ["*"]; }

        /* Get the form as the schema would have it */
        const { form, lookup } = Form.defaultForm(schema);

        const idx = definition.indexOf("*");

        if (idx >= 0) {
            /* There is a wildcard - replace with the whole schema */
            definition = definition.slice(0, idx)
                .concat(form)
                .concat(definition.slice(idx + 1));
        }

        return definition.map(obj => {

            /* If a string, assume that's the key */
            if (_.isString(obj)) {
                obj = {
                    key: obj
                };
            }

            if (obj.key) {

                const schemaDefaults = lookup[obj.key];

                if (schemaDefaults) {

                    /* Replace the obj with schemaDefault */
                    const tmp = obj;
                    obj = schemaDefaults;

                    /* Replace any definitions in the obj */
                    _.each(tmp, (value, key) => {
                        obj[key] = value;
                    });

                }

            }

            return obj;

        });


    }


}