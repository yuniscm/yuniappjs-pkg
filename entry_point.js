const r = require('react');
const e = r.createElement;
const d = require('react-dom');
const createReactClass = require('create-react-class');
const biwasyuni = require('@yuniscm/biwasyuni/biwasyuni_core.js');
const biwasloader = require('./loader_html5.js');

const root = document.getElementById('root');

const async_loaders = {
    browserfs: import('browserfs'),
    materialui: import('@material-ui/core'),
    materialuilab: import('@material-ui/lab'),
    octicons: import('@githubprimer/octicons-react')
};

function simplefetch(url, cb) {
    window.fetch(url).then(res => {
        if(res.ok){
            res.json().then(data => {
                cb(data);
            }, err => {
                console.log("simplefetch JSON error", err);
                cb(false);
            });
        }else{
            console.log("simplefetch error");
            cb(false);
        }
    }, err => {
        console.log("Something fatal.", err);
    });
}

function simplepost_json(url, datum, cb) {
    let opts = {
        headers:{
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(datum)
    };
    window.fetch(url, opts).then(res => {
        if(res.ok){
            res.json().then(data => {
                cb(data);
            }, err => {
                console.log("simplepost JSON error", err);
                cb(false);
            });
        }else{
            console.log("simplepost error");
            cb(false);
        }
    }, err => {
        console.log("Something fatal.", err);
    });
}

function js_load_async(name, cb){
    async_loaders[name].then(cb);
};

function thiswrap(cb){
    return function(){
        return cb(this);
    };
};

function pp(a){ // For debug
    console.log(a);
};

function run(cfg){
    console.log(cfg);

    // Configure runtime
    var loadfs = biwasloader.loadfs(cfg.approot + "/");
    biwasyuni.switch_console_output(); // Use console.log
    biwasyuni.set_current_fs(loadfs);

    // React related
    biwasyuni.add_module("e", e);
    biwasyuni.add_module("d", d);
    biwasyuni.add_module("ReactFragment", r.Fragment);
    biwasyuni.add_module("createReactClass", createReactClass);

    // Core runtimes
    biwasyuni.add_module("fs", loadfs); // FIXME: ???
    biwasyuni.add_module("js-load-async", js_load_async);
    biwasyuni.add_module("document-root", root);
    biwasyuni.add_module("thiswrap", thiswrap);
    biwasyuni.add_module("pp", pp);
    biwasyuni.add_module("simplefetch", simplefetch);
    biwasyuni.add_module("simplepost-json", simplepost_json);

    // Supers
    biwasyuni.add_module("XXXdocument", document);
    biwasyuni.add_module("XXXwindow", window);
    biwasyuni.add_module("XXXconsole", console);

    d.render(e("div", null, "Starting..."), root); // debug

    biwasyuni.run("(load \"boot.scm\")", 
                  function(res){ console.log("init done.", res); },
                  function(e){ throw e; });
}

module.exports = {run:run};
