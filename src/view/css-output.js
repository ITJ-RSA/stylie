define([

  'jquery'
  ,'underscore'
  ,'backbone'

  ,'src/app'
  ,'src/constants'

], function (

  $
  ,_
  ,Backbone

  ,app
  ,constant

) {

  var checkboxToVendorMap = {
    'moz': 'mozilla'
    ,'ms': 'microsoft'
    ,'o': 'opera'
    ,'webkit': 'webkit'
    ,'w3': 'w3'
  };

  function getPrefixList (app) {
    var prefixList = [];
    _.each(app.config.activeClasses, function (isActive, vendorName) {
      if (isActive) {
        prefixList.push(checkboxToVendorMap[vendorName]);
      }
    });

    return prefixList;
  }

  return Backbone.View.extend({

    'events': { }

    ,'initialize': function (opts) {
      _.extend(this, opts);
      this.$trigger.on('click', _.bind(this.onTriggerClick, this));
      this.$actorEl = $('#rekapi-canvas .rekapi-actor');

      Backbone.on(constant.UPDATE_CSS_OUTPUT, _.bind(this.renderCSS, this));
    }

    ,'onTriggerClick': function (evt) {
      this.renderCSS();
    }

    ,'renderCSS': function () {
      var cssClassName = app.view.cssNameField.$el.val();

      var keyframeCollection =
          app.collection.actors.getCurrent().keyframeCollection;
      var firstKeyframe = keyframeCollection.first();
      var offsets = this.isOutputOrientedToFirstKeyframe()
          ? {'x': -firstKeyframe.get('x'), 'y': -firstKeyframe.get('y')}
          : {'x': 0, 'y': 0};
      keyframeCollection.offsetKeyframes(offsets);

      var cssOutput = app.rekapi.renderer.toString({
        'vendors': getPrefixList(app)
        ,'name': cssClassName
        ,'iterations': app.$el.animationIteration.val()
        ,'isCentered': app.config.isCenteredToPath
        ,'fps': app.view.fpsSlider.getFPS()
      });

      // Reverse the offset
      _.each(offsets, function (offsetValue, offsetName) {
        offsets[offsetName] = -offsetValue;
      });
      keyframeCollection.offsetKeyframes(offsets);

      this.$el.val(cssOutput);
    }

    /**
     * @return {boolean}
     */
    ,'isOutputOrientedToFirstKeyframe': function () {
      return app.view.orientationView.getOrientation() === 'first-keyframe';
    }
  });
});
