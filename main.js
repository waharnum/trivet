var fluid = require('infusion');
var kettle = require('kettle');

var trivet = fluid.registerNamespace("trivet");

var apps = require('./src/js/apps');
// var datasources = require('./src/js/datasources');
// var middleware = require('./src/js/middleware');


fluid.defaults("trivet.server", {
    gradeNames: "fluid.component",
    components: {
        server: {
            type: "kettle.server",
            options: {
                port: 8081,
                components: {
                    template: {
                        type: "trivet.app.template.pug"
                    }
                }
            }
        }
    }
});

trivet.server();
