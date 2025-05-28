
const classes = ["green", "blue", "orange"];
const coinName = 'KNIGHT'; // название донат валюты

const result = {
  template: `
  <transition name="modal-fade">
    <div class="modal-backdrop" role="dialog">
      <div class="result" ref="result">
        <header class="modal-header">
          <slot name="header">
            <h2>Поздравляем!</h2>
          </slot>
        </header>

        <section class="modal-body">
          <div><slot name="body"></slot></div>
          <div class="body-img" :style="{'background-image': 'url(img/cases/' + winitem.img + '.png)'}"></div>
          <div class="body-name">{{ winitem.name }}</div>
        </section>

        <footer class="modal-footer">
          <slot name="footer">
            <button type="button" class="btn btn-green" @click="choose(true)">
              Оставить
            </button>
            <button type="button" class="btn btn-blue" @click="choose(false)">
              Продать за {{ winitem.sellPrice }} ${coinName}
            </button>
          </slot>
        </footer>
      </div>
    </div>
  </transition>`,
  props: ["winitem"],
  methods: {
    choose(save) {
      roulette.closeModal();
      mp.trigger("callRemote", "cases.choose", save);
    }
  }
};

const roulette = new Vue({
  el: "#roulette",
  components: {
    result: result,
  },
  data: {
      appActive: false,
      items: [
		{
            img: 52,
        },
		{
            img: 85,
        },
		{
            img: 107,
        },
		{
            img: "nero",
        },
		{
            img: "premier",
        },
		{
            img: 6,
        },
		{
            img: 7,
        },
		{
            img: 8,
        },
		{
            img: 9,
        },
		{
            img: 10,
        },
				{
            img: 52,
        },
		{
            img: 85,
        },
		{
            img: 107,
        },
		{
            img: "nero",
        },
		{
            img: "premier",
        },
		{
            img: 6,
        },
		{
            img: 7,
        },
		{
            img: 8,
        },
		{
            img: 9,
        },
		{
            img: 10,
        },
				{
            img: 52,
        },
		{
            img: 85,
        },
		{
            img: 107,
        },
		{
            img: "nero",
        },
		{
            img: "premier",
        },
		{
            img: 6,
        },
		{
            img: 7,
        },
		{
            img: 8,
        },
		{
            img: 9,
        },
		{
            img: 10,
        },
	  ],
      winItem: {},
      caseName: "TEST",
      caseCost: 20000,
      fastMode: false,
      wheelCss: {},
      spinning: false,
      isModalVisible: false,
  },
  methods: {
    setState(state) {
      mp.trigger("blur", state, 100);
      if (state) busy.add("roulette", true, true);
      else busy.remove("roulette", true);

      this.appActive = state;
    },
    setData(name, cost, data) {
      if (typeof data == 'string') data = JSON.parse(data);
      this.items = data.sort(() => Math.random() - 0.5);

      this.caseName = name;
      this.caseCost = cost;

      this.items.forEach((val, idx) => {
        val.class = classes[data[idx].class - 1];
      });
    },
    changeMode() {
      this.fastMode = !this.fastMode;
    },
    openCase() {
      mp.trigger("callRemote", "cases.open");
    },
    closeCase() {
      mp.trigger("callRemote", "cases.close");
    },
    getCostString() {
      return `${this.caseCost} ${coinName}`;
    },
    spinWheel(roll) {
      if (this.spinning) return;
      
      this.spinning = true;
      this.items.sort(() => Math.random() - 0.5);
      this.winItem = this.items.find(x => x.id == roll);

      const position = this.items.findIndex(x => x.id == roll) + (this.items.length / 2) + 0.5;
      const widthCard = 150;
      const rows = 12;
      const card = widthCard + 3 * 2;
      let landingPosition = (rows * this.items.length * card) + (position * card);
        
      const randomize = Math.floor(Math.random() * widthCard) - (widthCard/2);
      landingPosition = landingPosition + randomize;
        
      const object = {
        x: Math.floor(Math.random() * 50) / 100,
        y: Math.floor(Math.random() * 20) / 100
      };

      this.wheelCss = {
        "transition-timing-function": `cubic-bezier(0, ${object.x}, ${object.y}, 1)`,
        "transition-duration": `${this.getTime()}s`,
        "transform": `translate3d(-${landingPosition}px, 0px, 0px)`
      }

      setTimeout(() => {
        this.endSpin(-(position * card + randomize));
      }, this.getTime() * 1000);
    },
    endSpin(resetTo) {
      this.wheelCss = {
        "transition-timing-function": ``,
        "transition-duration": ``,
        "transform": `translate3d(${resetTo}px, 0px, 0px)`
      }
      this.spinning = false;
      this.isModalVisible = true;
    },
    getTime() {
      return this.fastMode ? 1 : 6;
    },
    closeModal() {
      this.isModalVisible = false;
    }
  }
});