var trivet = fluid.registerNamespace("trivet");
var pug = require('pug');
var kettle = require('kettle');

// Abstract grade for routes expected to
// return a templated result
// A "templated result" in this context means
// one produced by a combination of a referenced
// source file, a set of variables and a "render"-type
// function
//
// The produced result of this is returned as the response
//
// This abstraction therefore covers not only templates
// meant to produce HTML pages, but also CSS preprocessors,
// CoffeeScript - Javascript

fluid.defaults("trivet.app.template", {
    gradeNames: ["kettle.app"]
});

fluid.defaults("trivet.app.template.html", {
    gradeNames: ["trivet.app.template"],
    requestHandlers: {
        frontPageHandler: {
            "type": "trivet.app.frontPageHandler",
            "route": "/",
            "method": "get"
        },
        templateHandler: {
            "type": "trivet.app.templateHandler.html",
            "route": "/page/:template",
            "method": "get"
        }
    }
});

// Abstract grade for template handling
fluid.defaults("trivet.app.templateHandler", {
    gradeNames: "kettle.request.http",
    invokers: {
        handleRequest: {
            funcName: "trivet.app.handleTemplate"
        },
        // This invoker should return a function that takes two arguments
        // - a file location
        // - an object containing the variables expected by the template
        // It should return the rendered template content
        renderTemplate: "fluid.notImplemented"
    },
    // Implementing grades should configure this
    templateConfig: {
    //     location: "src/templates/pug",
    //     // %templateName = the :template portion of the route
    //     templateFilename: "%templateName.pug",
    //     templateNotFoundErrorFilename: "error.pug"
    //     this will always use the same template
    //     templateFile: "front"
    },
    listeners: {
        // Override standard onRequestError listener
        "onRequestError.handle": {
            funcName: "trivet.app.errorHandler",
            args: ["{that}.res", "{arguments}.0", "{that}"]
        }
    }
});

fluid.defaults("trivet.app.templateHandler.html", {
    gradeNames: ["trivet.app.templateHandler"]
});

// Special route handler for the front page
fluid.defaults("trivet.app.frontPageHandler", {
    gradeNames: "trivet.app.templateHandler.html",
    templateConfig: {
        templateFile: "front"
    }
});

fluid.defaults("trivet.app.templateHandler.css", {
    gradeNames: ["trivet.app.templateHandler"]
});

trivet.app.handleTemplate = function (request) {
        var templateName = request.options.templateConfig.templateFile ? request.options.templateConfig.templateFile : request.req.params.template;
        var templateConfig = request.options.templateConfig;

        var templateLocation = templateConfig.location + "/" + fluid.stringTemplate(templateConfig.templateFilename, {templateName: templateName});

        try {
            var renderedTemplate = request.renderTemplate(templateLocation, {request: request.req});
            request.events.onSuccess.fire(renderedTemplate);
        } catch (e) {
            console.log(e);
            request.events.onError.fire({message: "Template not found", statusCode: 404});
        }
};

trivet.app.errorHandler = function (res, error, request) {
    // Use the "no existing template" handler
    if(error.statusCode === 404 && error.message === "Template not found") {
        trivet.app.templateNotFoundErrorHandler (res, error, request);
    // Delegate to the usual Kettle error handler
    } else {
        kettle.request.http.errorHandler(res, error);
    }
};

trivet.app.templateNotFoundErrorHandler = function (res, error, request) {
    var templateConfig = request.options.templateConfig;

    var errorTemplateLocation = templateConfig.location + "/" + templateConfig.templateNotFoundErrorFilename;

    try {
        var renderedErrorTemplate = request.renderTemplate(errorTemplateLocation, {error: error});
        request.res.status(404).send(renderedErrorTemplate);
    } catch (e) {
        kettle.request.http.errorHandler(res, error);
    }
};

fluid.defaults("trivet.app.templateHandler.html.pug", {
    gradeNames: "trivet.app.templateHandler",
    invokers: {
        renderTemplate: {
            funcName: "trivet.app.renderPugTemplate",
            // templateLocation, templateVariables
            args: ["{arguments}.0", "{arguments}.1"]
        }
    },
    templateConfig: {
        location: "src/templates/html/pug",
        // %templateName = the :template portion of the route
        templateFilename: "%templateName.pug",
        templateNotFoundErrorFilename: "error.pug"
    }
});

trivet.app.renderPugTemplate = function (templateLocation, templateVariables) {
    var pugOptions = {cache: true, filename: templateLocation};
    var merged = Object.assign(templateVariables, pugOptions);
    return pug.renderFile(templateLocation, merged);
};
