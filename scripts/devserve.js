#!/usr/bin/env node
const builder = require("./parcel-run.js");

const cwd = process.cwd();

var config = {
    buildtype: "debug",
    yuniroot: cwd + "/yuni",
    libpath: [cwd + "/yunilib"],
    progs: [cwd + "/app.sps"]
};

builder.run(config);
