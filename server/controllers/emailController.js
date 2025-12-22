// server/controllers/emailController.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your preferred service (e.g., SendGrid, Mailgun)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use an App Password for Gmail
    }
});

/**
 * Sends order confirmation email to the customer and notification email to the admin.
 * @param {string} userEmail - Customer's email address.
 * @param {Object} orderDetails - The created order record.
 * @param {Array<Object>} items - The list of items in the order.
 */
const sendOrderConfirmation = async (userEmail, orderDetails, items) => {
    const totalAmount = parseFloat(orderDetails.total_amount).toFixed(2);
    const orderId = orderDetails.id;
    const orderDate = new Date(orderDetails.order_date).toLocaleString();
    const adminEmail = process.env.ADMIN_EMAIL;
    
    // Build HTML list of items
    const itemHtmlList = items.map(item => 
        `<li>${item.name} (${item.quantity} x $${parseFloat(item.price).toFixed(2)})</li>`
    ).join('');

    // --- 1. Customer Email Content ---
    const customerMailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `Order Confirmation #${orderId} - ConstroMart`,
        html: `
            <h2>Thank You for Your Order!</h2>
            <p>Your order (ID: <strong>${orderId}</strong>) has been successfully placed on ${orderDate}.</p>
            <h3>Order Details:</h3>
            <ul>${itemHtmlList}</ul>
            <p><strong>Total Amount Paid: $${totalAmount}</strong></p>
            <p>A separate notification will be sent after processing. Thank you for choosing ConstroMart!</p>
        `,
    };

    // --- 2. Admin Email Content ---
    const adminMailOptions = {
        from: process.env.EMAIL_USER,
        to: adminEmail,
        subject: `NEW ORDER #${orderId} placed by ${userEmail}`,
        html: `
            <h3>New Order Received</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Customer Email:</strong> ${userEmail}</p>
            <p><strong>Total:</strong> $${totalAmount}</p>
            <p>Items Ordered: <ul>${itemHtmlList}</ul></p>
        `,
    };

    try {
        await transporter.sendMail(customerMailOptions);
        await transporter.sendMail(adminMailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

/**
 * Sends inquiry email to the admin.
 * @param {Object} inquiryDetails - Details of the customer inquiry.
 */
const sendInquiryEmail = async (inquiryDetails) => {
    // This function will be called by a separate inquiry route if you implement a contact form.
    const adminEmail = process.env.ADMIN_EMAIL;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: adminEmail,
        subject: `NEW WEBSITE INQUIRY from ${inquiryDetails.name || 'Anonymous'}`,
        html: `
            <h2>New Customer Inquiry Received</h2>
            <p><strong>Name:</strong> ${inquiryDetails.name || 'N/A'}</p>
            <p><strong>Email:</strong> ${inquiryDetails.email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${inquiryDetails.phone || 'N/A'}</p>
            <h3>Message:</h3>
            <p>${inquiryDetails.message || 'No message content.'}</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending inquiry email:', error);
        return false;
    }
};

module.exports = {
    sendOrderConfirmation,
    sendInquiryEmail,
};