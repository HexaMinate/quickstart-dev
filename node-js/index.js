var { Database } = require("hexaminate.js");

var nosql = new Database.Nosql("paste_your token");

async function main(){
    await nosql.request("setValue", {
        "key": "new_key",
        "value": "hello world"
    });
    var getValue = await nosql.request("getValue",{
        "key": "new_key"
    });
    console.log(getValue);
}

main();