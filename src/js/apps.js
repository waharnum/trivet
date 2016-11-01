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
        // This invoker should return a function that takes an object
        // containing the variables expected by the template, and returns a
        // rendered template
        getTemplateFunction: "fluid.notImplemented"
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
            var templateFunction = request.getTemplateFunction(templateLocation);
            request.events.onSuccess.fire(templateFunction({request: request.req}));
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
    var errorTemplateFunction = request.getTemplateFunction("src/templates/pug/error.pug");
    request.res.status(404).send(errorTemplateFunction({error: error}));
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
        getTemplateFunction: {
            funcName: "trivet.app.getPugTemplateFunction",
            args: "{arguments}.0"
        }
    },
    templateConfig: {
        location: "src/templates/pug",
        // %templateName = the :template portion of the route
        templateFilename: "%templateName.pug"
    }
});

trivet.app.getPugTemplateFunction = function (templateLocation) {
    return pug.compileFile(templateLocation);
};
