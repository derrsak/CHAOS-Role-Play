var notifications = new Vue({
	el: '#notifications',
	data: {
		messages: [
			// { type: 'warning', message: 'Вы будете забанены забанены', hash: 12 },
			// { type: 'info', message: 'Скоро произайдет оплата бизнеса', hash: 142 },
			// {
			// 	type: 'success',
			// 	img: 'success',
			// 	message: 'Вы были посланы нахуй',
			// 	hash: 123,
			// },
			// {
			// 	type: 'error',
			// 	img: 'error',
			// 	message: 'Вы не оплатили налог 100$',
			// 	hash: 122,
			// },
		],
		// Время показа уведомления
		showTime: 4000,
		// Макс. кол-во уведомлений на экране
		maxCount: 3, // set #notifications .notif-box:nth-last-child in notifications.css
		count: 0, //Для уникального ключа.
	},

	methods: {
		push(type, message) {
			if (message == 'undefined' || message == 'null') message = null
			this.messages.push({
				type: type,
				img: type.split(' ').length > 1 ? type.split(' ')[1] : type,
				message: message,
				hash: ++this.count,
				timer: null,
			})

			if (this.messages.length > this.maxCount) {
				let message = this.messages.shift()
				clearTimeout(message.timer)
			}
			var self = this
			this.messages[this.messages.length - 1].timer = setTimeout(() => {
				self.messages.shift()
				/*clearTimeout(message.timer);*/
			}, this.showTime)
		},
		info(message) {
			this.push(`info`, message)
		},
		warning(message) {
			this.push(`warning`, message)
		},
		success(message) {
			this.push(`success`, message)
		},
		error(message) {
			this.push(`error`, message)
		},
		addCash(message) {
			this.push(`add cash`, message)
		},
		removeCash(message) {
			this.push(`remove cash`, message)
		},
		addMoney(message) {
			this.push(`add money`, message)
		},
		removeMoney(message) {
			this.push(`remove money`, message)
		},
	},
})

// for tests
//function PushPullNotif() {
//	notifications.push("error", "зачисление + $500" + notifications.count);
//}
