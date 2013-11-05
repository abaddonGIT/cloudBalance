var w = window;

console.log(localStorage['options']);

var Balance = function () {
    this.config = {
        1: {
            request: 'https://support.selectel.ru/'
        },
        step: 2
    }

    var config = this.config;

    this.init = function () {
        this.data = JSON.parse(localStorage['options']);
        //отправляем запрос
        this.getCookies();
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
        xhr.send('action_method=GET&user=' + data.contract + '&pass=' + bal.crypt(data.password, -config.step) + '&tn=f4bf4096fe73518ba2a886609f507e7ff5fb4179');
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