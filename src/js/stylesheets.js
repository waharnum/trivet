var trivet = fluid.registerNamespace("trivet");
var stylus = require('stylus');
var kettle = require('kettle');

// Abstract grade for routes expected to
// return a stylesheet

fluid.defaults("trivet.app.template.css", {
    gradeNames: ["trivet.app.template"],
    requestHandlers: {
        stylesheetHandler: {
            "type": "trivet.app.templateHandler.css",
            "route": "/stylesheets/:template.css",
            "method": "get"
        }
    }
});


// Abstract grade for styleshhet handling
fluid.defaults("trivet.app.templateHandler.css.stylus", {
    gradeNames: ["trivet.app.templateHandler.css"],
    invokers: {
        renderTemplate: {
            funcName: "trivet.app.renderStylesheet",
            // stylesheetName, stylesheetVariables
            args: ["{arguments}.0", "{arguments}.1"]
        }
    },
    // Implementing grades should configure this
    templateConfig: {
        location: "src/templates/css/stylus",
        // %stylesheetName = the :stylesheet portion of the route
        templateFilename: "%templateName.stylus",
    }
});

trivet.app.renderStylesheet = function (stylesheetLocation, stylesheetVariables) {
    var str = require('fs').readFileSync(stylesheetLocation, 'utf8');
    return stylus.render(str);
};
