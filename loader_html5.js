// Implements HTML5 fetch API shim for biwasyuni

var loadfs = function(baseurl) {
    var me = {
        readFile: function(path, coding, callback) {
            window.fetch(baseurl + path,{credentials: "same-origin"})
                .then(function(res){
                    if(res.ok){
                        res.text().then(function(text){
                            callback(false, text);
                        });
                    }else{
                        callback("Error", false);
                    }
                });
        }
    };
    return me;
};

module.exports = {
    loadfs:loadfs
}
