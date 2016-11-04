var fluid = require('infusion');
var kettle = require('kettle');

var trivet = fluid.registerNamespace("trivet");

var apps = require('./src/js/apps');
// var datasources = require('./src/js/datasources');
// var middleware = require('./src/js/middleware');


fluid.defaults("trivet.server", {
    gradeNames: ["fluid.component", "fluid.resolveRoot"],
    components: {
        server: {
            type: "kettle.server",
            options: {
                port: 8081,
                components: {
                    template: {
                        type: "trivet.app.template"
                    }
                }
            }
        },
    },
    // Configure the template handlers to use pug via options distribution
    distributeOptions: {
        record: "trivet.app.templateHandler.pug",
        target: "{/ trivet.app.templateHandler}.options.gradeNames"
    }
});

trivet.server();
