
export const directPrint = (content: string, options?: { 
  width?: number; 
  height?: number; 
  margins?: string;
}) => {
  const printWindow = window.open('', '_blank', 'width=300,height=600');
  
  if (!printWindow) {
    console.error('Unable to open print window. Please allow popups.');
    return;
  }

  const { width = 80, height = 'auto', margins = '5mm' } = options || {};

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt</title>
      <style>
        @media print {
          @page {
            size: ${width}mm ${height};
            margin: ${margins};
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          margin: 0;
          padding: 10px;
          width: ${width}mm;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-bottom: 1px dashed #000; margin: 5px 0; }
        .receipt-item {
          display: flex;
          justify-content: space-between;
          margin: 2px 0;
        }
      </style>
    </head>
    <body>
      ${content}
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() {
            window.close();
          }, 1000);
        }
      </script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
};

export const formatReceipt = (transaction: any, storeDetails: any) => {
  const date = new Date().toLocaleString();
  
  let receipt = `
    <div class="center bold">${storeDetails.name || 'Grocery Store'}</div>
    <div class="center">${storeDetails.address || ''}</div>
    <div class="center">${storeDetails.phone || ''}</div>
    <div class="line"></div>
    <div class="center">SALES RECEIPT</div>
    <div>Date: ${date}</div>
    <div>Bill No: ${transaction.billNumber || 'N/A'}</div>
    <div class="line"></div>
  `;

  transaction.items.forEach((item: any) => {
    receipt += `
      <div class="receipt-item">
        <span>${item.name}</span>
        <span>₹${item.price}</span>
      </div>
      <div class="receipt-item">
        <span>${item.quantity} x ₹${item.price}</span>
        <span>₹${(item.quantity * item.price).toFixed(2)}</span>
      </div>
    `;
  });

  receipt += `
    <div class="line"></div>
    <div class="receipt-item bold">
      <span>Subtotal:</span>
      <span>₹${(transaction.total - transaction.tax).toFixed(2)}</span>
    </div>
    <div class="receipt-item">
      <span>Tax:</span>
      <span>₹${transaction.tax.toFixed(2)}</span>
    </div>
    <div class="receipt-item bold">
      <span>Total:</span>
      <span>₹${transaction.total.toFixed(2)}</span>
    </div>
    <div class="line"></div>
    <div class="center">Thank you for shopping!</div>
  `;

  return receipt;
};
