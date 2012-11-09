$(document).ready(function() {
    var s = document.createElement("script");
    s.type = "text/javascript";
    var type = $($('div')[1]).attr('class')
    s.src = type.toLowerCase() + ".js"
    $("head").append(s); 
});
