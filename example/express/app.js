/**
 * app
 *
 * This is an example Express application using
 * Pug as the templating engine.
 */

"use strict";


/* Node modules */


/* Third-party modules */
import express from "express";


/* Files */
import {SchemaForm} from "../../";


/* Create the express app */
const app = express()
    .set("views", `${__dirname}/views`)
    .set("view engine", "pug");

/* Create the form object - this is common information to all forms */
const form = new SchemaForm(`${__dirname}/views/forms`);

/* The main route */
app.get("/", (req, res) => {

    /*
        The schema tells the form how the data
        should look when submitted. It also contains
        information about it's validation etc.

        This conforms to draft V4 of the JSON schema
        definition http://json-schema.org/latest/json-schema-core.html
     */
    const schema = {
        type: "object",
        title: "Comment",
        properties: {
            name:  {
                title: "Name",
                type: "string"
            },
            email:  {
                title: "Email",
                type: "string",
                pattern: "^\\S+@\\S+$",
                description: "Email will be used for evil."
            },
            comment: {
                title: "Comment",
                type: "string",
                maxLength: 20,
                validationMessage: "Don't be greedy!"
            }
        },
        required: [
            "name",
            "email",
            "comment"
        ]
    };

    /*
        This is information on how the form will be
        generated. We can use things as-is in the
        schema (eg, name and email), override certain
        parts of it (eg, comment) or create new items
        entirely (the submit button).
     */
    const definition = [
        "name",
        "email",
        {
            "key": "comment",
            "type": "textarea",
            "placeholder": "Make a comment"
        },
        {
            "type": "submit",
            "title": "OK"
        }
    ];

    res.render("home", {
        definition,
        form,
        schema
    });

});


app.listen(3000, () => {
    console.log("Express listening on port 3000");
});
