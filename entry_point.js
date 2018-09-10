const r = require('react');
const e = r.createElement;
const d = require('react-dom');
const createReactClass = require('create-react-class');
const biwasyuni = require('@yuniscm/biwasyuni/biwasyuni_core.js');
const biwasloader = require('./loader_html5.js');

const root = document.getElementById('root');

const async_loaders = {
    browserfs: import('browserfs'),
    materialui: import('@material-ui/core/umd/material-ui.production.min.js')
};

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

    d.render(e("div", null, "Starting..."), root); // debug

    biwasyuni.run("(load \"boot.scm\")", 
                  function(res){ console.log("init done.", res); },
                  function(e){ throw e; });
}

module.exports = {run:run};
