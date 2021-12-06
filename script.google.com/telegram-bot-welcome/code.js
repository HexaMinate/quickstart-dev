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

function fetch(){
    
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
                    var mentionFromMarkdown = `[${fromFullName}](tg://user?id=${user_id})`;
                    var mentionFromHtml = `<a href='tg://user?id=${user_id}'>${fromFullName}</a>`;
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