const dialogs = new Vue({
  el: "#dialogs",
  data() {
    return {
      activeApp: false,
      dialog: {},
      blockButton: false,
    };
  },
  computed: {
    activeDialog() {
      return this.dialog || {};
    },
    activeButtons() {
      return this.activeDialog.options || [];
    },
    getKey() {
      return JSON.stringify(this.activeDialog);
    },
    isActive() {
      return Object.keys(this.activeDialog).length != 0;
    },
  },
  methods: {
    setState(state) { 
      //mp.trigger("blur", state, 50);
      if (state) busy.add("dialogs", true, true);
      else busy.remove("dialogs", true);

      this.activeApp = state;
      this.blockButton = false;
    },
    onKeyDown(e) {
      if (e.keyCode == 27) {
        try {
          this.setState(false);
          mp.trigger("quest.npc.dialog.callback", 'close');
        } catch {}
      }
      let keyCode = e.keyCode - 48;
      if (keyCode >= 1 && keyCode <= this.activeButtons.length) {
        let option = this.activeButtons[keyCode - 1];
        this.setAnswer(option);
      }
    },
    setAnswer(option) {
      if (!this.blockButton) {
        try {
          this.blockButton = true;
          if (option.id == 0) return mp.trigger("quest.npc.dialog.callback", 'close');
          mp.trigger("quest.npc.dialog.callback", 'quest', option.id);
        } catch {}
      }
    },
    setDialog(dialog) {
      dialog = JSON.parse(dialog);
      this.dialog = dialog;
    },
    onAfterEnter() {
      this.blockButton = false;
    },
  },
  created() {
    window.addEventListener("keyup", this.onKeyDown);
  },
  beforeUnmount() {
    window.removeEventListener("keyup", this.onKeyDown);
  },
})