//Import the library into your project
var easyinvoice = require('easyinvoice')
const fs = require('fs')
const path = require("path");



module.exports = {
    order: async (order) => {
        // console.log(order,"utitlity")
        var data = {
            // Customize enables you to provide your own templates
            // Please review the documentation for instructions and examples
            "customize": {
                //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html 
            },

            "images": {
                "background": "https://public.easyinvoice.cloud/pdf/sample-background.pdf"
            },
            "sender": {
                "company": "Car Care",
                "address": "MM Ali Road",
                "zip": "678584",
                "city": "Calicut",
                "country": "Kerala"
            },
            "client": {
                "company": order.ShippedAddress.Name,
                "address": order.ShippedAddress.Address,
                "zip":order.ShippedAddress.Pincode ,
                "city": order.ShippedAddress.City,
                "state":order.ShippedAddress.State,
                "Mob No":order.ShippedAddress.Mobaile
            },
            "information": {
                "number": order._id,
                "date": order.OrderedDate,
                "due-date": order.OrderedDate
            },
            "products": [
                {
                    "quantity": "2",
                    "description": "Test1",
                    "tax-rate": 6,
                    "price": order.TotalAmount
                }
            ],
            "bottom-notice": "Thank You For Your Purchase",
            "settings": {
                "currency": "USD",
                "tax-notation": "vat",
                "margin-top": 50,
                "margin-right": 50,
                "margin-left": 50,
                "margin-bottom": 25
            },
        
        // Translate your invoice to your preferred language
        "translate": {
            // "invoice": "FACTUUR",  // Default to 'INVOICE'
            // "number": "Nummer", // Defaults to 'Number'
            // "date": "Datum", // Default to 'Date'
            // "due-date": "Verloopdatum", // Defaults to 'Due Date'
            // "subtotal": "Subtotaal", // Defaults to 'Subtotal'
            // "products": "Producten", // Defaults to 'Products'
            // "quantity": "Aantal", // Default to 'Quantity'
            // "price": "Prijs", // Defaults to 'Price'
            // "product-total": "Totaal", // Defaults to 'Total'
            // "total": "Totaal", // Defaults to 'Total'
            // "vat": "btw" // Defaults to 'vat'
        }
    }

    //Create your invoice! Easy!
    const filePath = path.join(__dirname, '..public', 'pdf', 'invoice.pdf');
    easyinvoice.createInvoice(data, async function (result) {
        //The response will contain a base64 encoded PDF file
        // console.log('PDF base64 string: ', result.pdf);
        await fs.writeFileSync(`./public/pdf/${order._id}.pdf`, result.pdf, 'base64');
        const path=`./public/pdf/${order._id}.pdf`
        return path
    });

}
}