const ejs = require('ejs');
const pdf = require('html-pdf');
const fs = require('fs');
module.exports ={
  downloadPdf : (req,res,orders,startDate,endDate,totalSales)=>{
    
    // Load your EJS template
    // console.log("i am here at download pdf")
    const template = fs.readFileSync('utilty/templateSR.ejs', 'utf-8');
    
    // Compile the template with your data
    const html = ejs.render(template, { orders, startDate, endDate,totalSales });
    
    // Options for html-pdf
    const pdfOptions = {
        format: 'Letter',
        orientation: 'portrait',
    };
    
    // Convert HTML to PDF
    pdf.create(html, pdfOptions).toFile(`public/SRpdf/sales-report-${startDate}-${endDate}.pdf`, (err, response) => {
        if (err) return console.log(err);
        res.status(200).download(response.filename);
    });
    
    }
}
