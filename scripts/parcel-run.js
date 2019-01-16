const bd = require('parcel-bundler');
const express  = require('express');

const Path = require('path');
const fs = require('fs');
const fse = require('fs-extra');

function do_process(buildtype, yuniroot, libpath, progs, approot, extra){
    function deploysource(base, filename){
        const from = Path.join(__dirname, "/../", filename);
        const to = Path.join(base + "/" + filename);
        fse.copySync(from, to);
    }
    function writeconfig(pth,approot,extra){
        let out = "";
        let approotstr = JSON.stringify(approot ? approot : "");
        out += ("module.exports = " + "{ approot: " + approotstr + ",\n");

        if(extra){
            let extrastr = JSON.stringify(extra);
            out += ("  extra : require(" + extrastr + "),\n");
        }
        out += "};\n";

        fs.writeFileSync(pth, out);
    };

    function genboot(pth, lst){
        var out = "(define (command-line) '(\"\" \"\" \"\" \"\"))\n";
        lst.forEach(e => { 
            out += "(load \"" + e.pth + "\")\n"; 
            if(e.alias){
                var fromname = e.libname.join(" ");
                var toname = e.alias.join(" ");
                out += "(yuni/register-library-alias! '(" + fromname +
                    ") '(" + toname + "))\n";
            }
        });
        fs.writeFileSync(pth, out);
    };

    // Application provider
    function appprovider(lst, approot, extra){
        // lst = [ LIB* ]
        // LIB = {libname: #f/[name*], dir: DIR, pth: PATH}

        // Add "app.sps" as an entrypoint
        lst.push({libname: false, dir: ".", pth: "app.sps"});

        if(buildtype == "debug" || buildtype == "debug_minify"){
            //const input = Path.join(__dirname, "../index_debug.html");
            const input = "dist/index_debug.html";

            // generate bootloader
            if(! fs.existsSync("dist")){
                fs.mkdirSync("dist");
            }
            genboot("dist/boot.scm", lst);
            writeconfig("dist/appconfig.js",approot,extra);

            deploysource("dist", "index_debug.html");
            deploysource("dist", "index_debug.js");

            // It seems detailedReport requires !watch
            var options = { 
                outFile: "index.html",
                watch: false, 
                detailedReport: true 
            };
            if(buildtype == "debug_minify"){
                options["minify"] = true;
                options["sourceMaps"] = false;
            }
            var bundler = new bd(input, options);

            var app = express();
            // Root
            app.get("/", function(req, res){ res.redirect("/index.html")});

            // Construct file => dir mapping
            var dirmap = {};
            lst.forEach(e => {dirmap["/" + e.pth] = e.dir;});

            // Static provider
            app.use(function(req, res, next){
                dir = dirmap[req.url];
                if(dir){
                    var sendpath = dir == "." ?
                        process.cwd() + "/" + dir + "/" + req.url :
                        /* approot + */ dir + "/" + req.url;
                    console.log("Send", sendpath);
                    res.setHeader("Content-Type", "text/plain");
                    res.sendFile(sendpath);
                }else{
                    console.log("(Parcel)", req.url);
                    next();
                }
            });

            // Parcel application
            app.use(bundler.middleware());

            app.listen(8080);
        }else if(buildtype == "release"){
            //const input = Path.join(__dirname, "../index_release.html");
            const input = "release/index_release.html";
            // generate bootloader
            if(! fs.existsSync("release")){
                fs.mkdirSync("release");
            }
            genboot("release/boot.scm", lst);
            writeconfig("release/appconfig.js",approot,extra);

            deploysource("release", "index_release.html");
            deploysource("release", "index_release.js");


            // Copy asset files to the destination
            lst.forEach(e => {
                var source = e.dir + "/" + e.pth;
                var dest = e.pth;
                fse.copySync(source, "release/" + dest);
            });
            // Bundle
            var options = { watch: false, detailedReport: true,
                outFile: "index.html",
                outDir: "./release",
                minify: true,
                scopeHoist: false,
                sourceMaps: false,
                publicUrl: (approot ? approot : "")

            };
            var bundler = new bd(input, options);
            bundler.bundle();
        }else{
            throw "Unknown build type";
        }
    };

    // Generate bootstrap filelist
    var by = require("@yuniscm/biwasyuni/biwasyuni_node.js");
    console.log("yuniroot = ", yuniroot);
    by.gen_filelist(yuniroot, libpath, progs, lst => appprovider(lst, 
                                                                 approot,
                                                                 extra));
}

function run(config){
    do_process(config.buildtype, 
               config.yuniroot, 
               config.libpath, 
               config.progs,
               config.approot,
               config.extra);
}

module.exports = {run:run};
