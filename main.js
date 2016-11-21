var fluid = require('infusion');
var kettle = require('kettle');

var trivet = fluid.registerNamespace("trivet");

var templates = require('./src/js/templates');
var stylesheets = require('./src/js/stylesheets');
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
                    html: {
                        type: "trivet.app.template.html"
                    },
                    stylesheets: {
                        type: "trivet.app.template.css"
                    }
                }
            }
        },
    },

    distributeOptions: [{
        // Configure the HTML template handlers to use pug via options distribution
        record: "trivet.app.templateHandler.html.pug",
        target: "{/ trivet.app.templateHandler.html}.options.gradeNames"
    },{
        // Configure the CSS template handlers to use stylus via options distribution
        record: "trivet.app.templateHandler.css.stylus",
        target: "{/ trivet.app.templateHandler.css}.options.gradeNames"
    }]
});

trivet.server();
