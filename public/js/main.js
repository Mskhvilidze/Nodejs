$(document).ready(function(){
    $('.delete-article').on('click', function(e){
        let $target = $(e.target);
        const id = $target.attr('data-id');

        $.ajax({
            type: 'DELETE',
            url: '/article/' + id,
            success: function(response){
                alert('Deleting Article');
                window.location.href='/';
            },
            error: function(err){
                console.log("Ajax, Delete Error! " + err);
            }
        })
    });

    $('.update').on('click', function(e){
        let $target = $(e.target);
        const id = $target.attr('data-id');
        const name = $('.title').val();
    $.ajax({
        type: 'post',
        url: '/article/edit/' + id,
        success: function(response){
            alert(response + name + ' aktualisiert');
            window.location.href='/';
        },
        error: function(err){
            console.log('Ajax, Post Error! ' + err);
        }
    });
});
});
