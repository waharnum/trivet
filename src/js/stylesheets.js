var trivet = fluid.registerNamespace("trivet");
var stylus = require('stylus');
var kettle = require('kettle');

// Abstract grade for routes expected to
// return a stylesheet
fluid.defaults("trivet.app.stylesheet", {
    gradeNames: ["kettle.app"],
    requestHandlers: {
        stylesheetHandler: {
            "type": "trivet.app.stylesheetHandler",
            "route": "/stylesheets/:template.css",
            "method": "get"
        }
    }
});


// Abstract grade for styleshhet handling
fluid.defaults("trivet.app.stylesheetHandler", {
    gradeNames: "trivet.app.templateHandler",
    invokers: {
        handleRequest: {
            funcName: "trivet.app.handleTemplate"
        },
        // This invoker should return a function that takes two arguments
        // - a file location
        // - an object containing the variables expected by the stylesheet
        // It should return the rendered stylesheet
        renderTemplate: {
            funcName: "trivet.app.renderStylesheet",
            // stylesheetName, stylesheetVariables
            args: ["{arguments}.0", "{arguments}.1"]
        }
    },
    // Implementing grades should configure this
    templateConfig: {
        location: "src/stylesheets/stylus",
        // %stylesheetName = the :stylesheet portion of the route
        templateFilename: "%templateName.stylus",
    }
});

trivet.app.renderStylesheet = function (stylesheetLocation, stylesheetVariables) {
    var str = require('fs').readFileSync(stylesheetLocation, 'utf8');
    return stylus.render(str);
};
