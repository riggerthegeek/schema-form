/**
 * validation
 */

"use strict";


/* Node modules */


/* Third-party modules */


/* Files */


export const Validation = {


    formElement: form => {

        return {
            keypress: `(${Validation.validateElement.toString()}(arguments[0], ${JSON.stringify(form)}));`
        };

    },


    validateElement: (event, form) => {
        console.log(222);
        console.log(event.target.value);
        console.log(form);
    }


};
