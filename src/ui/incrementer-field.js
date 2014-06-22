define([

  'jquery'
  ,'underscore'

  ,'auto-update-textfield'

], function (

  $
  ,_

  ,AutoUpdateTextFieldView

) {

  var $win = $(window);
  var FLOATING_POINT_PRECISION = 6;

  return AutoUpdateTextFieldView.extend({

    'events': _.extend({
      'mousewheel': 'onMousewheel'
      ,'focus': 'onFocus'
    }, AutoUpdateTextFieldView.prototype.events)

    ,'increment': 10

    ,'initialize': function (opts) {
      AutoUpdateTextFieldView.prototype.initialize.call(this, opts);
    }

    ,'tweakVal': function (tweakAmount) {
      /* jshint maxlen: 150 */
      // Have to do weird number munging here to prevent IEEE 754 floating
      // point issues:
      // http://stackoverflow.com/questions/8503157/ieee-754-floating-point-arithmetic-rounding-error-in-c-sharp-and-javascript
      var parsedNumber = parseFloat(this.$el.val());
      var precisionRestrictedNumber = +(
          parsedNumber + tweakAmount).toPrecision(FLOATING_POINT_PRECISION);
      this.$el.val(precisionRestrictedNumber);
      this.onValReenter(precisionRestrictedNumber);
    }

    /**
     * @param {jQuery.Event} evt
     * @param {number} delta
     * @param {number} deltaX
     * @param {number} deltaY
     */
    ,'onMousewheel': function (evt, delta, deltaX, deltaY) {
      evt.preventDefault();
      this.tweakVal(-deltaY);
    }

    ,'onArrowUp': function () {
      this.tweakVal(this.increment);
    }

    ,'onArrowDown': function () {
      this.tweakVal(-this.increment);
    }

    ,'onFocus': function () {
      this.mousewheelHandler = _.bind(this.onMousewheel, this);
      $win.on('mousewheel', this.mousewheelHandler);
      $win.one('click', _.bind(this.freeMousewheel, this));
    }

    ,'onBlur': function () {
      AutoUpdateTextFieldView.prototype.onBlur.apply(this, arguments);
      this.freeMousewheel();
    }

    ,'freeMousewheel': function () {
      if (this.mousewheelHandler) {
        $win.off('mousewheel', this.mousewheelHandler);
        this.mousewheelHandler = null;
      }
    }

    ,'tearDown': function () {
      AutoUpdateTextFieldView.prototype.tearDown.call(this);
    }

  });

});
