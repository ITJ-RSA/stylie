define([

  'underscore'
  ,'backbone'
  ,'mustache'

  ,'text!../templates/transform-string.mustache'

], function (

  _
  ,Backbone
  ,Mustache

  ,transformStringTemplate

) {
  'use strict';

  var NUMBER_PROPERTIES = [
    'millisecond'
    ,'x'
    ,'y'
    ,'scale'
    ,'rotationX'
    ,'rotationY'
    ,'rotationZ'
  ];

  var KeyframePropertyModel = Backbone.Model.extend({
    defaults: {
      millisecond: 0
      ,x: 0
      ,y: 0
      ,scale: 1
      ,rotationX: 0
      ,rotationY: 0
      ,rotationZ: 0
      ,easing_x: 'linear'
      ,easing_y: 'linear'
      ,easing_scale: 'linear'
      ,easing_rotationX: 'linear'
      ,easing_rotationY: 'linear'
      ,easing_rotationZ: 'linear'
    }

    ,initialize: function () {
      this.keyframeProperty = null;

      this.on('change', this.onChange.bind(this));
    }

    ,onChange: function () {
      this.updateRawKeyframeProperty();
    }

    /**
     * @return {string}
     */
    ,getValue: function () {
      return Mustache.render(
        // Strip out any newlines
        transformStringTemplate.replace(/\n/g,''), this.toJSON());
    }

    /**
     * @return {string}
     */
    ,getEasing: function () {
      var attributes = this.attributes;

      return [
        attributes.easing_x
        ,attributes.easing_y
        ,attributes.easing_scale
        ,attributes.easing_rotationX
        ,attributes.easing_rotationY
        ,attributes.easing_rotationZ
      ].join(' ');
    }

    /**
     * @param {Object} attributes
     * @return {Error=}
     */
    ,validate: function (attributes) {
      var invalidFields = _.filter(NUMBER_PROPERTIES,
          function (numberProperty) {
        return isNaN(attributes[numberProperty]);
      });

      var millisecond = attributes.millisecond;

      if (
        // If the millisecond is changing
        this.attributes.millisecond !== millisecond &&

        // And millisecond is not already invalid
        !_.contains(invalidFields, 'millisecond') &&

        // And the keyframe already exists or is negative
        (
          this.collection.findWhere({ millisecond: millisecond }) ||
          millisecond < 0
        )

      ) {
        invalidFields.push('millisecond');
      }

      if (invalidFields.length) {
        return new Error(
          'Invalid KeyframePropertyModel values|' +
          JSON.stringify(invalidFields));
      }
    }

    /**
     * @param {Rekapi.KeyframeProperty} keyframeProperty
     */
    ,bindToRawKeyframeProperty: function (keyframeProperty) {
      this.keyframeProperty = keyframeProperty;
    }

    ,updateRawKeyframeProperty: function () {
      // It is necessary to go through actor.modifyKeyframe here so that the
      // timelineModified Rekapi event fires.
      //
      // TODO: In Rekapi, make it so that KeyframeProperty#modifyWith can fire
      // this event.
      this.keyframeProperty.actor.modifyKeyframe(this.attributes.millisecond, {
        transform: this.getValue()
      }, {
        transform: this.getEasing()
      });
    }
  });

  return KeyframePropertyModel;
});