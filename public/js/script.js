$(document).ready(function(){
    $('input[name="productType"]').change(function () {
        if ($(this).val() === 'Tyre') {
            $('#watchColorInput').show();
            $('#perfumeQuantityDropdown').hide();
        } else if ($(this).val() === 'Oil') {
            $('#perfumeQuantityDropdown').show();
            $('#watchColorInput').hide();
        } else {
            // Handle other cases if needed
            $('#watchColorInput').hide();
            $('#perfumeQuantityDropdown').hide();
        }
    });
    const fileInput = $('#productImage');
            const uploadedImages = [
                $('#uploadedImage1'),
                $('#uploadedImage2'),
                $('#uploadedImage3')
            ];
        
            fileInput.change(function () {
                const files = fileInput[0].files;
        
                // Show delete buttons for uploaded images
                for (let i = 0; i < uploadedImages.length; i++) {
                    if (i < files.length) {
                        const file = files[i];
                        const reader = new FileReader();
        
                        reader.onload = function (e) {
                            // Set the src attribute of the corresponding <img> element
                            uploadedImages[i].attr('src', e.target.result);
                        };
        
                        reader.readAsDataURL(file);
        
                        // Show the delete button
                        $('.delete-image[data-index="' + (i + 1) + '"]').show();
                    } else {
                        uploadedImages[i].attr('src', ''); // Clear the src attribute
                        // Hide the delete button
                        $('.delete-image[data-index="' + (i + 1) + '"]').hide();
                    }
                }
            });

    $(".img-thumbnail").click(function (){
        console.log("clicked");
        var selectedImageSrc = $(this).attr("src")
        $("#selectedImage").attr("src",selectedImageSrc);
    })
    
})
