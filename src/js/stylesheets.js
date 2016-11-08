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
            "route": "/stylesheets/:stylesheet",
            "method": "get"
        }
    }
});


// Abstract grade for styleshhet handling
fluid.defaults("trivet.app.stylesheetHandler", {
    gradeNames: "kettle.request.http",
    invokers: {
        handleRequest: {
            funcName: "trivet.app.handleStylesheet"
        },
        // This invoker should return a function that takes two arguments
        // - a file location
        // - an object containing the variables expected by the stylesheet
        // It should return the rendered stylesheet
        renderStylesheet: {
            funcName: "trivet.app.renderStylesheet",
            // stylesheetName, stylesheetVariables
            args: ["{arguments}.0", "{arguments}.1"]
        }
    },
    // Implementing grades should configure this
    stylesheetConfig: {
        location: "src/stylesheets/stylus",
        // %stylesheetName = the :stylesheet portion of the route
        stylesheetFilename: "%stylesheetName.stylus",
    }
});

trivet.app.handleStylesheet = function (request) {
        var stylesheetName = request.req.params.stylesheet;
        var stylesheetConfig = request.options.stylesheetConfig;

        var stylesheetLocation = stylesheetConfig.location + "/" + fluid.stringTemplate(stylesheetConfig.stylesheetFilename, {stylesheetName: stylesheetName});

        try {
            var renderStylesheet = request.renderStylesheet(stylesheetLocation, {request: request.req});
            request.events.onSuccess.fire(renderStylesheet);
        } catch (e) {
            request.events.onError.fire({message: "Stylesheet not found", statusCode: 404});
        }
};

trivet.app.renderStylesheet = function (stylesheetLocation, stylesheetVariables) {
    var str = require('fs').readFileSync(stylesheetLocation, 'utf8');
    return stylus.render(str);
};
