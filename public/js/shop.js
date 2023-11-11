function addToWishlist(productId, event) {
    event.preventDefault(); // Prevent the default navigation behavior

    fetch('/wishlist/' + productId, {
        method: 'POST', // Change the HTTP method to POST
        headers: {
            'Content-Type': 'application/json', // Set content type to JSON
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.message) {
                console.log('message')
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: `${data.message}`,
                    // footer: '<a href="">Why do I have this issue?</a>'
                })
            } else {

                console.log('Success:', data);
                Swal.fire('Successfully Added to Wishlist')
                // window.location.href = '/wishlist'
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}