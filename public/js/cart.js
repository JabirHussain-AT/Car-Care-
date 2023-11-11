document.addEventListener("DOMContentLoaded", () => {
    const decreaseButtons = document.querySelectorAll(".decrease-quantity");
    const increaseButtons = document.querySelectorAll(".increase-quantity");
    const couponCheckButton = document.getElementById('couponCheck');
    const couponCodeInput = document.querySelector('input[name="couponCode"]');
    let couponAmount
    let minCouponAmount




    function updateTotalAmount() {
      let totalAmount = 0;
      let totalItems = 0;
      let subtotalAmount = 0;
      let isOutOfStock = false;

      const productRows = document.querySelectorAll('.row.gy-3.mb-4');
      productRows.forEach((row) => {
        const productId = row.querySelector('.decrease-quantity').getAttribute('data-product-id');
        const quantityInput = row.querySelector(`#count_${productId}`);
        const productAmount = parseFloat(row.querySelector(`#productAmount_${productId}`).textContent);
        const availableQuantity = parseInt(quantityInput.getAttribute('data-available-quantity'), 10);
        const enteredQuantity = parseInt(quantityInput.value, 10);

        if (enteredQuantity <= availableQuantity) {
          totalAmount += productAmount;
          subtotalAmount += productAmount;
          totalItems += enteredQuantity;
        } else {
          quantityInput.value = availableQuantity;
          isOutOfStock = true;
        }

        const outOfStockMessage = document.getElementById(`outOfStock_${productId}`);
        if (outOfStockMessage) {
          outOfStockMessage.style.display = 'none';
        }
      });
      const taxRate = 0.18;
      const taxAmount = subtotalAmount * taxRate;

      // Increase total amount by tax
      // totalAmount += taxAmount;no need for increase i think
      if (couponAmount) {
        totalAmount -= couponAmount
      }
      if ((totalAmount + couponAmount) <= minCouponAmount) {
         Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
          if (result.isConfirmed) {
            const couponCodeInput = document.querySelector('input[name="couponCode"]');
            const couponCode = couponCodeInput.value.trim();
            const response = await fetch("/removeCouponapplied", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({couponCode }),
        });

        if (response.ok) {
            
        const couponAmountCell = document.getElementById('couponAmountCell');
        const zero = 0.00
        couponAmountCell.textContent = `Rs - ${zero.toFixed(2)}`;
        console.log(totalAmount,"total amount")
        totalAmount += couponAmount
        console.log(totalAmount,"total amount after coam")
        totalAmountCell.value = `Rs ${totalAmount.toFixed(2)}`;
        hiddenTotalAmount.value = totalAmount.toFixed(2);
          }
        } else {
          console.error("Error updating quantity:", response.statusText);
        }
            Swal.fire({
              title: "Deleted!",
              text: "Your file has been deleted.",
              icon: "success"
            });
          });
        
      }

      // console.log("is it coming or not ",couponAmount)

      const couponAmountCell = document.getElementById('couponAmountCell');
      const totalAmountCell = document.getElementById('totalAmountCell');
      const placeOrderButton = document.getElementById('placeOrderButton');
      const taxAmountCell = document.getElementById('TaxAmountCell');

      if (isOutOfStock) {
        totalAmountCell.value = 'Out of Stock';
        placeOrderButton.disabled = true;
      } else {
        totalAmountCell.value = `Rs ${totalAmount.toFixed(2)}`;
        placeOrderButton.disabled = false;
      }

      const subtotalAmountCell = document.getElementById('subtotalAmountCell');
      subtotalAmountCell.textContent = `Rs ${subtotalAmount.toFixed(2)}`;

      const totalItemsCell = document.getElementById('totalItemsCell');
      totalItemsCell.textContent = `${totalItems} Items`;

      const hiddenTotalAmount = document.getElementById('hiddenTotalAmount');
      hiddenTotalAmount.value = totalAmount.toFixed(2);


      // Update tax amount cell
      taxAmountCell.textContent = `Rs ${taxAmount.toFixed(2)}`;
    }

    async function updateQuantity(productId, change) {
      try {
        const response = await fetch("/updateQuantity", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId, change }),
        });

        if (response.ok) {
          const data = await response.json();
          const quantityInput = document.getElementById(`count_${productId}`);
          const productAmount = document.getElementById(`productAmount_${productId}`);
          const existingValue = productAmount.getAttribute('data-value');

          if (quantityInput) {
            quantityInput.value = data.newQuantity;
            productAmount.textContent = existingValue * data.newQuantity;
            updateTotalAmount();

            const decreaseButton = document.querySelector(`.decrease-quantity[data-product-id="${productId}"]`);
            if (decreaseButton) {
              decreaseButton.disabled = data.newQuantity <= 1;
            }

            const stockMessage = document.getElementById(`stockMessage_${productId}`);
            if (stockMessage.style.display === 'block') {
              stockMessage.style.display = 'none';
            }
          }
        } else {
          console.error("Error updating quantity:", response.statusText);
        }
      } catch (error) {
        console.error("Error updating quantity:", error);
      }
    }

    decreaseButtons.forEach((button) => {
      const productId = button.getAttribute("data-product-id");
      const quantityInput = document.getElementById(`count_${productId}`);
      const initialQuantity = quantityInput ? parseInt(quantityInput.value, 10) : 0;
      button.disabled = initialQuantity <= 1;
    });

    decreaseButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const productId = button.getAttribute("data-product-id");
        updateQuantity(productId, -1);
      });
    });

    increaseButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const productId = button.getAttribute("data-product-id");
        const maxQuantity = parseInt(button.getAttribute("data-max-quantity"), 10);
        const quantityInput = document.getElementById(`count_${productId}`);
        const enteredQuantity = parseInt(quantityInput.value, 10);
        const couponSuccessMessage = document.getElementById('couponSuccessMessage');
        // console.log("couponSuccessMessage:", couponSuccessMessage); 


        if (enteredQuantity < maxQuantity) {
          updateQuantity(productId, 1);
        } else {
          const stockMessage = document.getElementById(`stockMessage_${productId}`);
          if (stockMessage) {
            stockMessage.innerHTML = `Only ${maxQuantity} items in stock`;
            stockMessage.style.display = 'block';
          }
        }
      });
    });

    couponCheckButton.addEventListener('click', async () => {
      const couponCodeInput = document.querySelector('input[name="couponCode"]');
      const couponCode = couponCodeInput.value.trim();


      const subtotalAmountCell = document.getElementById('subtotalAmountCell');
      const subtotalAmount = parseFloat(subtotalAmountCell.textContent.replace('Rs', '').trim());

      if (couponCode) {
        try {
          const response = await fetch("/user/validateCoupon", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ couponCode }),
          });

          if (response.ok) {
            const data = await response.json();

            if (data) {
              const couponAmountCell = document.getElementById('couponAmountCell');
              minCouponAmount = parseFloat(data.minAmount)
              couponAmount = parseFloat(data.couponAmount);
              const totalAmountCell = document.getElementById('totalAmountCell');
              const hiddenTotalAmount = document.getElementById('hiddenTotalAmount');

              if (totalAmountCell && hiddenTotalAmount) {
                let currentTotalAmount = parseFloat(hiddenTotalAmount.value);
                currentTotalAmount -= couponAmount;

                totalAmountCell.value = `Rs ${currentTotalAmount.toFixed(2)}`;
                hiddenTotalAmount.value = currentTotalAmount.toFixed(2);
                couponAmountCell.textContent = `Rs - ${couponAmount.toFixed(2)}`;

                // Show the success message
                console.log("Coupon applied successfully!");
                console.log("couponSuccessMessage:", couponSuccessMessage,); // Log the element
                couponSuccessMessage.style.display = 'block';

                // Hide the success message after a few seconds (adjust the timeout as needed)
                setTimeout(() => {
                  couponSuccessMessage.style.display = 'none';
                }, 5000);

                console.log("Coupon applied successfully!");
              }
            } else {
              console.error("Invalid coupon code. Please try again.");
            }
          } else {
            console.error("Error validating coupon:", response.statusText);
          }
        } catch (error) {
          console.error("Error validating coupon:", error);
        }
      }
    });
    couponCheckButton.addEventListener('click', async (event) => {
      event.preventDefault(); // Prevent the default form submission behavior

      const couponCodeInput = document.querySelector('input[name="couponCode"]');
      const couponCode = couponCodeInput.value.trim();
      console.log(couponCode)

      if (couponCode) {
        try {
          console.log("coupon Inside Try")
          const subtotalAmountCell = document.getElementById('subtotalAmountCell');
          const subtotalAmount = parseFloat(subtotalAmountCell.textContent.replace('Rs', '').trim());
          const response = await fetch("/validateCoupon", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ couponCode, subtotalAmount }),
          });

          if (response.ok) {
            const data = await response.json();

            if (data.status) {
              minCouponAmount = parseFloat(data.minAmount)
              // console.log(minCouponAmount,"ill")
              couponAmount = parseFloat(data.couponAmount);
              const totalAmountCell = document.getElementById('totalAmountCell');
              const hiddenTotalAmount = document.getElementById('hiddenTotalAmount');

              if (totalAmountCell && hiddenTotalAmount) {
                let currentTotalAmount = parseFloat(hiddenTotalAmount.value);
                currentTotalAmount -= couponAmount;
                console.log(data.couponAmount, "hihi")
                totalAmountCell.value = `Rs ${currentTotalAmount.toFixed(2)}`;
                hiddenTotalAmount.value = currentTotalAmount.toFixed(2);

                console.log("couponSuccessMessage:", couponSuccessMessage); // Log the element
                couponSuccessMessage.style.display = 'block';

                // Hide the success message after a few seconds (adjust the timeout as needed)
                setTimeout(() => {
                  couponSuccessMessage.style.display = 'none';
                }, 5000);

                couponAmountCell.textContent = `Rs -${couponAmount.toFixed(2)}`;
                console.log("Coupon applied successfully!");
              }
            } else {
              // console.log(data.message,"duaehuawednuwedjsdchjusdlaclz")
              if (data.message) {
                console.log("hiii")
                const messageContainer = document.getElementById('messageContainer');
                messageContainer.style.display = 'block';
                messageContainer.innerHTML = data.message;
                setTimeout(() => {
                  messageContainer.style.display = 'none';
                }, 5000);

              } else {
                // console.log("couponSuccessMessage:", couponSuccessMessage); // Log the element
                couponWarningMessage.style.display = 'block';

                // Hide the success message after a few seconds (adjust the timeout as needed)
                setTimeout(() => {
                  couponWarningMessage.style.display = 'none';
                  location.reload()
                }, 5000);

                console.error("Invalid coupon code. Please try again.");

              }
            }
          } else {
            console.error("Error validating coupon:", response.statusText);
          }
        } catch (error) {
          console.error("Error validating coupon:", error);
        }
      }
    });

    updateTotalAmount();
  });
  // 
  //show out of stock messages from array 
  function showOutOfStockMessages(outOfStockProducts) {
    outOfStockProducts.forEach((productId) => {
      const outOfStockMessage = document.getElementById(`outOfStock_${productId}`);
      if (outOfStockMessage) {
        outOfStockMessage.style.display = 'block';
      }
    });
  }



  // 
  $(document).ready(function () {
    $('#placeOrderButton').click(function () {
      // console.log(" Inside the confim Stock ")
      $.ajax({
        url: '/confirmStock',
        type: 'GET',
        success: function (data) {
          // console.log(data, "data")
          if (data.ConfirmedStock === false) {
            // console.log(`${data.message}`)
            showOutOfStockMessages(data.outOfStockProducts);

            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Product Went Out Of Stock!',
              // footer: '<a href="">Why do I have this issue?</a>',

            })


          } else {
            const formData = $('#checkoutForm').serialize();
            $.ajax({
              url: '/cart',  // Change the URL to your server endpoint
              type: 'POST',         // Adjust the HTTP method if needed
              data: formData,
              success: function (data) {
                // Handle the success response
                window.location.href = '/checkout'
                console.log('Order placed successfully:');
                // You might want to redirect or show a success message here
              },
              error: function (error) {
                // Handle the error response
                console.error('Error placing order:', error.statusText);
              }
            });
          }
          console.log('stock confimred successfully')

        },
        error: function (error) {
          // Handle the error response
          console.error('Error confirming stock:', error.statusText);
        }
      })
    })
  })