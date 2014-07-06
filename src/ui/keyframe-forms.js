define([

  'underscore'
  ,'backbone'

  ,'src/ui/keyframe-form'

], function (

  _
  ,Backbone

  ,KeyframeFormView

) {

  return Backbone.View.extend({

    'events': {
      'click .add button': 'createKeyframe'
    }

    ,'initialize': function (opts) {
      _.extend(this, opts);
      this.keyframeForms = {};
      this.$formsList = this.$el.find('ul.controls');
      this.listenTo(this.model, 'change', _.bind(this.render, this));
    }

    ,'render': function () {
      this.$formsList.children().detach();

      var orderedViews = _.sortBy(this.keyframeForms, function (keyframeForm) {
        return keyframeForm.model.get('millisecond');
      });

      _.each(orderedViews, function (keyframeFormView) {
        this.$formsList.append(keyframeFormView.$el);
      }, this);
    }

    ,'addKeyframeView': function (model) {
      var keyframeFormView = new KeyframeFormView({
        'owner': this
        ,'model': model
      });

      // NOTE: This is more than an alias; the number must be stored in this
      // closure because it is removed in keyframeFormView's teardown method
      // before the event handler below evaluates it.
      var keyframeFormViewCid = keyframeFormView.cid;
      this.keyframeForms[keyframeFormViewCid] = keyframeFormView;

      this.listenTo(model, 'destroy', _.bind(function () {
        delete this.keyframeForms[keyframeFormViewCid];
      }, this));

      this.$formsList.append(keyframeFormView.$el);
    }

    ,'createKeyframe': function (evt) {
      this.model.appendNewKeyframeWithDefaultProperties();
    }

  });
});
