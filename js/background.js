/******************************************************
 * Copyright 2013 by Abaddon <abaddongit@gmail.com>
 * @author Abaddon <abaddongit@gmail.com>
 * @version 1.0.0
 * **************************************************/
var Balancer = function (strategy) {
    this.strategy = strategy;
};

Balancer.prototype.start = function () {
    return this.strategy.init();
};
//Что-то типа абстрактного класса
var GetBalanceStrategy = function () {};
//Методы используемые с стратегиях

//Запуск
GetBalanceStrategy.prototype.init = function () {
    this.messagesText = {
        balance: {
            title: "Ваш баланс на Selectel ниже установленного уровня",
            message: "Ваш баланс {{b.allSum}} руб. Баланс облака {{b.cloudBal}} руб. Предпологаемый расход на день {{b.predict}} руб."
        },
        warning: {
            title: "Произошла ошибка!!!",
            message: "Перед использованием необходимо заполнить информацию в настройках!"
        }
    };
    //Вытаскиваем данные из хранилща
    if (localStorage['options'] !== undefined) {
        var data = JSON.parse(localStorage['options']);
        this.authCloud(data);
    } else {
        this.showMessage({
            type: "basic",
            title: this.messagesText.warning.title,
            message: this.messagesText.warning.message,
            iconUrl: "../img/warning_128.png"
        }, 'error', 'warning');
    }
};
//Авторизация в облаке
GetBalanceStrategy.prototype.authCloud = function (data) {};
//запрос баланса
GetBalanceStrategy.prototype.getCloudInfo = function (data) {};

GetBalanceStrategy.prototype.crypt = function (text, step) {
    total = '', ln = text.length;
    for (var i = 0; i < ln; i++) {
        total += String.fromCharCode(text.charCodeAt(i) + step);
    }
    return total;
};
//шабланизаторик
GetBalanceStrategy.prototype.parseTpl = function (obj, template) {
    var str = "", f;

    str = "var out='" + template.replace(/\{\{([\s\S]+?)\}\}/g, function (m, code) {
        return "' + (" + unescape(code) + ") + '";
    }) + "'; return out;";

    f = new Function('b', str);
    return f(obj);
};
//создание оповещения
GetBalanceStrategy.prototype.showMessage = function (config, ikonText, name) {
    chrome.browserAction.setBadgeText({ "text": ikonText + '' });

    chrome.notifications.getAll(function (notifications) {
        if (notifications[name]) {
            chrome.notifications.clear(name, function (wasCleared) {
                chrome.notifications.create(name, config, function () { });
            });
        } else {
            chrome.notifications.create(name, config, function () { });
        }
    });
};

//Описываем стратегии для разных сервисов

//Для Selectel
var GetBalanceStategyFromSelectel = function () {
    this.config = {
        request: 'https://support.selectel.ru/api/login',
        balanceUrl: 'https://support.selectel.ru/api/balance',
        notificationOpt: {
            type: "basic",
            title: "",
            message: "",
            iconUrl: "../img/warning_128.png"
        },
        step: 2
    };
    var config = this.config, gb = this;
    //Авторизация для селектела
    this.authCloud = function (data) {
        var xhr = new XMLHttpRequest();
        link = config['request'];

        xhr.open('POST', link, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onload = function (e) {
            if (this.status == 200) {
                var response = JSON.parse(this.response);
                if (response.status === "ok") {//Если авторизация прошла то запускаем ф-ю опроса баланса
                    //Запрашиваем информацию и выводим оповещение
                    gb.getCloudInfo(data);
                    setInterval(function () {
                        gb.getCloudInfo(data);
                    }, data.frequency * 1000);
                }
            }
        }
        xhr.send('login=' + data.contract + '&password=' + this.crypt(data.password, -config.step));
    };

    this.getCloudInfo = function (data) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', config['balanceUrl'], true);
        xhr.onload = function (e) {
            if (this.status == 200) {
                var response = JSON.parse(this.response);
                if (response.status === "ok") {
                    var allSum = parseInt(response.balance, 10) / 100, cloudBal = parseInt(response.cloud.balance) / 100;

                    if (cloudBal < data.price) {//Если ниже заданного порога врубаем уведомления
                        config['notificationOpt'].message = gb.parseTpl({ 'allSum': allSum, 'cloudBal': cloudBal, 'predict': response.cloud.predict }, gb.messagesText.balance.message);
                        config['notificationOpt'].title = data.title || gb.messagesText.balance.title;
                        //выводим оповещения
                        gb.showMessage(config['notificationOpt'], cloudBal, 'balance');
                    } else {
                        chrome.browserAction.setBadgeText({ "text": cloudBal + '' });
                    }
                }
            }
        }
        xhr.send();
    }
};
GetBalanceStategyFromSelectel.prototype = Object.create(GetBalanceStrategy.prototype);

//Для Linode
GetBalanceStrategyFromLinode = function () {
    console.log('Тут для Linode');
};
GetBalanceStrategyFromLinode.prototype = Object.create(GetBalanceStrategy.prototype);

window.onload = function () {
    var typeCloud = localStorage['options'];

    if (typeCloud !== undefined) {
        typeCloud = JSON.parse(typeCloud);

        switch (parseInt(typeCloud.cloud)) {
            case 1:
                var balance = new Balancer(new GetBalanceStategyFromSelectel());
                balance.start();
                break;
            case 2:
                var balance = new Balancer(new GetBalanceStrategyFromLinode());
                balance.start();
            default:
                throw ("Не указан тип облака!");
        }
    } else {
        throw ("Не сохраненны настройки");
    }
}