$(function(){
    var title = $('#title');
    $.ajax ({
        type:'GET',
        url:'http://localhost:3000/movie/de',
        success: function(data){
            json = JSON.parse(data);
            if(typeof(json) === "object"){
                $.each(json, function(e,a) {
                    title.append('<h3>'+a.title+'</h3>');
                });
            }else{
                console.log('json error');
            }
        }
    });
});
