"use strict";

let weather = {};
weather.isSet = false;

const request = require("request");
const WEATHER_LOADING = true; // Загрузка погоды с сайта
const REQUEST_TIME = 30 * 60 * 1000; // Время повторного запроса в случае ошибки (в мс)
const API_KEY = "fa4c95101b894d5e983163727230104"; // ключ с weatherapi.com
const COUNT_GET_DAYS = 2; // кол-во дней в прогнозе
const COUNT_GET_DATA = 24;
const DEFAULT_SUMMARY = "Ясно";
const DEFAULT_TEMPERATURE = 20;
const DEFAULT_ICON = "clear-day";
const DEFAULT_CODE = "1000";

let weatherForecast = [];
let customTemperature;

let snowWeatherIsSet = false;

let timer = call('timer');
let utils = call('utils');

let weatherConfig = {
    "1000": "EXTRASUNNY",
    "1003": "CLEAR",
    "1006": "CLOUDS",
    "1009": "OVERCAST",
    "1030": "SMOG",
    "1063": "RAIN",
    "1066": "SNOW",
    "1069": "RAIN",
    "1072": "SNOWLIGHT",
    "1087": "THUNDER",
    "1114": "OVERCAST",
    "1117": "SNOW",
    "1135": "FOGGY",
    "1147": "FOGGY",
    "1150": "RAIN",
    "1153": "RAIN",
    "1168": "RAIN",
    "1171": "SNOW",
    "1180": "RAIN",
    "1183": "RAIN",
    "1186": "RAIN",
    "1189": "RAIN",
    "1192": "RAIN",
    "1195": "RAIN",
    "1195": "RAIN",
    "1201": "RAIN",
    "1201": "RAIN",
    "1204": "RAIN",
    "1207": "RAIN",
    "1210": "SNOW",
    "1213": "SNOW",
    "1216": "SNOW",
    "1219": "SNOW",
    "1222": "SNOW",
    "1225": "SNOW",
    "1237": "RAIN",
    "1240": "RAIN",
    "1243": "RAIN",
    "1246": "THUNDER",
    "1249": "SNOW",
    "1252": "SNOW",
    "1255": "SNOW",
    "1258": "SNOW",
    "1261": "RAIN",
    "1264": "RAIN",
    "1273": "THUNDER",
    "1276": "THUNDER",
    "1279": "THUNDER",
    "1282": "THUNDER"
}

module.exports = {
    customWeather: false,
    customWeatherType: 'winter',
    getCurrentWeather() {
        let current = {};
        if (!weather.current) {
            current.summary = DEFAULT_SUMMARY;
            current.temperature = DEFAULT_TEMPERATURE;
            current.icon = DEFAULT_ICON;
        } else {
            Object.assign(current, weather.current);
        }
        if (customTemperature != null) {
            current.temperature = customTemperature;
        }
        return current;
    },

    init() {
        if (WEATHER_LOADING) {
            this.requestWeather();
        } else {
            this.setWeather();
        }
    },
    requestWeather() {
        request(
            `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=34,-118&lang=ru&days=${COUNT_GET_DAYS}`,
            { json: true },
            (err, res, body) => {
                if (err) {
                    this.repeatWeatherRequest();
                    return console.log(`[WEATHER] ERROR - ${err}`);
                }

                if (body.error) {
                    this.repeatWeatherRequest();
                    return console.log(`[WEATHER] ERROR REQUEST: ${body.error.message}`);
                }

                try {
                    for (let day = 0; day < COUNT_GET_DAYS; day++) {
                        for (let i = 0; i < COUNT_GET_DATA; i++) {
                            const forecast = body.forecast.forecastday[day].hour[i];
                            const tzTime = new Date(forecast.time);
                            weatherForecast.push({
                                day: tzTime.getDate(),
                                time: tzTime.getHours(),
                                summary: forecast.condition.text,
                                code: forecast.condition.code,
                                icon: forecast.condition.icon,
                                temperature: forecast.temp_c
                            });
                        }
                    }
                } catch (err) {
                    console.log(`[WEATHER] ERROR CATCH - ${err}`);
                    this.repeatWeatherRequest();
                    return;
                }

                console.log("[WEATHER] Данные о погоде загружены с api.weatherapi.com");
                if (!weather.isSet) {
                    this.setWeather();
                }
            }
        );
    },

    repeatWeatherRequest() {
        if (!weather.isSet) {
            this.setWeather();
        }
        console.log(`[WEATHER] Ошибка загрузки данных о погоде. Повторный запрос через ${REQUEST_TIME / (60 * 1000)} минут...`);
        timer.add(this.requestWeather, REQUEST_TIME);
    },

    getForecastDataByHour(hours, day) {
        if (this.customWeather) return this.generateCustomWeather(hours);
        let currentWeather = {};

        if (weatherForecast.length == 0) {
            console.log("[WEATHER] Данных о погоде нет, запрашиваем стандартные данные");
            currentWeather.summary = DEFAULT_SUMMARY;
            currentWeather.temperature = DEFAULT_TEMPERATURE;
            currentWeather.icon = DEFAULT_ICON;
            currentWeather.code = DEFAULT_CODE;
            return currentWeather;
        }
        for (let i = 0; i < weatherForecast.length; i++) {
            if (weatherForecast[i].time == hours && weatherForecast[i].day == day) {
                currentWeather.summary = weatherForecast[i].summary;
                currentWeather.temperature = weatherForecast[i].temperature;
                currentWeather.icon = weatherForecast[i].icon;
                currentWeather.code = weatherForecast[i].code;
                return currentWeather;
            }
        }
        return null
    },
    setWeather() {
        weather.isSet = true;
        let now = new Date();

        weather.current = this.getForecastDataByHour(now.getHours(), now.getDate());
        if (weather.current == null) return console.log("[WEATHER] Ошибка получения данных с сайта погоды");
        console.log(`[WEATHER] Погода на этот час: ${JSON.stringify(weather.current)}`);

        const gameWeather = this.getGameWeatherByCode(weather.current.code);
        mp.world.weather = gameWeather;

        if (gameWeather == "SNOW" && !snowWeatherIsSet) snowWeatherIsSet = true;
        if (gameWeather == "SMOG") weather.current.icon = 'cloudy';

        let forecast = {};
        Object.assign(forecast, weather.current);
        if (customTemperature != null) forecast.temperature = customTemperature;
        mp.players.forEach((currentPlayer) => {
            currentPlayer.call('weather.info.update', [forecast]);
        });

        timer.add(() => {
            try {
                this.setWeather();
            } catch (err) {
                console.log(err)
            }
        }, (60 - now.getMinutes()) * 60 * 1000);


        console.log(`[WEATHER] Следующее обновление погоды через ${60 - now.getMinutes()} минут`);
    },
    setCustomTemperature(temp) {
        customTemperature = temp;
        mp.players.forEach((currentPlayer) => {
            currentPlayer.call('weather.info.update', [this.getCurrentWeather()]);
        });
    },
    resetCustomTemperature() {
        customTemperature = null;
        mp.players.forEach((currentPlayer) => {
            currentPlayer.call('weather.info.update', [this.getCurrentWeather()]);
        });
    },
    getGameWeatherByCode(code) {
        let weather = weatherConfig[code];
        if (!weather) return 'SMOG';
        return weather;
    },
    generateCustomWeather(hours) {
        let weather = {};
        switch (this.customWeatherType) {
            case 'winter':
            weather.summary = 'Снег';
            if (hours > 6 && hours < 23) {
                weather.temperature = utils.randomInteger(-10, -5);
            } else {
                weather.temperature = utils.randomInteger(-15, -10);
            }
            weather.icon = 'snow';
            return weather;
        }
    }
}
