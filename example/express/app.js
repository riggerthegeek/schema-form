/**
 * app
 *
 * This is an example Express application using
 * Pug as the templating engine.
 */

"use strict";


/* Node modules */
import fs from 'fs';


/* Third-party modules */
import bodyParser from "body-parser";
import {compile} from "pug";
import express from "express";


/* Files */
import SchemaForm from "../../";


/* Create the express app */
const app = express()
    .set("views", `${__dirname}/views`)
    .set("view engine", "pug")
    .use(bodyParser.urlencoded({
        extended: false
    }));

/* Pretty output to make more legible */
app.locals.pretty = true;

/*
    Create the schemaForm object, telling it where
    to find and how to generate templates.

    This is a singleton out of which all other
    forms are emitted.
 */
const schemaForm = new SchemaForm(`${__dirname}/views/forms`, {
    engine: template => compile(template, {
        pretty: true
    })
});

// /*
//     The schema tells the form how the data
//     should look when submitted. It also contains
//     information about it's validation etc.
//
//     This conforms to draft V4 of the JSON schema
//     definition http://json-schema.org/latest/json-schema-core.html
//  */
// const schema = require("./schema/comment.json");

/*
    This is information on how the form will be
    generated. We can use things as-is in the
    schema (eg, name and email), override certain
    parts of it (eg, comment) or create new items
    entirely (the submit button).
 */
const definition = [
    "name",
    {
        key: "email"
    },
    {
        key: "comment",
        type: "textarea",
        placeholder: "Make a comment"
    },
    {
        type: "submit",
        title: "OK"
    }
];

/* The routes */
app.get("/", (req, res) => {
    fs.readdir(`${__dirname}/schema`, (err, files) => {
        const schemas = files.map(file => {
            return file.replace('.json', '');
        });

        res.render("home", {
            schemas
        });
    });
});

app.post("/:schema", (req, res) => {

    const schemaName = req.params.schema;

    try {
        const schema = require(`./schema/${schemaName}.json`);

        /* Create the form */
        const form = schemaForm.form(schema, definition);

        const data = req.body;

        if (form.validate(data)) {
            /* Validated the input */
            res.json({
                success: true,
                schemaName,
                data
            });
        } else {
            res.render("form", {
                form,
                schemaName
            });
        }
    } catch (err) {
        res.status(404)
            .send(`Unknown schema '${schemaName}'`);
    }

});

app.get("/:schema", (req, res) => {

    const schemaName = req.params.schema;

    try {
        const schema = require(`./schema/${schemaName}.json`);

        /* Create the form */
        const form = schemaForm.form(schema, definition);

        res.render("form", {
            form,
            schemaName
        });
    } catch (err) {
        res.status(404)
            .send(`Unknown schema '${schemaName}'`);
    }

});


app.listen(3000, () => {
    /* eslint no-console: 0 */
    console.log("Express listening on port 3000");
});
