function validateNumber(value) {
    let innerValue = Number(value);
    return !isNaN(innerValue) ? true : false;
}
const Scrollbar = {
    template: `          
        <div class="questsScrollbar" @click="onMouseMove">
            <div class="questsScrollbar__thumb" ref="thumb" :style="setPosition" @mousedown="onMouseDown"></div>
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
            return (this.containerHeight - this.thumbHeight) / this.max;
        },
        setPosition() {
            return `top:${Math.round(
                this.oneDivision * this.innerValue + this.thumbHeight / 2
            )}px`;
        },
    },
    methods: {
        initRange() {
            let { height, y } = this.$el.getBoundingClientRect();
            [this.containerHeight, this.containerY] = [height, y];
            this.thumbHeight = this.$refs.thumb.getBoundingClientRect().height;
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
        Array.from(this.$el.children).forEach((element) => {
            element.ondragstart = () => false;
        });
        window.addEventListener("resize", this.initRange);
        this.initRange();
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.initRange);
    },
};

const NavigationGroup = {
    template: `
        <div 
            class="questsNavigationGroup" 
            :class="{active}"
        >
            <div 
                class="questsNavigationGroup-header"
                @click="openItem" 
            >
                <p>{{ group.name }}</p>
                <img src="../img/quests/questsNavigationItem-header__icon.svg" alt="Icon">
            </div>
            <div 
                class="questsNavigationGroup-main__wrapper"
                ref="main"
            >
                <div class="questsNavigationGroup-main">
                    <div class="questsNavigationGroup-main__list-wrapper">
                        <div class="questsNavigationGroup-main__list">
                            <div class="questsNavigationGroupItem" 
                                v-for="quest in group.quests"
                                :key="quest.id"
                                :class="'status' + quest.status"
                                @click="setActiveQuest(quest)"
                            >
                                <div class="questsNavigationGroupItem-content">
                                    <p>{{ quest.name }}</p>
                                    <p>{{ quest.npc }}</p>
                                </div>
                                <img src="../img/quests/questsNavigationGroupItem-icon.svg" alt="Icon">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    props: {
        active: {
            type: Boolean,
            required: true,
        },
        group: {
            type: Object,
            required: true,
        },
    },
    methods: {
        openItem() {
            this.$emit("open", this.group);
        },
        setActiveQuest(quest) {
            this.$emit("activate", this.group, quest);
        },
    },
    mounted() {
        this.mainElement = this.$refs.main;
        this.mainElement.addEventListener("transitioned", () => {
            if (this.height === "0px") {
                this.height === "auto";
            }
        });
        this.mainElement.style.height = this.active ? "auto" : "0px";
    },
    watch: {
        active: function (value) {
            if (value) {
                this.mainElement.style.height = `${this.mainElement.scrollHeight}px`;
            } else {
                this.mainElement.style.height = `${this.mainElement.scrollHeight}px`;
                window
                    .getComputedStyle(this.mainElement, null)
                    .getPropertyValue("height");
                this.mainElement.style.height = 0;
            }
        },
    },
};

const QuestMain = {
    template: `
    <div class="questsMain">
        <div class="questsMain-title__wrapper">
            <div class="questsMain-title">
                <p>Информация о квесте</p>
                <p>{{ quest.type }}</p>
            </div>
        </div>
        <div class="questsMain-main__wrapper">
            <div class="questsMain-main">
                <div class="questsMain-content">
                    <div class="questsMain-content__wrapper" ref="content">
                        <div class="questsMain-content__wrapper-title">
                            <p>Название квеста</p>
                            <p>{{ quest.name }}</p>
                        </div>
                        <div class="questsMain-content__text">
                            <p v-for="line in quest.description">{{ line }}</p>
                        </div>
                        <div class="questsMain-tasks">
                            <div class="questsMain-tasks__item" v-for="task in quest.tasks" :class="{active: task.active}">
                                <div class="questsMain-tasks__item-checkbox"></div>
                                <p>{{ task.text }}</p>
                            </div>
                        </div>
                    </div>
                    <scrollbar 
                        v-if="isScrollBarActive" 
                        :max="scrollHeight" 
                        :model-value="currentScroll" 
                        @input="onInput"
                    >
                    </scrollbar>
                </div>
                <div class="questsMain-rewards">
                    <p>Награды</p>
                    <div class="questsMain-rewards__list">
                        <div class="questsMain-rewards__list-item" v-for="reward in quest.rewards">
                            <img :src="'./img/inventory/items/'+reward.img" alt="Reward" />
                            <p v-if="reward.count > 0">x{{ reward.count }}</p>
                        </div>  
                    </div>
                </div>
            </div>
        </div>
        <div class="questsMain-buttons">
            <div @click="quests.sendEvent('takePrize')" :class="['questsMain-buttons__item', { green: quest.status == 1 }, { gray: quest.status != 1 }]">
                <div class="questsMain-buttons__item-main">
                    <div class="questsMain-buttons__item-background">
                        <p>Enter</p>
                    </div>
                </div>
                <p>Завершить</p>
            </div>
            <div @click="quests.setState(false)" class="questsMain-buttons__item yellow">
                <div class="questsMain-buttons__item-main">
                    <div class="questsMain-buttons__item-background">
                        <p>Esc</p>
                    </div>
                </div>
                <p>Отменить</p>
            </div>
        </div>
    </div>
    `,
    components: {
        Scrollbar,
    },
    props: {
        quest: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            offsetHeight: 0,
            scrollHeight: 0,
            currentScroll: 0,
        };
    },
    computed: {
        isScrollBarActive() {
            return this.offsetHeight != this.scrollHeight && this.scrollHeight != 0;
        },
    },
    methods: {
        onInput(value) {
            this.currentScroll = value;
            this.$refs.content.scrollTop = value;
        },
        onMouseWheel(e) {
            this.$refs.content.scrollTop =
                this.$refs.content.scrollTop +
                ((e.deltaY / 10) * this.scrollHeight) / this.offsetHeight;
            this.currentScroll = this.$refs.content.scrollTop;
        },
        updateScrollbar(state) {
            if (state) {
                setTimeout(() => {
                    if (this.$refs.content) {
                        [this.offsetHeight, this.scrollHeight] = [
                            this.$refs.content.offsetHeight,
                            this.$refs.content.scrollHeight - this.$refs.content.offsetHeight,
                        ];
                        this.$refs.content.addEventListener("wheel", this.onMouseWheel);
                    }
                }, 0);
            } else {
                if (this.$refs.content)
                    this.$refs.content.removeEventListener("wheel", this.onMouseWheel);
            }
        },
    },
    mounted() {
        this.updateScrollbar(true);
    },
    beforeUnmount() {
        this.updateScrollbar(false);
    },
};

const quests = new Vue({
    el: "#quests",
    components: {
        NavigationGroup,
        QuestMain,
    },
    data() {
        return {
            appActive: false,
            questGroups: {},
            activeGroup: null,
            groupBlock: false,
            activeQuest: null,
        };
    },
    methods: {
        isGroupActive(group) {
            return group == this.activeGroup;
        },
        setActiveGroup(group) {
            if (!this.isGroupActive(group) && !this.groupBlock) {
                this.activeGroup = group;
                this.groupBlock = true;
                setTimeout(() => {
                    this.groupBlock = false;
                }, 500);
            }
        },
        setActiveQuest(group, quest) {
            if (this.activeQuest !== quest) {
                quest.key = `${group.id}_${quest.id}`;
                this.activeQuest = quest;
            }
        },
        setState(state) {
            mp.trigger("blur", state, 50);
            if (state) busy.add("questList", true, true);
            else busy.remove("questList", true);

            this.appActive = state;
        },
        setData(data) {
            //this.questGroups = JSON.parse(data);
            this.questGroups = data;
            this.activeGroup = this.questGroups[0];
            this.activeQuest = this.questGroups[0].quests[0];
        },
        sendEvent(name) {
            if (this.activeQuest.status != 1) return;
            const response = JSON.stringify({ id: this.activeQuest.id, name: name});
            mp.trigger(`quest.cef.callbacks`, response);
            this.setState(false);
        }
    },
    mounted() {
        let self = this;
        window.addEventListener('keyup', e => {
            if (!busy.includes("questList")) return;
            if (e.key == 'Escape' && self.appActive) self.setState(false);
            else if (e.key == 'Enter' && self.appActive) self.sendEvent('takePrize');
        });
    }
})

//quests.setData(questGroups);
