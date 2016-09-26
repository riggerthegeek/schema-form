/**
 * select
 */

"use strict";


/* Node modules */


/* Third-party modules */
import {stringify} from "objectpath";


/* Files */
import {Utils} from "../utils";


export const select = (name, schema, options) => {

    if (Utils.stripNullType(schema.type) === "string" && schema.enum) {

        const form = Utils.stdFormObject(name, schema, options);

        form.key = options.path;
        form.type = "select";
        options.lookup[stringify(options.path)] = form;

        return form;

    }

};
