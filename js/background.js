/******************************************************
 * Copyright 2013 by Abaddon <abaddongit@gmail.com>
 * @author Abaddon <abaddongit@gmail.com>
 * @version 1.0.0
 * ***************************************************/
var w = window;
var Balance = function () {
    this.config = {
        1: {
            request: 'https://support.selectel.ru/api/login'
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
                console.log(this.response);
            }
        }
        xhr.send('login=' + data.contract + '&password=' + bal.crypt(data.password, -config.step));
    }

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