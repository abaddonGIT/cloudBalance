/******************************************************
 * Copyright 2013 by Abaddon <abaddongit@gmail.com>
 * @author Abaddon <abaddongit@gmail.com>
 * @version 1.0.0
 * ***************************************************/
var w = window, d = document;

var Opt = function () {
    this.config = {
        'save': '#save',
        'form': '#optionsForm',
        'step': 2,
        'success': '#success'
    };

    var config = this.config;

    this.init = function () {
        this.addEvent();
        //Востанавливаем данные после перезагрузки
        this.actions.restoreFields();
    };

    this.addEvent = function () {
        d.querySelector(config.save).addEventListener('click', opt.actions.saveOptions);
    };

    this.actions = {
        //сохраняет данные в хранилище
        saveOptions: function () {
            var form = d.querySelector(config.form), data = opt.getFields(form);
            //Прерываем событие по умолчанию
            d.querySelector(config.success).innerHTML = 'Ваши данные сохранены!';
            event.preventDefault();
        },
        //Заполняет форму на странице данными из хранилища
        restoreFields: function () {
            var data = JSON.parse(localStorage['options']), ln = null;

            if (this.fields === undefined) {
                this.fields = d.querySelector(config.form).querySelectorAll('input, select');
                ln = this.fields.length;
            } else {
                ln = this.fields.length;
            }

            while (ln--) {
                if (this.fields[ln].name === 'password') {
                    this.fields[ln].value = opt.crypt(data[this.fields[ln].name], -config.step);
                } else {
                    if (this.fields[ln].name === 'cloud') {
                        this.fields[ln].selected = true;
                    } else {
                        this.fields[ln].value = data[this.fields[ln].name] || '';
                    }
                }
            }
        }
    };

    var opt = this;
}
/*
* Сохраняем данные в хранилище
*/
Opt.prototype.getFields = function (form) {
    var fields = form.querySelectorAll('input, select'), ln = fields.length, data = {};

    Opt.fields = fields;

    while (ln--) {
        var val = fields[ln].value, name = fields[ln].name;
        if (name === 'password') {
            data[name] = this.crypt(val, this.config.step);
        } else {
            data[name] = val;
        }
    }

    localStorage['options'] = JSON.stringify(data);
};

Opt.prototype.crypt = function (text, step) {
    total = '', ln = text.length;

    for (var i = 0; i < ln; i++) {
        total += String.fromCharCode(text.charCodeAt(i) + step);
    }

    return total;
};

w.onload = function () {
    var opt = new Opt();
    opt.init();
}