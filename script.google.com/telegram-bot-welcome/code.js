/*
*   Quickstart Telegram bot Welcome with database hexaminate nosql
*
*   Library
*   Telegram_client:    https://github.com/azkadev/telegram_client
*
*   Publisher & Maintaners:
*   https://github.com/azkadev
*   
*
*
**/

// configuration global seting dlu ya tod

var config_json = {
    "token": "token_bot",
    "username_bot": "hexawelcomebot",
    "token_database": "token_database",
    "token_apis": "token_api",
};
var lib = new telegramclient.telegram(config_json.token);
var tg = lib.api;

function setWebhook() {
    var url = "isi url script kamu ya tod";
    var option = {
        "url": url
    };
    var data = tg.request("setWebhook", option);
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
    var url = "https://hexaminate.herokuapp.com/database/nosql/api/" + config_json.token_database + "/" + method;
    var response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() == 200) {
        return JSON.parse(response.getContentText());
    }
    return false;
}


function apis(method, parameters = {}) {
    if (!config_json.token_apis) {
        throw {
            "message": 'Bot Token is required'
        };
    } else {
        if (String(config_json.token_apis).split(":").length == 0) {
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
    var url = "https://hexaminate.herokuapp.com/apis/" + config_json.token_apis + "/" + method;
    var response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() == 200) {
        return JSON.parse(response.getContentText());
    }
    return false;
}

/// fungsi ini di jalankan dlu ya pastikin token udah keisi semua kalo gk kita tawuran
function setDatabaseTelegram() {
    console.log(database("setValue", { "key": "group", "value": [] }));
}

function checkAdmin(tg, chat_id, user_id) {
    try {
        var getChatAdministrators = tg.request("getChatAdministrators", { chat_id: chat_id });
        var admins_array = getChatAdministrators.result;
        var id_admins = [];
        admins_array.map(res => id_admins.push(res.user.id));
        if (id_admins.indexOf(user_id) > -1) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
}

function doPost(e) {
    try {
        if (e.postData.type == "application/json") {
            var update = JSON.parse(e.postData.contents);
            if (update) {

                if (update.callback_query) {
                    var cb = update.callback_query;
                    var cbm = cb.message;
                    var isText = cbm.text ?? "";
                    var cbm_caption = cbm.caption ?? "";
                    var user_id = cb.from.id;
                    var chat_id = cbm.chat.id;
                    var chat_type = String(cbm.chat.type).replace(RegExp("super", "i"), "");
                    var chat_title = cbm.chat.title ?? "";
                    var chat_username = (cbm.chat.username) ? `@${cbm.chat.username}` : "";
                    var msg_id = cbm.message_id;
                    var text = cb.data;
                    var fromId = cb.from.id;
                    var fromFname = cb.from.first_name;
                    var fromLname = cb.from.last_name ?? "";
                    var fromFullName = `${fromFname} ${fromLname}`;
                    var fromUsername = (cb.from.username) ? `@${cb.from.username}` : "";
                    var fromLanguagecode = cb.from.language_code ?? "id";
                    var mentionFromMarkdown = `[${fromFullName}](tg://user?id=${user_id})`;
                    var mentionFromHtml = `<a href='tg://user?id=${user_id}'>${fromFullName}</a>`;

                    try {
                        if (!checkAdmin(tg, chat_id, user_id)) {
                            var option = {
                                "callback_query_id": cb.id,
                                "text": `Oops hanya Admin Saja yang bisa akses`,
                                "show_alert": true
                            };
                            return tg.request("answerCallbackQuery", option);
                        }

                        var paramsEdit = {
                            "chat_id": chat_id,
                            "message_id": msg_id,
                            "parse_mode": "html"
                        };

                        if (RegExp("^cancel:.*$", "i").exec(text)) {
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
                            paramsEdit["text"] = "Operation " + String(text).replace(/(cancel\:|_)/ig, "") + "Succes Cancel";
                            return tg.request("editMessageText", paramsEdit);
                        }

                        if (RegExp("^add_welcome$", "i").exec(text)) {
                            database("updateValue", {
                                "key": "group",
                                "searchdata": {
                                    "chat": {
                                        "id": chat_id
                                    }
                                },
                                "value": {
                                    "state": {
                                        "chat_id": chat_id,
                                        "user_id": user_id,
                                        "state": text,
                                        "message_id": msg_id
                                    }
                                }
                            });
                            paramsEdit["text"] = "Silahkan kirim pesan anda disini\n\nExtra Variable\n<code>{name}</code>\n<code>{username}</code>\n{chat_title}";
                            paramsEdit["reply_markup"] = {
                                "inline_keyboard": [
                                    [
                                        {
                                            "text": "Cancel",
                                            "callback_data": "cancel:" + text
                                        }
                                    ]
                                ]
                            };
                            return tg.request("editMessageText", paramsEdit);
                        }

                        if (RegExp("^add_welcome$", "i").exec(text)) {
                            database("updateValue", {
                                "key": "group",
                                "searchdata": {
                                    "chat": {
                                        "id": chat_id
                                    }
                                },
                                "value": {
                                    "state": {
                                        "chat_id": chat_id,
                                        "user_id": user_id,
                                        "state": text,
                                        "message_id": msg_id
                                    }
                                }
                            });
                            paramsEdit["text"] = "Silahkan kirim pesan anda disini\n\nExtra Variable\n<code>{name}</code>\n<code>{username}</code>\n{chat_title}";
                            paramsEdit["reply_markup"] = {
                                "inline_keyboard": [
                                    [
                                        {
                                            "text": "Cancel",
                                            "callback_data": "cancel:" + text
                                        }
                                    ]
                                ]
                            };
                            return tg.request("editMessageText", paramsEdit);
                        }

                        if (RegExp("^delete_welcome$", "i").exec(text)) {
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
                            paramsEdit["text"] = "Succes Delete Welcome";
                            return tg.request("editMessageText", paramsEdit);
                        }

                        if (RegExp("^watch_welcome$", "i").exec(text)) {
                            paramsEdit["text"] = "Please wait Fetching Database...";
                            tg.request("editMessageText", paramsEdit);
                            try {
                                var getValueApi = database("getValue", {
                                    "key": "group"
                                });
                            } catch (e) {
                                var getValueApi = false;
                            }
                            if (getValueApi && getValueApi.status_bool && getValueApi.result) {
                                var getValue = getValueApi.result.content;
                                for (var index = 0; index < getValue.length; index++) {
                                    var loop_data = getValue[index];
                                    if (loop_data.chat && loop_data.chat.id == chat_id && loop_data.welcome) {
                                        try {
                                            tg.request("deleteMessage", { chat_id: chat_id, message_id: msg_id });
                                        } catch (e) {

                                        }
                                        try {
                                            return sendMessage(tg, cb, loop_data);
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
                                paramsEdit["text"] = "Failed Because no data in database";
                                return tg.request("editMessageText", paramsEdit);
                            }
                        }
                    } catch (e) {
                        try {
                            tg.request("deleteMessage", { chat_id: chat_id, message_id: msg_id });
                        } catch (e) {
                        }
                        var option = {
                            "chat_id": chat_id,
                            "text": e.message
                        };
                        return tg.request("sendMessage", option);
                    }
                }

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

                            if (RegExp("ping", "gmi").exec(text)) {
                                var option = {
                                    "chat_id": chat_id,
                                    "text": "Pong",
                                    "parse_mode": "html"
                                };
                                return tg.request("sendMessage", option);
                            }
                            
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
                                    try {
                                        var getValueApi = database("getValue", {
                                            "key": "group"
                                        });
                                    } catch (e) {
                                        var getValueApi = false;
                                    }
                                    if (getValueApi && getValueApi.status_bool && getValueApi.result) {
                                        var getValue = getValueApi.result.content;
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
                                    }   else   {
                                        return tg.request("sendMessage", {"chat_id": chat_id, "text": "Api Sedang dalam ganggguan atau token kamu salah"});
                                    }
                                }
                            }

                        }

                        // check dlu ada member gknya
                        if (msg.new_chat_members) {
                            // baru ambil data value
                            try {
                                var getValueApi = database("getValue", {
                                    "key": "group"
                                });
                            } catch (e) {
                                var getValueApi = false;
                            }
                            // check lagi apinya masih on gk
                            if (getValueApi && getValueApi.status_bool && getValueApi.result) {
                                var getValue = getValueApi.result.content;
                                // check lagi ada data group kamu gk di database
                                for (var index = 0; index < getValue.length; index++) {
                                    var loop_data = getValue[index];
                                    if (loop_data.chat && loop_data.chat.id == chat_id && loop_data.welcome) {
                                        // tambahin try catch jika error ntr database di reset biar rusaknya gk nambah beban server api
                                        try {
                                            return sendMessage(tg, update, loop_data);
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
                        }

                        // ambil data dlu dari server tambahin try catch biar kalo apinya botnya bisu
                        try {
                            var getValueApi = database("getValue", {
                                "key": "group"
                            });
                        } catch (e) {
                            var getValueApi = false;
                        }
                        if (getValueApi && getValueApi.status_bool && getValueApi.result) {
                            var getValue = getValueApi.result.content;
                            for (var index = 0; index < getValue.length; index++) {
                                var loop_data = getValue[index];
                                if (loop_data.state && loop_data.state.chat_id == chat_id && loop_data.state.user_id == user_id) {
                                    if (loop_data.state.state) {
                                        var getState = String(loop_data.state.state).toLocaleLowerCase();
                                        switch (getState) {
                                            case "add_welcome":
                                                if (loop_data.state.message_id) {
                                                    try {
                                                        tg.request("deleteMessage", { chat_id: chat_id, message_id: loop_data.state.message_id });
                                                    } catch (e) {

                                                    }
                                                }
                                                var supportMessage = false;
                                                // bikin object dlu biar lebih mudah kalo gk ngerti ya nganu dahlah
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
                                                            "value": {
                                                                "state": false,
                                                                "welcome": json
                                                            }
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
                                            case "add_keyboard":
                                                if (loop_data.state.message_id) {
                                                    try {
                                                        tg.request("deleteMessage", { chat_id: chat_id, message_id: loop_data.state.message_id });
                                                    } catch (e) {

                                                    }
                                                }
                                                if (text && /\((?<text>[^\)]+) - (?<url>[^\s+]+)\)(?<same>(?:\:same)?)/gmi.exec(text)) {
                                                    var param = {
                                                        "id_api": "text_to_keyboard",
                                                        "text": text
                                                    };
                                                    var keyboard = apis("telegram", param);
                                                    if (keyboard && keyboard.status_bool && keyboard.result && keyboard.result.reply_markup) {
                                                        var keyboards = keyboard.result.reply_markup;
                                                        database("updateValue", {
                                                            "key": "group",
                                                            "searchdata": {
                                                                "chat": {
                                                                    "id": chat_id
                                                                }
                                                            },
                                                            "value": {
                                                                "state": false,
                                                                "keyboard": keyboards
                                                            }
                                                        });
                                                        var option = {
                                                            "chat_id": chat_id,
                                                            "text": "Succes Add Keyboard",
                                                            "parse_mode": "html",
                                                            "reply_markup": keyboards
                                                        };
                                                        return tg.request("sendMessage", option);
                                                    } else {

                                                        var option = {
                                                            "chat_id": chat_id,
                                                            "text": JSON.stringify(keyboard, null, 2),
                                                            "parse_mode": "html"
                                                        };
                                                        return tg.request("sendMessage", option);
                                                    }
                                                } else {
                                                    var option = {
                                                        "chat_id": chat_id,
                                                        "text": "Tolong kirim pesan text ya",
                                                        "parse_mode": "html"
                                                    };
                                                    return tg.request("sendMessage", option);
                                                }
                                            default:
                                                var param = {
                                                    "key": "group",
                                                    "searchdata": {
                                                        "chat": {
                                                            "id": chat_id
                                                        }
                                                    },
                                                    "value": {
                                                        "state": false
                                                    }
                                                };
                                                return database("updateValue", param);
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

// di buat function agar bisa di kembangkan lebih mudah dan agar bisa di gunakan di mana saja bukan welcome doang tapi tinggal kalian atur sendiri kali gk ngerti ya sudahlah itu urusan kalian
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
            // cehck type welcome jika gk ada langsung return false;
            if (getData.welcome.type) {
                var message = "";
                // check caption ada gknya
                if (getData.welcome.content) {
                    // di replace dlu agar text {username} dll auto ganti ke nama member
                    message += String(getData.welcome.content).replace(/({name})/ig, fromFname).replace(/({username})/ig, fromUsername).replace(/({chat_title})/ig, chat_title);
                }
                // check type support jangan asal naruh ntr anu
                if (RegExp("^(message|photo|video|audio|document|voice|videonote|animation)$", "i").exec(getData.welcome.type)) {
                    var option = {
                        "chat_id": chat_id,
                        "allow_sending_without_reply": true,
                        "reply_to_message_id": msg_id,
                        "parse_mode": "html"
                    };
                    if (RegExp("^message$", "i").exec(getData.welcome.type)) {
                        option["text"] = message ?? "Hello new member";
                    } else {
                        option[String(getData.welcome.type).toLocaleLowerCase()] = getData.welcome.file_id;
                        option["caption"] = message ?? "";
                    }
                    // check keyboard kalo ada tambahin key reply markup
                    if (getData.keyboard) {
                        option["reply_markup"] = getData.keyboard;
                    }
                    return tg.request("send" + getData.welcome.type, option);
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