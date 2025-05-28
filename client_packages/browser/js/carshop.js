var carShop = new Vue({
	el: '#carShop',
	data: {
		show: false,
		searchQuery: '',
		header: 'CHAOS AUTOS',
		subtitle: 'SHOWROOM',
        selectedCar: null,
        cars: [],
	},
    computed: {
        filteredCars() {
            const query = this.searchQuery.toLowerCase();
            return this.cars.filter(car =>
                car.properties.name.toLowerCase().includes(query)
            );
        },
        carStats() {
            if (!this.selectedCar) return {};
            const { fuel, capacity, speed, braking, handling, acceleration } = this.selectedCar;
            return {
                fuel: {
                    label: 'Бак',
                    display: `${fuel} л.`,
                    progress: (fuel / 100) * 100
                },
                capacity: {
                    label: 'Вместительность',
                    display: `${capacity} кг.`,
                    progress: (capacity / 100) * 100
                },
                speed: {
                    label: 'Скорость',
                    display: `${speed} км/ч`,
                    progress: (speed / 400) * 100
                },
                braking: {
                    label: 'Торможение',
                    display: `${braking}%`,
                    progress: braking
                },
                handling: {
                    label: 'Управляемость',
                    display: `${handling}%`,
                    progress: handling
                },
                acceleration: {
                    label: 'Ускорение',
                    display: `${acceleration}%`,
                    progress: acceleration
                }
            };
        }
    },
    methods: {
        selectCar(car) {
            this.selectedCar = car;
            mp.trigger('carshow.vehicle.show', this.cars.indexOf(car));
        },
		hide() {
			mp.trigger(`carshow.list.close`);
		},
		purchaseCar() {
			if (this.selectedCar) {
				mp.events.callRemote('carshow.car.buy', this.selectedCar.sqlId, this.primary, this.secondary);
			}
		},
		testDrive() {

		},
	},
})
