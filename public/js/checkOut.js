document.addEventListener("DOMContentLoaded", () => {
  
    const confirmOrderButton = document.querySelector('#rzp-button1');
    confirmOrderButton.addEventListener('click', async () => {
      const selectedAddressRadio = document.querySelector('input[name="address"]:checked');
  
      //check if it has value for submitting other wise trigger a swal
      if (!selectedAddressRadio) {
      // alert('Please add an address before confirming the order.');
      Swal.fire({
             icon: 'error',
             title: 'Oops...',
             text: 'Forget to add Shipping Address',
             footer: '<button  id="addAddressButton" class="btn btn-link" data-bs-toggle="modal" data-bs-target="#addAddressModal"> <i class="fas fa-plus-circle"></i> Add Address</button>',
  })
       const addAddressButton = document.getElementById('addAddressButton');
       addAddressButton.addEventListener('click',()=>{
        Swal.close();
        $('#addAddressModal').modal('show');
      })
      return; // Stop further execution
    }
  
      const fullAddressDetails = {
        name: selectedAddressRadio ? selectedAddressRadio.dataset.name : '',
        address: selectedAddressRadio ? selectedAddressRadio.dataset.address : '',
        pincode: selectedAddressRadio ? selectedAddressRadio.dataset.zip : '',
        city: selectedAddressRadio ? selectedAddressRadio.dataset.city : '',
        state: selectedAddressRadio ? selectedAddressRadio.dataset.state : '',
        mobile: selectedAddressRadio ? selectedAddressRadio.dataset.mobile : '',
      };
  
      //check stock is left or not
      const stockCheckResponse = await checkStockConfirmation();
      if (!stockCheckResponse.ConfirmedStock) {
          Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Some products are out of stock',
              footer: '<a href="/cart">View Out of Stock Products</a>'
          });
          return; // Stop further execution
      }
      async function checkStockConfirmation() {
      try {
          const response = await fetch('/confirmStock', {
              method: 'GET',
          });
  
          if (!response.ok) {
              throw new Error('Failed to confirm stock');
          }
  
          const result = await response.json();
          return result;
      } catch (error) {
          console.error('Error:', error.message);
          return { ConfirmedStock: false };
      }
  }
      // 
      
      
      console.log('Selected Address:', fullAddressDetails);
      try {
        const response = await fetch('/checkOut', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            selectedAddress: JSON.stringify(fullAddressDetails),
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
          }),
        });
         if(response.cod===true){
          location.href(`/orderPlaced/${response.orderid}`)
         }
        if (!response) {
          throw new Error('Failed to create Razorpay order');
        }
          
        const orderData = await response.json();
        // console.log(orderData,"its order data from the ajax in checkout page")
        if(orderData.cod===true){
          location.href = `/orderPlaced/${orderData.orderid}`
         }else if(orderData.walletPurchase === true){
            location.href = `/orderPlaced/${orderData.orderid}`
         }else if(orderData.message){
               // Display the message in the walletWarning paragraph tag
                const walletWarning = document.getElementById('walletWarning');
                walletWarning.innerText = orderData.message;
                setTimeout(() => {
                  location.href
                }, 3000);
         }
        console.log(orderData.paymentDetials.response.amount,"hi this is the amount")
        console.log('Razorpay Order Data:', orderData);
  
        // Use orderData to configure the Razorpay options and initiate payment
        console.log(orderData.paymentDetials.response.order.id,"order id ")
        var options = {
          "key": "rzp_test_sVxmHMGOnZJCCm",
          "amount": orderData.paymentDetials.response.amount,
          "currency": orderData.currency,
          "name": "Car Care",
          "description": "Test Transaction",
          "image": "https://example.com/your_logo",
          "order_id": orderData.paymentDetials.response.order.id,
          "handler": function (response) {
            console.log(response,"rsponse in handler")
            verifyPayment(response,orderData.paymentDetials.order)
            
           },
          "prefill": {
            "name": " safeer",
            "email": "gaurav.kumar@example.com",
            "contact": "9000090000",
          },
          "notes": {
            "address": "Razorpay Corporate Office",
          },
          "theme": {
            "color": "#3399cc",
          },
        };
  
        var rzp1 = new Razorpay(options);
        rzp1.on('payment.failed', function (response) {
          alert(response.error.code);
          alert(response.error.description);
          alert(response.error.source);
          alert(response.error.step);
          alert(response.error.reason);
          alert(response.error.metadata.order_id);
          alert(response.error.metadata.payment_id);
        });
  
        rzp1.open();
      } catch (error) {
        console.error('Error:', error.message);
      }
    });
  
    
  
    function verifyPayment(payment, order) {
      console.log('now in verifyPayment')
      $.ajax({
        url:'/verify-payment',
        data : {
          payment,
          order
        },
        method : "post",
        success:(response)=>{
          if(response.success){
            console.log(order,"order reached success stage of the razor pay");
            // alert("Payment Successfull")
            location.href = `/orderPlaced/${order._id}`
          }else{
            alert("Payment Failed")
          }
        }
      })
  }
  
  });