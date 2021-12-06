var config_json = {
    "token": "paste_your_token_here",
    "username_bot": "",
    "token_database": ""
};
var lib = new telegramclient.telegram(config_json.token);
var tg = lib.api;
function setWebhook() {
    var url = "";
    var option = {
        "url": url
    };
    var data = lib.newBot(token).api.request("setWebhook", option);
    console.log(data);
}

function database(method, parameters = {}) {
    if (!config_json.token_database) {
        throw {
            "message": 'Bot Token is required'
        };
    } else {
        if (String(config_json.token_database).split(":").length == 0) {
            throw {
                message: `Format token salah tolong isi dengan benar ya`
            };
        }
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
    if (parameters) {
        options['payload'] = JSON.stringify(parameters);
    }
    var url = "https://hexaminate.herokuapp.com/database/nosql/api/" + config_json.token_database;
    var response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() == 200) {
        if (blob) {
            return response.getBlob();
        } else {
            return JSON.parse(response.getContentText());
        }
    }
    return false;

}

function setDatabaseTelegram() {
    var data = database("setValue", { "key": "group", "value": [] });
    console.log(data);
}

function doPost(e) {
    try {

        if (e.postData.type == "application/json") {

            var update = JSON.parse(e.postData.contents);

            if (update) {


                if (update.message) {
                    var msg = update.message;
                    var msgr = msg.reply_to_message ?? false;
                    var user_id = msg.from.id;
                    var chat_id = msg.chat.id;
                    var chat_type = String(msg.chat.type).replace(RegExp("super", "i"), "");
                    var chat_title = msg.chat.title ?? "";
                    var chat_username = (msg.chat.username) ? `@${msg.chat.username}` : "";
                    var msg_id = msg.message_id;
                    var text = msg.text ?? "";
                    var caption = msg.caption ?? "";
                    var fromId = msg.from.id;
                    var fromFname = msg.from.first_name;
                    var fromLname = msg.from.last_name ?? "";
                    var fromFullName = `${fromFname} ${fromLname}`;
                    var fromUsername = (msg.from.username) ? `@${msg.from.username}` : "";
                    var fromLanguagecode = msg.from.language_code ?? "id";
                    var mentionFromMarkdown = "[" + fromFullName + "](tg://user?id=" + user_id + ")";
                    var key = { chat: { id: chat_id } };

                    try {
                        if (text) {

                            /// start script
                            if (RegExp("^/start$", "i").exec(text)) {
                                if (chat_type == "private") {
                                    var option = {
                                        "chat_id": chat_id,
                                        "text": "Hello there my name is bot",
                                        "parse_mode": "html",
                                        "reply_markup": {
                                            "inline_keyboard": [
                                                [
                                                    {
                                                        "text": (config_json.username_bot) ? "ADD Me To your group" : "Subscribe my channel",
                                                        "url": "t.me/" + config_json.username_bot ?? "azkadev"
                                                    }
                                                ]
                                            ]
                                        }
                                    };
                                    return tg.request("sendMessage", option);
                                } else {
                                    var getValue = database("getValue", {
                                        "key": "group"
                                    });
                                    var foundValue = false;
                                    for (var index = 0; index < getValue.length; index++) {
                                        var loop_data = getValue[index];
                                        if (loop_data.chat && loop_data.chat.id == chat_id) {
                                            foundValue = true;
                                        }
                                    }
                                    if (!foundValue) {
                                        database("pushValue", {
                                            "key": "group",
                                            "value": {
                                                "chat": msg.chat,
                                                "welcome": false,
                                                "state": false
                                            }
                                        });
                                    }
                                    var option = {
                                        "chat_id": chat_id,
                                        "text": "Hello there my name is bot",
                                        "parse_mode": "html",
                                        "reply_markup": {
                                            "inline_keyboard": [
                                                [
                                                    {
                                                        "text": "Add Welcome",
                                                        "callback_data": "add_welcome"
                                                    },
                                                    {
                                                        "text": "Lihat Welcome",
                                                        "callback_data": "watch_welcome"
                                                    }
                                                ],
                                                [
                                                    {
                                                        "text": "Delete Welcome",
                                                        "callback_data": "delete_welcome"
                                                    }
                                                ],
                                                [
                                                    {
                                                        "text": "ADD Keyboard",
                                                        "callback_data": "add_keyboard"
                                                    }
                                                ]
                                            ]
                                        }
                                    };
                                    return tg.request("sendMessage", option);
                                }
                            }

                        }

                        if (msg.new_chat_members) {
                            var getValue = database("getValue", {
                                "key": "group"
                            });
                            for (var index = 0; index < getValue.length; index++) {
                                var loop_data = getValue[index];
                                if (loop_data.chat && loop_data.chat.id == chat_id && loop_data.welcome) {
                                    try {
                                        return sendMessage(tg, update, loop_data.welcome);
                                    } catch (e) {
                                        database("updateValue", {
                                            "key": "group",
                                            "searchdata": {
                                                "chat": {
                                                    "id": chat_id
                                                }
                                            },
                                            "value": {
                                                "welcome": false
                                            }
                                        });
                                        var option = {
                                            "chat_id": chat_id,
                                            "text": "Terjadi kesalahan saat mengirim pesan\nKini pesan welcome sudah di hapus.......",
                                            "parse_mode": "html"
                                        };
                                        return tg.request("sendMessage", option);
                                    }
                                }
                            }
                        }
                        try {
                            var getValue = database("getValue", {
                                "key": "group"
                            });
                        } catch (e) {
                            var getValue = false;
                        }
                        if (getValue) {
                            for (var index = 0; index < getValue.length; index++) {
                                var loop_data = getValue[index];
                                if (loop_data.chat && loop_data.chat.id == chat_id && loop_data.state && loop_data.state.chat_id == chat_id && loop_data.state.user_id) {
                                    if (loop_data.state.state) {
                                        var getState = String(loop_data.state.state).toLocaleLowerCase();

                                        switch (getState) {
                                            case "add_welcome":
                                                var supportMessage = false;
                                                var json = {};
                                                if (text) {
                                                    supportMessage = true;
                                                    json.type = "message";
                                                    json.content = text;
                                                }
                                                if (msg.photo) {
                                                    supportMessage = true;
                                                    json.type = "photo";
                                                    json.content = caption;
                                                    json.file_id = msg.photo[msg.photo.length - 1].file_id;
                                                }
                                                if (msg.audio) {
                                                    supportMessage = true;
                                                    var type = "audio";
                                                    json.type = type;
                                                    json.file_id = msg[type].file_id;
                                                }
                                                if (msg.document) {
                                                    supportMessage = true;
                                                    var type = "document";
                                                    json.type = type;
                                                    json.file_id = msg[type].file_id;
                                                }
                                                if (msg.video) {
                                                    supportMessage = true;
                                                    var type = "video";
                                                    json.type = type;
                                                    json.file_id = msg[type].file_id;
                                                }
                                                if (msg.voice) {
                                                    supportMessage = true;
                                                    var type = "voice";
                                                    json.type = type;
                                                    json.file_id = msg[type].file_id;
                                                }
                                                if (msg.animation) {
                                                    supportMessage = true;
                                                    var type = "animation";
                                                    json.type = type;
                                                    json.file_id = msg[type].file_id;
                                                }
                                                if (msg.video_note) {
                                                    supportMessage = true;
                                                    var type = "video_note";
                                                    json.type = type;
                                                    json.file_id = msg[type].file_id;
                                                }
                                                if (supportMessage) {
                                                    if (json) {
                                                        database("updateValue", {
                                                            "key": "group",
                                                            "searchdata": {
                                                                "chat": {
                                                                    "id": chat_id
                                                                }
                                                            },
                                                            "value": json
                                                        });
                                                        var option = {
                                                            "chat_id": chat_id,
                                                            "text": "Succes Add Welcome",
                                                            "parse_mode": "html"
                                                        };
                                                        return tg.request("sendMessage", option);
                                                    } else {
                                                        var option = {
                                                            "chat_id": chat_id,
                                                            "text": "Oops terjadi kesalahan tolong ulangin lagi ya",
                                                            "parse_mode": "html"
                                                        };
                                                        return tg.request("sendMessage", option);
                                                    }
                                                } else {
                                                    var option = {
                                                        "chat_id": chat_id,
                                                        "text": "Hanya support send text dan berupa media biasa ya!",
                                                        "parse_mode": "html"
                                                    };
                                                    return tg.request("sendMessage", option);
                                                }
                                            case "":


                                            default:
                                                return;
                                        }

                                    } else {
                                        database("updateValue", {
                                            "key": "group",
                                            "searchdata": {
                                                "chat": {
                                                    "id": chat_id
                                                }
                                            },
                                            "value": {
                                                "state": false
                                            }
                                        });
                                        var option = {
                                            "chat_id": chat_id,
                                            "text": "Terjadi kesalahan pada state tolong ulangin lagi dari awal yah",
                                            "parse_mode": "html"
                                        };
                                        return tg.request("sendMessage", option);
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        var option = {
                            "chat_id": chat_id,
                            "text": e.message
                        };
                        return tg.request("sendMessage", option);
                    }
                }
            }
        }
    } catch (e) {

    }
}

function sendMessage(tg, update, getData) {

    if (update && getData) {

        if (update.message) {
            var msg = update.message;
            var msgr = msg.reply_to_message ?? false;
            var user_id = msg.from.id;
            var chat_id = msg.chat.id;
            var chat_type = String(msg.chat.type).replace(RegExp("super", "i"), "");
            var chat_title = msg.chat.title ?? "";
            var chat_username = (msg.chat.username) ? `@${msg.chat.username}` : "";
            var msg_id = msg.message_id;
            var text = msg.text ?? "";
            var caption = msg.caption ?? "";
            var fromId = msg.from.id;
            var fromFname = msg.from.first_name;
            var fromLname = msg.from.last_name ?? "";
            var fromFullName = `${fromFname} ${fromLname}`;
            var fromUsername = (msg.from.username) ? `@${msg.from.username}` : "";
            var fromLanguagecode = msg.from.language_code ?? "id";
            var mentionFromMarkdown = "[" + fromFullName + "](tg://user?id=" + user_id + ")";
            var key = { chat: { id: chat_id } };

            if (getData.type) {
                var message = "";
                if (getData.content) {
                    message += String(getData.content).replace(/({name})/ig, fromFname).replace(/({username})/ig, fromUsername).replace(/({chat_title})/ig, chat_title);
                }

                if (RegExp("^(message|photo|video|audio|document|voice|videonote|animation)$", "i").exec(getData.type)) {
                    var option = {
                        "chat_id": chat_id,
                        "allow_sending_without_reply": true,
                        "reply_to_message_id": msg_id,
                        "parse_mode": "html"
                    };
                    if (RegExp("^message$", "i").exec(getData.type)) {
                        option["text"] = message ?? "Hello new member";
                    } else {
                        option[String(getData.type).toLocaleLowerCase()] = getData.file_id;
                        option["caption"] = message ?? "";
                    }
                    return tg.request("send" + getData.type, option);
                } else {
                    return false;
                }
            } else {
                return false;
            }

        } else {
            return false;
        }
    } else {
        return false;
    }
}