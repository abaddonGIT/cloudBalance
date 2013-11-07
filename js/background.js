/******************************************************
 * Copyright 2013 by Abaddon <abaddongit@gmail.com>
 * @author Abaddon <abaddongit@gmail.com>
 * @version 1.0.0
 * ***************************************************/
var w = window;
var Balance = function () {
    this.config = {
        1: {
            request: 'https://support.selectel.ru/api/login',
            balanceUrl: 'https://support.selectel.ru/api/balance',
            notificationOpt: {
                type: "basic",
                title: "",
                message: "",
                iconUrl: "../img/clouds_128.png"
            }
        },
        step: 2
    }

    var config = this.config;

    this.init = function () {
        if (localStorage['options'] !== undefined) {
            this.data = JSON.parse(localStorage['options']);
            //отправляем запрос
            this.getCookies();
        }
    }
    //авторизация на облаке
    this.getCookies = function () {
        var xhr = new XMLHttpRequest(), data = this.data;
        link = config[data.cloud]['request'];

        xhr.open('POST', link, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onload = function (e) {
            if (this.status == 200) {
                var response = JSON.parse(this.response);
                if (response.status === "ok") {//Если авторизация прошла то запускаем ф-ю опроса баланса
                    bal.getBalance(); //Сразу выводим оповещение
                    setInterval(bal.getBalance, bal.data.frequency*1000);
                }
            }
        }
        xhr.send('login=' + data.contract + '&password=' + bal.crypt(data.password, -config.step));
    }

    this.getBalance = function () {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', config[bal.data.cloud]['balanceUrl'], true);
        xhr.onload = function (e) {
            if (this.status == 200) {
                var response = JSON.parse(this.response);
                if (response.status === "ok") {
                    var allSum = parseInt(response.balance, 10) / 100, cloudBal = parseInt(response.cloud.balance) / 100;

                    if (cloudBal < bal.data.price) {//Если ниже заданного порога врубаем уведомления
                        config[bal.data.cloud]['notificationOpt'].message = "Ваш баланс " + allSum + ' руб. Баланс облака ' + cloudBal + ' руб. Предпологаемый расход на день ' + response.cloud.predict + ' руб.';
                        config[bal.data.cloud]['notificationOpt'].title = bal.data.title || "Ваш баланс на Selectel ниже установленного уровня"

                        chrome.notifications.getAll(function (notifications) {
                            if (notifications.balance) {
                                chrome.notifications.clear('balance', function (wasCleared) {
                                    chrome.notifications.create('balance', config[bal.data.cloud]['notificationOpt'], function () { });
                                });
                            } else {
                                chrome.notifications.create('balance', config[bal.data.cloud]['notificationOpt'], function () { });
                            }
                        });
                    }
                }
            }
        }
        xhr.send();
    };

    var bal = this;
}

Balance.prototype.crypt = function (text, step) {
    total = '', ln = text.length;

    for (var i = 0; i < ln; i++) {
        total += String.fromCharCode(text.charCodeAt(i) + step);
    }

    return total;
};

window.onload = function () {
    var balance = new Balance();
    balance.init();
}