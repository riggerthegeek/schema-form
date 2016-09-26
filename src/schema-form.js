/**
 * schema-form
 *
 * Generate rich forms in your application across a wide variety of platforms
 *
 * @license MIT
 */

"use strict";


/* Node modules */
import fs from "fs";
import path from "path";


/* Third-party modules */
import {_} from "lodash";
import objectpath from "objectpath";
import {walkSync} from "walk";


/* Files */
import {defaults} from "./defaults";
import {Utils} from "./utils";


export class SchemaForm {


    constructor (templates, { engine = null } = {}) {

        if (_.isPlainObject(templates)) {
            this.setTemplates(templates);
        } else {
            this.setTemplatePath(templates);
        }

        this.setEngine(engine);

    }


    /**
     * Generate
     *
     * This generates the form HTML. It receives
     * the schema and the form as it's two
     * arguments and produces the HTML which can
     * be embedded into the template.
     *
     * If no form array is given, it will output
     * all the form elements exactly how the
     * schema defines them.
     *
     * @param {object} schema
     * @param {Array} definition
     * @returns {string}
     */
    generate (schema, definition = ["*"]) {

        const merged = SchemaForm.merge(schema, definition);

        return merged.reduce((result, form) => {

            if (!form.type) {
                return result;
            }

            const field = this._templates[form.type] || this._templates["default"];

            result += this._engine(field)({
                form
            });

            return result;

        }, "");

    }


    /**
     * Set Engine
     *
     * This sets the template compilation engine. The
     * engine should be a function that receives the
     * template string and returns a function that can
     * receive the variables that will populate the
     * template.
     *
     * If nothing is set, by default it uses the lodash
     * template method with the default options.
     *
     * @link https://lodash.com/docs#template
     * @param {function} engine
     * @returns {SchemaForm}
     */
    setEngine (engine = null) {

        if (_.isFunction(engine) === false) {
            engine = template => _.template(template);
        }

        this._engine = engine;

        return this;

    }


    /**
     * Set Template Path
     *
     * This sets the template path. It then gets
     * the templates as an object of strings which
     * are set to the templates.
     *
     * As this uses a synchronous file reader, this
     * shouldn't be used in production applications.
     * It exists primarily to help development.
     *
     * @param {string} templatePath
     * @returns {SchemaForm}
     */
    setTemplatePath (templatePath) {

        const templates = {};

        const opts = {
            listeners: {
                errors (root, nodeStatsArray) {
                    /* Throw the error out of here */
                    throw nodeStatsArray[0].error;
                },
                file (root, fileStats, next) {

                    const filePath = `${root}/${fileStats.name}`;
                    const fileName = path.parse(filePath).name;

                    templates[fileName] = fs.readFileSync(filePath, "utf8");

                    next();

                }
            }
        };

        /* Get all the files */
        walkSync(templatePath, opts);

        return this.setTemplates(templates);

    }


    /**
     * Set Templates
     *
     * Sets the templates. This will be an object
     * of strings where the key is the template
     * name.
     *
     * @param {object} templates
     * @returns {SchemaForm}
     */
    setTemplates (templates) {

        this._templates = templates;

        return this;

    }


    /**
     * Default Form
     *
     * Builds up the default form element
     *
     * @param {object} schema
     * @param {object} ignore
     * @param {object} global
     * @returns {{form: Array, lookup: {}}}
     */
    static defaultForm (schema, ignore = {}, global = {}) {

        const form = [];
        let lookup = {};

        if (Utils.stripNullType(schema.type) === "object") {

            _.each(schema.properties, (value, key) => {

                if (ignore[key] !== true) {

                    const required = schema.required && schema.required.indexOf(key) !== -1;
                    const definition = SchemaForm.defaultFormDefinition(key, value, {
                        path: [ key ],
                        lookup,
                        ignore,
                        required,
                        global
                    });

                    if (definition) {
                        form.push(definition);
                    }

                }

            });

        } else {
            throw new SyntaxError(`SchemaForm error: Only type "object" is allowed at root level: ${schema.type}`);
        }

        return {
            form,
            lookup
        };

    }


    /**
     * Default Form Definition
     *
     * Get the default form definition. This can
     * be overridden, but it's what is implicit
     * from the schema.
     *
     * @param {string} name
     * @param {object} schema
     * @param {object} options
     * @returns {object}
     */
    static defaultFormDefinition (name, schema, options) {

        /* Get the relevant rules */
        const rules = defaults[Utils.stripNullType(schema.type)];

        if (rules) {

            let def;
            for (let i = 0; i < rules.length; i++) {

                def = rules[i](name, schema, options);

                /* Search for rules */
                if (def) {

                    return def;

                }

            }

        }

    }


    /**
     * Merge
     *
     * Merges the schema and the form definition
     * into a single array of objects
     *
     * @param {object} schema
     * @param {object} form
     * @param {object} ignore
     * @param {object} options
     * @param {boolean} readonly
     * @returns {object[]}
     */
    static merge (schema, form, ignore = {}, options = {}, readonly = false) {

        const defaultForm = SchemaForm.defaultForm(schema, ignore, options);

        const allId = form.indexOf("*");
        if (allId >= 0) {
            /* We're using "*" to generate the forms */
            form = form.slice(0, allId)
                .concat(defaultForm.form)
                .concat(form.slice(allId + 1));
        }

        /* Get readonly from the root object */
        readonly = readonly || schema.readonly || schema.readOnly;

        const lookup = defaultForm.lookup;

        return form.map(obj => {

            if (_.isString(obj)) {
                obj = {
                    key: obj
                };
            }

            if (obj.key) {
                if (_.isString(obj.key)) {
                    obj.key = objectpath.parse(obj.key);
                }
            }

            // @todo obj.itemForm

            if (obj.key) {

                const strId = objectpath.stringify(obj.key);

                if (lookup[strId]) {

                    const schemaDefaults = lookup[strId];

                    _.each(schemaDefaults, (value, attr) => {
                        if (obj[attr] === void 0) {
                            obj[attr] = schemaDefaults[attr];
                        }
                    });

                }

            }

            // @todo readonly

            // @todo items

            // @todo tabs

            // @todo checkbox

            return obj;

        });

    }


}
