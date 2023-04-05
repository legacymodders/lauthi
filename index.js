const express = require('express');
const app = express();
const port = 80

const showHWID = true;
let whitelist;

const fs = require("fs");
try {
    let jsonString = fs.readFileSync("./whitelist.json");
    whitelist = JSON.parse(jsonString)[0];
} catch(err) {
    console.log("ERROR: no whitelist file found! shutting lauthi down.")
    process.exit(1);
}

let users = Object.keys(whitelist);
let HWIDs = Object.values(whitelist);
let HWID;
let syn;
let sw;

app.get("/", (req, res) => {
    if (!(req.headers["sw-fingerprint"] == undefined)) {
        HWID = req.headers["sw-fingerprint"];
        sw = true;
        syn = false;
    } else if (!(req.headers["syn-fingerprint"] == undefined)) {
        HWID = req.headers["syn-fingerprint"];
        syn = true;
        sw = false;
    } else {
        HWID = undefined;
    }

    if (showHWID) {
        console.log(HWID);
    }

    for (let i = 0; i < users.length; i++) {
        if (HWID == HWIDs[i]) {
            res.send([true, users[i]]);
            return;
        }

        if (sw) {
            if (!(HWIDs[i][0] == "")) {
                console.log("SCRIPTWARE");
                if (HWID == HWIDs[i][0]) {
                    res.send([true, users[i]]);
                    return;
                }
            }
        }
    
        if (syn) {
            if (!(HWIDs[i][1] == "")) {
                console.log("SYNAPSE");
                if (HWID == HWIDs[i][1]) {
                    res.send([true, users[i]]);
                    return;
                }
            }
        }
    }

    res.send([false, "whitelist failed."])
});

app.listen(port, () => {
    console.log(`listening on port ${port}`)
});
