const express = require('express');
const app = express();
const port = 80

let whitelist;

const fs = require("fs");
try {
    let jsonString = fs.readFileSync("./whitelist.json");
    whitelist = JSON.parse(jsonString)[0];
} catch(err) {
    console.log("ERROR: no whitelist file found! shutting lauthi down.")
    process.exit(1);
}

console.log(whitelist);

let users = Object.keys(whitelist);
let HWIDs = Object.values(whitelist);



app.get("/", (req, res) => {
    console.log(req.headers["sw-fingerprint"])
    let HWID = req.headers["sw-fingerprint"];
    let whitelisted = false;

    for (let i = 0; i < users.length; i++) {
        if (HWID == HWIDs[i]) {
            res.send([true, users[i]]);
            return;
        }
    }

    res.send([false, "whitelist failed."])
});

app.listen(port, () => {
    console.log(`listening on port ${port}`)
});