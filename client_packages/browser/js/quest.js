function validateNumber(value) {
  let innerValue = Number(value);
  return !isNaN(innerValue) ? true : false;
}
const scrollbar = {
  template: `          
  <div class="quest-scrollbar" @click="onMouseMove">
    <div class="quest-scrollbar__thumb" ref="thumb" :style="setPosition" @mousedown="onMouseDown"></div>
  </div>`,
  props: {
    max: {
      type: [Number, String],
      default: 100,
      validator: validateNumber,
    },
    modelValue: {
      type: [Number, String],
      default: 0,
      validator: validateNumber,
    },
  },
  data() {
    return {
      containerHeight: 0,
      thumbHeight: 0,
    };
  },
  computed: {
    innerValue() {
      return Number(this.modelValue) <= 0
        ? 0
        : Number(this.modelValue) >= this.max
        ? this.max
        : Number(this.modelValue);
    },
    oneDivision() {
      return ((this.containerHeight - this.thumbHeight) / this.max);
    },
    setPosition() {
      return `top:${Math.round(this.oneDivision * this.innerValue + this.thumbHeight / 2)}px`;
    },
  },
  methods: {
    initRange() {
      let { height, y } = this.$el ? this.$el.getBoundingClientRect() : 0;
      [this.containerHeight, this.containerY] = [height, y];
      this.thumbHeight = this.$refs ? this.$refs.thumb.getBoundingClientRect().height : 0;
    },
    onMouseDown() {
      this.initRange();
      window.addEventListener("mousemove", this.onMouseMove);
      window.addEventListener("mouseup", this.onMouseUp);
    },
    onMouseUp() {
      window.removeEventListener("mousemove", this.onMouseMove);
      window.removeEventListener("mouseup", this.onMouseUp);
    },
    onMouseMove(e) {
      let currentTop =
        e.clientY - this.containerY - this.thumbHeight / 2 <= 0
          ? 0
          : e.clientY - this.containerY - this.thumbHeight / 2 >=
            this.containerHeight - this.thumbHeight
          ? this.containerHeight - this.thumbHeight
          : e.clientY - this.containerY - this.thumbHeight / 2;
      let newValue = Math.round(currentTop / this.oneDivision);
      if (newValue !== this.innerValue) {
        this.$emit("input", newValue);
      }
    },
  },
  mounted() {
    Array.from(this.$el.children).forEach((element) => { element.ondragstart = () => false; });
    window.addEventListener("resize", this.initRange);
    this.initRange();
  },
  unmounted() {
    window.removeEventListener("resize", this.initRange);
  },
}


const quest = new Vue({
  el: "#quest",
  components: {
    scrollbar,
  },
  data() {
    return {
      appActive: false,
      offsetHeight: 0,
      scrollHeight: 0,
      currentScroll: 0,
      quest: {}
    };
  },
  computed: {
    isScrollBarActive() {
      return this.offsetHeight != this.scrollHeight && this.scrollHeight!=0;
    },
  },
  methods: {
    onInput(value) {
      this.currentScroll = value;
      this.$refs.content.scrollTop = value;
    },
    onMouseWheel(e) {
      this.$refs.content.scrollTop = this.$refs.content.scrollTop + e.deltaY / 10 * this.scrollHeight / this.offsetHeight;
      this.currentScroll = this.$refs.content.scrollTop;
    },
    setState(state) {
      mp.trigger("blur", state, 50);
      if (state) busy.add("quest", true, true);
      else busy.remove("quest", true);

      if(this.appActive != state) {
        this.appActive = state;
        if(state) {
          setTimeout(() => {
            [this.offsetHeight, this.scrollHeight] = [this.$refs.content.offsetHeight, this.$refs.content.scrollHeight - this.$refs.content.offsetHeight];
            this.$refs.content.addEventListener("wheel", this.onMouseWheel);
          }, 0);
        } else {
          this.$refs.content.removeEventListener("wheel", this.onMouseWheel);
        }
      }
    },
    setQuestData(data) {
      data = JSON.parse(data);
      this.quest = data;
    },
    sendEvent(name) {
      if (this.quest.active) return; // просмотр квеста в списке активных квестов
      const response = JSON.stringify({ id: this.quest.id, name: name});
      mp.trigger(`quest.cef.callbacks`, response);
    }
  },
  mounted() {
    let self = this;
    window.addEventListener('keyup', e => {
      if (busy.includes(["auth", "chat", "terminal", "interaction", "mapCase", "phone", "playerMenu", "inputWindow", "fishing.game", "playersList", "bugTracker"])) return;
      if (e.key == 'Enter' && self.appActive) self.sendEvent('accept');
      else if (e.key == 'Escape' && self.appActive) self.sendEvent('cancel');
    });
  }
})