/**
 * schema-form
 *
 * Generate rich forms in your application across
 * a wide variety of platforms.
 *
 * This is the factory that exists to build your
 * form instances. This will typically invoked only
 * once per application, likely when you are in the
 * config phase of your application. This tells
 * the generator what templates to use and how to
 * compile them. It also has a factory to create
 * the individual forms.
 *
 * @license MIT
 */

"use strict";


/* Node modules */
import fs from "fs";
import path from "path";


/* Third-party modules */
import {_} from "lodash";
import {walkSync} from "walk";


/* Files */
import {Form} from "./form";


class SchemaForm {


    constructor (templates, { engine = null } = {}) {

        if (_.isPlainObject(templates)) {
            this.setTemplates(templates);
        } else {
            this.setTemplatePath(templates);
        }

        this.setEngine(engine);

    }


    /**
     * Form
     *
     * A factory method to create a Builder
     * instance. This is how we build an
     * individual form.
     *
     * @param {object} schema
     * @param {Array} definition
     * @returns {Form}
     */
    form (schema, definition = null) {

        return new Form(schema, definition, {
            engine: this._engine,
            templates: this._templates
        });

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

        /* Now we have them, set the templates */
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


}


/* Expose on module.exports for maximum compatibility */
module.exports = SchemaForm;
