#!/usr/bin/env node
const builder = require("./parcel-run.js");
const path = require("path");

const cwd = process.cwd();

function subpath(name){
    return path.join(cwd, name);
}

var config = {
    buildtype: "debug",
    yuniroot: subpath("/yuni"),
    libpath: [subpath("/yunilib")],
    progs: [subpath("/app.sps")]
};

builder.run(config);
