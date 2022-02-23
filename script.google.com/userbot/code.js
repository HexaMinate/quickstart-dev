class Telegram {
    constructor(token, is_userbot = false) {
        this.token = token;
        this.is_userbot = is_userbot;
        this.url = "https://telegram-rest.herokuapp.com"
    }

    request(method, parameters = {}, is_form = false) {
        if (!this.token) {
            throw {
                "message": 'Bot Token is required'
            };
        }
        if (!method) {
            throw {
                "message": 'Method is required'
            };
        }
        var options = {
            'method': 'post',
            'contentType': 'application/json'
        };
        if (typeof parameters != "object") {
            parameters = {};
        }
        if (this.is_userbot) {
            parameters["is_userbot"] = true;
            if (typeof parameters["reply_markup"] == "object") {
                delete parameters["reply_markup"];
            }
        }
        parameters["token"] = this.token;
        options['payload'] = JSON.stringify(parameters);
        if (is_form) {
            options = { 'method': 'post' };
            options['payload'] = parameters;
        }
        var url = `${this.url}/${method}`;
        var response = UrlFetchApp.fetch(url, options);
        if (response.getResponseCode() == 200) {
            return JSON.parse(response.getContentText());
        }
        return false;
    }

    loginUser(phone_number) {
        var options = {
            'method': 'post',
            'contentType': 'application/json'
        };
        options['payload'] = JSON.stringify(
            {
                "phone_number": phone_number
            }
        );
        var url = `${this.url}/userlogin`;
        var response = UrlFetchApp.fetch(url, options);
        if (response.getResponseCode() == 200) {
            return JSON.parse(response.getContentText());

        }
        return false;
    }

}

class Minidb {
    constructor(type = "user") {
        if (RegExp("^user$", "i").exec(type)) {
            this.db = PropertiesService.getUserProperties();
        } else if (RegExp("^script$", "i").exec(type)) {
            this.db = PropertiesService.getScriptProperties();
        } else if (RegExp("^document$", "i").exec(type)) {
            this.db = PropertiesService.getDocumentProperties();
        }
    }
    getValue(key) {
        try {
            return this.db.getProperty(key)
        } catch (e) {
            return false;
        }
    }
    getValues() {
        return this.db.getProperties();
    }
    setValue(key, data) {
        return this.db.setProperty(key, data);
    }
    setValues(data) {
        return this.db.setProperties(data)
    }
    delete(key) {
        try {
            return this.db.deleteProperty(key);
        } catch (e) {
            return false;
        }
    }
    deletes() {
        return this.db.deleteAllProperties();
    }
}

var db = new Minidb();

var token_bot = "";
var token_user = "";
var urlApi = "";

var tg = new Telegram(db.getValue("token_bot"));
var tg_user = new Telegram(db.getValue("token_user"));

function setWebhook() {
    var tg = new Telegram(token_bot);
    var json = {
        "token_bot": token_bot,
        "token_user": "",
        "is_userbot": false
    };
    var data = Utilities.base64Encode(JSON.stringify(json));
    var url = urlApi + data;
    var option = {
        "url": url
    };
    var data = tg.request("setWebhook", option);
    console.log(data);
}

function doGet() {
    return ContentService.createTextOutput("hello");
}

function doPost(e) {
    if (e["postData"]["type"] == "application/json" && e["parameters"] && e["parameters"]["token"] && e["parameters"]["token"].length > 0) {
        var update = false;
        try {
            update = JSON.parse(e["postData"]["contents"]);
        } catch (e) {
            return true;
        }
        var parse = false
        try {
            parse = JSON.parse(Utilities.newBlob(Utilities.base64Decode(e["parameters"]["token"][0])).getDataAsString());
        } catch (e) {
            return true;
        }
        if (parse["is_userbot"]) {
            var tg = new Telegram(parse["token_user"], true);
        } else {
            var tg = new Telegram(parse["token_bot"]);
        }

        if (typeof update == "object") {

            if (typeof update["callback_query"] == "object") {
                var cb = update["callback_query"];
                var cbm = cb["message"];
                var isText = cbm["text"] ?? "";
                var cbm_caption = cbm["caption"] ?? "";
                var user_id = cb["from"]["id"];
                var chat_id = cbm["chat"]["id"];
                var chat_type = String(cbm["chat"]["type"]).replace(RegExp("super", "i"), "");
                var chat_title = cbm["chat"]["title"] ?? "";
                var chat_username = (cbm["chat"]["username"]) ? `@${cbm["chat"]["username"]}` : "";
                var msg_id = cbm["message_id"];
                var text = cb["data"];
                var fromId = cb["from"]["id"];
                var fromFname = cb["from"]["first_name"];
                var fromLname = cb["from"]["last_name"] ?? "";
                var fromFullName = `${fromFname} ${fromLname}`;
                var fromUsername = (cb["from"]["username"]) ? `@${cb["from"]["username"]}` : "";
                var fromLanguagecode = cb["from"]["language_code"] ?? "id";
                var mentionFromMarkdown = `[${fromFullName}](tg://user?id=${user_id})`;
                var mentionFromHtml = `<a href='tg://user?id=${user_id}'>${fromFullName}</a>`;
                var sub_data = text.replace(/(.*:|=.*)/ig, "");
                var sub_id = text.replace(/(.*=|\-.*)/ig, "");
                var sub_sub_data = text.replace(/(.*\-)/ig, "");
                var key = { "chat": { "id": chat_id } };
                var key_bot = { "chat": { "id": id_bot } };

                if (text == "login") {

                    var option = {
                        "chat_id": chat_id,
                        "message_id": msg_id,
                        "parse_mode": "html"
                    };
                    db.setValue(`key:${chat_id}`, JSON.stringify({
                        "state": {
                            "type": "phone_number",
                            "user_id": user_id
                        }
                    }));
                    option["text"] = "Silahkan kirim pesan berupa text nomor ponsel kalian\ndi awali dari 628xxxxxxxx";
                    return tg.request("editMessageText", option);
                }


            }

            if (typeof update["message"] == "object") {
                var msg = update["message"];
                var text = msg["text"] ?? "";
                var caption = msg["caption"] ?? "";
                var is_outgoing = msg["outgoing"] ?? false;
                var msgr = msg["reply_to_message"] ?? false;
                var user_id = msg["from"]["id"];
                var chat_id = msg["chat"]["id"];
                var chat_type = String(msg["chat"]["type"]).replace(RegExp("super", "i"), "");
                var chat_title = msg["chat"]["title"] ?? "";
                var chat_username = (msg["chat"]["username"]) ? `@${msg["chat"]["username"]}` : "";
                var msg_id = msg["message_id"];
                var fromId = msg["from"]["id"];
                var fromFname = msg["from"]["first_name"];
                var fromLname = msg["from"]["last_name"] ?? "";
                var fromFullName = `${fromFname} ${fromLname}`;
                var fromUsername = (msg["from"]["username"]) ? `@${msg["from"]["username"]}` : "";
                var fromLanguagecode = msg["from"]["language_code"] ?? "id";
                var mentionFromMarkdown = `[${fromFullName}](tg://user?id=${user_id})`;
                var mentionFromHtml = `<a href='tg://user?id=${user_id}'>${fromFullName}</a>`;
                var key = { "chat": { "id": chat_id } };
                var key_bot = { "chat": { "id": id_bot } };

                if (text) {

                    if (RegExp("^/start$", "i").exec(text)) {
                        return tg.request("sendMessage", {
                            "chat_id": chat_id,
                            "text": "Hay perkenalkan saya adalah bot",
                            "reply_markup": {
                                "inline_keyboard": [
                                    [
                                        {
                                            "text": "Login Userbot",
                                            "callback_data": "login"
                                        }
                                    ]
                                ]
                            }
                        });
                    }

                }

                var getValue = false;
                try {
                    getValue = JSON.parse(db.getValue(`key:${chat_id}`));
                } catch (e) {

                }

                if (typeof getValue == "object" && typeof getValue["state"] == "object" && getValue["state"]["user_id"] == user_id) {
                    switch (getValue["state"]["type"]) {
                        case "phone_number":
                            if (!text) {
                                return tg.request("sendMessage", {
                                    "chat_id": chat_id,
                                    "text": "Tolong kirim pesan dalam bentuk teks\nexample\n628xxxxxxx",
                                });
                            }
                            if (RegExp("^[0-9]+$", "i").exec(text)) {
                                return tg.request("sendMessage", {
                                    "chat_id": chat_id,
                                    "text": "Tolong kirim pesan dalam bentuk teks\nexample\n628xxxxxxx",
                                });
                            }
                            try {
                                var loginUser = tg.loginUser(text);
                                getValue["state"]["user_id"] = user_id;
                                getValue["state"]["type"] = "code";
                                getValue["state"]["token_user"] = loginUser["result"]["token"];
                                db.setValue(`key:${chat_id}`, JSON.stringify(getValue));
                                db.setValue("token_user", loginUser["result"]["token"]);
                                var message = `Succes send code`;
                                message += `\nToken: ${loginUser["result"]["token"]}`;
                                message += `\nTolong kirim code kesini ya`;
                                return tg.request("sendMessage", {
                                    "chat_id": chat_id,
                                    "text": message,
                                });
                            } catch (e) {
                                return tg.request("sendMessage", {
                                    "chat_id": chat_id,
                                    "text": JSON.stringify(e.message),
                                });
                            }
                        case "code":
                            if (!text) {
                                return tg.request("sendMessage", {
                                    "chat_id": chat_id,
                                    "text": "Tolong kirim pesan dalam bentuk teks\nexample\n12345",
                                });
                            }
                            if (String(text).length != 5) {
                                return tg.request("sendMessage", {
                                    "chat_id": chat_id,
                                    "text": "Tolong kirim pesan dalam bentuk teks nomor min panjang 5",
                                });
                            }
                            if (RegExp("^[0-9]+$", "i").exec(text)) {
                                return tg.request("sendMessage", {
                                    "chat_id": chat_id,
                                    "text": "Tolong kirim pesan dalam bentuk teks nomor\nexample\n12345",
                                });
                            }
                            try {
                                var authCode = tg_user.request("authCode", {
                                    "code": text
                                });

                                if (authCode["result"]["authorization_state"] == "ready") {
                                    try {
                                        var json = {
                                            "token_bot": db.getValue("token_bot"),
                                            "token_user": db.getValue("token_user"),
                                            "is_userbot": true
                                        };
                                        var data = Utilities.base64Encode(JSON.stringify(json));
                                        var url = urlApi + data;
                                        tg_user.request("setWebhook", {
                                            "url": url
                                        });
                                        db.delete(`key:${chat_id}`);
                                        var message = `Succes loggin`;
                                        return tg.request("sendMessage", {
                                            "chat_id": chat_id,
                                            "text": message,
                                        });
                                    } catch (e) {
                                        return tg.request("sendMessage", {
                                            "chat_id": chat_id,
                                            "text": JSON.stringify(e.message),
                                        });
                                    }
                                }

                                if (authCode["result"]["authorization_state"] == "wait_password") {
                                    getValue["state"]["type"] = "password";
                                    db.setValue(`key:${chat_id}`, JSON.stringify(getValue));
                                    var message = `Silahkan kirim pesan text password ya!`;
                                    return tg.request("sendMessage", {
                                        "chat_id": chat_id,
                                        "text": message,
                                    });
                                }

                            } catch (e) {
                                return tg.request("sendMessage", {
                                    "chat_id": chat_id,
                                    "text": JSON.stringify(e.message),
                                });
                            }
                        case "password":
                            if (!text) {
                                return tg.request("sendMessage", {
                                    "chat_id": chat_id,
                                    "text": "Tolong kirim pesan dalam bentuk teks\nexample\nabcedfg123456",
                                });
                            }
                            try {
                                var authPassword = tg_user.request("authPassword", {
                                    "password": text
                                });
                                if (authPassword["result"]["authorization_state"] == "ready") {
                                    try {
                                        var json = {
                                            "token_bot": db.getValue("token_bot"),
                                            "token_user": db.getValue("token_user"),
                                            "is_userbot": true
                                        };
                                        var data = Utilities.base64Encode(JSON.stringify(json));
                                        var url = urlApi + data;
                                        tg_user.request("setWebhook", {
                                            "url": url
                                        });
                                        db.delete(`key:${chat_id}`);
                                        var message = `Succes loggin`;
                                        return tg.request("sendMessage", {
                                            "chat_id": chat_id,
                                            "text": message,
                                        });
                                    } catch (e) {
                                        return tg.request("sendMessage", {
                                            "chat_id": chat_id,
                                            "text": JSON.stringify(e.message),
                                        });
                                    }
                                }
                            } catch (e) {
                                return tg.request("sendMessage", {
                                    "chat_id": chat_id,
                                    "text": JSON.stringify(e.message),
                                });
                            }
                        default:
                            db.delete(`key:${chat_id}`);
                            return tg.request("sendMessage", {
                                "chat_id": chat_id,
                                "text": "Oops state tidak ada\nstate hash been delete",
                            });
                    }

                }

            }

        }
    }
}