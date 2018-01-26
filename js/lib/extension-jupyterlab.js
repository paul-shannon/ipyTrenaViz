var extension = require('./index');
var base = require('@jupyter-widgets/base');

/**
 * Register the widget.
 */

module.exports = {
  id: 'trenaviz',
  requires: [base.IJupyterWidgetRegistry],
  activate: function(app, widgets) {
      widgets.registerWidget({
          name: 'trenaviz',
          version: extension.version,
          exports: extension
      });
  },
  autoStart: true
};
