"use strict";
/// Документ по работе с БД, не подключает игнорируемые модули
const Sequelize = require('sequelize');
const fs = require("fs");
const path = require('path');
global.Op = Sequelize.Op;

module.exports = {
    sequelize: null,
    Models: {},
    /// Подключение к БД
    connect: function (callback) {
        console.log("[DATABASE] db connect...");
        setTimeout(() => {
            this.sequelize = new Sequelize(mp.config.dbName, mp.config.dbUser, mp.config.dbPassword, {
                host: mp.config.dbHost,
                dialect: 'mysql',
                port: mp.config.dbPort || 3306,
                logging: false,
                pool: {
                    max: 100,
                    min: 2,
                    idle: 10000
                },
            });
            this.loadModels();
            callback();
        }, 5000);
    },
    /// Загрузка моделей таблиц из папки 'db' в каждом из модулей, кроме игнорируемого
    loadModels: function () {
        console.log("[DATABASE] load models...");
        fs.readdirSync(path.dirname(__dirname)).forEach(dir => {
            if (dir != 'base' && !ignoreModules.includes(dir) && fs.existsSync(path.join(path.dirname(__dirname), dir, 'db'))) {
                console.log(`[DATABASE] --${dir}`);
                fs.readdirSync(path.join(path.dirname(__dirname), dir, 'db')).forEach(file => {
                    console.log(`[DATABASE] -----${file}`);
                    const model = require(path.join(path.dirname(__dirname), dir, 'db', file))(this.sequelize, Sequelize.DataTypes);
                    this.Models[model.name] = model;
                });
            }
        });
        for (var name in this.Models) {
            var model = this.Models[name];
            if (model.associate) model.associate(this.Models);
        }
        this.sequelize.sync();
        console.log("[DATABASE] models loaded.");
    }
};