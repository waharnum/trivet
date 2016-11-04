var trivet = fluid.registerNamespace("trivet");
var pug = require('pug');
var kettle = require('kettle');

// Abstract grade for routes expected to
// return a templated page
fluid.defaults("trivet.app.template", {
    gradeNames: ["kettle.app"],
    requestHandlers: {
        frontPageHandler: {
            "type": "trivet.app.frontPageHandler",
            "route": "/",
            "method": "get"
        },
        templateHandler: {
            "type": "trivet.app.templateHandler",
            "route": "/page/:template",
            "method": "get"
        }
    }
});

fluid.defaults("trivet.app.frontPageHandler", {
    gradeNames: "trivet.app.templateHandler",
    templateConfig: {
        templateFile: "front"
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
    },
    listeners: {
        // Override standard onRequestError listener
        "onRequestError.handle": {
            funcName: "trivet.app.errorHandler",
            args: ["{that}.res", "{arguments}.0", "{that}"]
        }
    }
});

trivet.app.handleTemplate = function (request) {
        var templateName = request.options.templateConfig.templateFile ? request.options.templateConfig.templateFile : request.req.params.template;
        var templateConfig = request.options.templateConfig;

        var templateLocation = templateConfig.location + "/" + fluid.stringTemplate(templateConfig.templateFilename, {templateName: templateName});

        try {
            var renderedTemplate = request.renderTemplate(templateLocation, {request: request.req});
            request.events.onSuccess.fire(renderedTemplate);
        } catch (e) {
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

fluid.defaults("trivet.app.templateHandler.pug", {
    gradeNames: "trivet.app.templateHandler",
    invokers: {
        renderTemplate: {
            funcName: "trivet.app.renderPugTemplate",
            // templateLocation, templateVariables
            args: ["{arguments}.0", "{arguments}.1"]
        }
    },
    templateConfig: {
        location: "src/templates/pug",
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
