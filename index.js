const express = require('express');
const app = express();
const port = 80

const showHWID = true;
let whitelist;

const fs = require("fs");
try {
    let jsonString = fs.readFileSync("./whitelist.json");
    whitelist = JSON.parse(jsonString);
} catch(err) {
    console.log("ERROR: no whitelist file found! shutting lauthi down.")
    process.exit(1);
}

let count = Object.keys(whitelist);
let users = [];
let HWID = "";
let syn = false;
let sw = false;
let krnl = false;
let resp = false;

// get usernames of all users in file
for (let i = 0; i < count.length; i++) {
    users.push(Object.keys(whitelist[i]));
}

// api request
app.get("/", (req, res) => {

    // if scriptware
    if (!(req.headers["sw-fingerprint"] == undefined)) {
        HWID = req.headers["sw-fingerprint"];
        sw = true;
        syn = false;
        krnl = false;

    } 
    // if synapse
    else if (!(req.headers["syn-fingerprint"] == undefined)) {
        HWID = req.headers["syn-fingerprint"];
        syn = true;
        sw = false;
        krnl = false;

    } 
    // if krnl
    else if (!(req.headers["krnl-hwid"] == undefined)) {
        HWID = req.headers["krnl-hwid"];
        krnl = true;
        syn = false;
        sw = false;

    } else {
        HWID = undefined;
    }

    // show HWID if wanted
    if (showHWID) {
        console.log(HWID);
    }

    // verification
    for (let i = 0; i < users.length + 1; i++) {
        // if scriptware
        if (sw) {
            for (let i = 0; i < users.length; i++) {
                let kHWID = whitelist[i][users[i][0]][0];

                if (kHWID == HWID) {
                    res.send(`true,${users[i]}`);
                    resp = true;
                    break;
                }
            }
            break;
        }

        // if synapse
        if (syn) {
            for (let i = 0; i < users.length; i++) {
                let kHWID = whitelist[i][users[i][0]][1];

                if (kHWID == HWID) {
                    res.send(`true,${users[i]}`);
                    resp = true;
                    break;
                }
            }
            break;
        }

        // if KRNL
        if (krnl) {
            for (let i = 0; i < users.length; i++) {
                let kHWID = whitelist[i][users[i][0]][2];

                if (kHWID == HWID) {
                    res.send(`true,${users[i]}`);
                    resp = true;
                    break;
                }
            }
            break;
        }
    }

    if (!(resp)) {
        res.send("false,whitelist failed.");
    }
});

app.listen(port, () => {
    console.log(`listening on port ${port}`)
});
