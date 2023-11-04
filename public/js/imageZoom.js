$(document).ready(function(){
    // const defaultZoomingImage = document.getElementById("defulatZoomingImg")
    // $("#selectedImage").attr("src", defaultZoomingImage)
    var options = {
        zoomType: 'lens',
        width: 400,
        zoomWidth: 400,
        offset: {vertical: 0, horizontal: 20
        },
        onZoomIn: function () {
            // Change background color during zoom in
            $("#img-container").css("background-color", "#ffff");
        },
        onZoomOut: function () {
            // Reset background color after zoom out
            $("#img-container").css("background-color", "transparent");
        }
    };
    new ImageZoom(document.getElementById("img-container"), options); 


})


$(".img-thumbnail").click(function (){
    console.log("clicked");
    var selectedImageSrc = $(this).attr("src")
    if (window.imageZoomInstance) {
        window.imageZoomInstance.destroy();
    }
    $("#selectedImage").attr("src",selectedImageSrc);
    var options = {
        zoomType: 'lens',
        width: 400,
        zoomWidth: 400,
        offset: {vertical: 0, horizontal: 20
        },
        onZoomIn: function () {
            // Change background color during zoom in
            $("#img-container").css("background-color", "#ffff");
        },
        onZoomOut: function () {
            // Reset background color after zoom out
            $("#img-container").css("background-color", "transparent");
        }
    };
    new ImageZoom(document.getElementById("img-container"), options); 
})

