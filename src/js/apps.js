var trivet = fluid.registerNamespace("trivet");
var pug = require('pug');
var kettle = require('kettle');

// Abstract grade for routes expected to
// return a templated page
fluid.defaults("trivet.app.template", {
    gradeNames: "kettle.app",
    requestHandlers: {
        templateHandler: {
            "type": "trivet.app.templateHandler",
            "route": "/page/:template",
            "method": "get"
        }
    },
    distributeOptions: {
        source: "{that}.options.precompiledTemplates",
        target: "{/ trivet.app.templateHandler}.options.precompiledTemplates"
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
            templateNotFoundErrorFilename: "error"
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
        var templateName = request.req.params.template;
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
    try {
        var renderedErrorTemplate = request.renderTemplate("src/templates/pug/error.pug", {error: error});
        request.res.status(404).send(renderedErrorTemplate);
    } catch (e) {
        kettle.request.http.errorHandler(res, error);
    }
};

fluid.defaults("trivet.app.template.pug", {
    gradeNames: "trivet.app.template",
    requestHandlers: {
        templateHandler: {
            "type": "trivet.app.templateHandler.pug",
        }
    }
});

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
        templateFilename: "%templateName.pug"
    }
});

trivet.app.renderPugTemplate = function (templateLocation, templateVariables) {
    var pugOptions = {cache: true, filename: templateLocation};
    var merged = Object.assign(templateVariables, pugOptions);
    return pug.renderFile(templateLocation, merged);
};
