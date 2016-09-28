/**
 * element
 *
 * An element is an individual form input
 * field
 */

"use strict";


/* Node modules */


/* Third-party modules */
import {_} from "lodash";


/* Files */


export class Element {


    constructor (data = {}) {

        this.description = data.description;
        this.key = data.key;
        this.maximum = data.maximum;
        this.maxLength = data.maxLength;
        this.minimum = data.minimum;
        this.minLength = data.minLength;
        this.readonly = data.readonly || false;
        this.required = data.required || false;
        this.title = data.title;

    }


    static defaults (rule) {

        const rules = {
            string: [
                Element.select,
                Element.text
            ]
        };

        return rules[rule];

    }


    static text (name, schema, options) {

        if (schema.type === "string" && !schema.enum) {

            const obj = Element.toElement(name, schema, options);

            obj.type = "text";

            return obj;

        }

    }


    static select (name, schema, options) {

        if (schema.type === "string" && schema.enum) {

            const obj = Element.toElement(name, schema, options);

            obj.type = "select";

            return obj;

        }

    }


    /**
     * By Element Rule
     *
     * Builds the schema into a form element
     * using the best-guess of how it should
     * look.
     *
     * @param {string} name
     * @param {object} schema
     * @param {object} options
     * @returns {Element}
     */
    static byElementRule (name, schema, options) {

        const rules = Element.defaults(schema.type);

        if (rules) {

            /* Search for the first valid rule */
            let element;
            let i = 0;
            do {
                element = rules[i](name, schema, options);
                i++;
            } while(element === void 0 && i < rules.length);

            return element;

        }

    }


    /**
     * To Element
     *
     * Combines everything together and creates
     * an Element instance
     *
     * @param {string} name
     * @param {object} schema
     * @param {object} options
     * @returns {Element}
     */
    static toElement (name, schema, options) {

        const element = {};

        /* Set any default values */
        if (_.has(options, ["global", "formDefaults"])) {
            _.each(options.global.formDefaults, (value, key) => {
                element[key] = _.cloneDeep(value);
            });
        }

        /* Set the values */
        element.description = schema.description || void 0;
        element.key = name;
        element.maximum = schema.maximum - (schema.exclusiveMaximum ? 1 : 0) || void 0;
        element.maxLength = schema.maxLength || void 0;
        element.minimum = schema.minimum + (schema.exclusiveMinimum ? 1 : 0) || void 0;
        element.minLength = schema.minLength || void 0;
        element.readonly = (schema.readonly === true | schema.readOnly === true) ? true : false;
        element.required = (options.required === true | schema.required === true) ? true : false;
        element.title = schema.title || name;

        return new Element(element);
    }


}
