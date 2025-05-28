var main = new Vue({
  el: '#main',
  data: {
    show: false,
	groupname: 'Эконом',
	group: 0,
	actualprice: 0,
  },
  methods: {
	accept() {
		mp.trigger('conts.spawn.car', this.group, this.actualprice);		
	},
    decline() {
	},
  }
});