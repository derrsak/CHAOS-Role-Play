var load = new Vue({
    el: "#load",
    data: {
        show: true,
    },
    methods: {
        hide: function() {
            setTimeout(function() {
                this.show = false;
				mp.trigger('client.intro.start');
            }.bind(this), 40000);
        }
    },
    mounted: function() {
        this.hide();
    }
});

