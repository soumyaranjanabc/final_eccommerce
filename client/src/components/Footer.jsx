// client/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    // You should add styling for the 'footer' class to App.css
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section about">
                    <h3>ConstroMart</h3>
                    <p>Your reliable source for high-quality construction materials. Building the future, one material at a time.</p>
                </div>
                <div className="footer-section links">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        {/* You would add an Inquiry/Contact page here */}
                        <li><Link to="/inquiry">Contact/Inquiry</Link></li> 
                        <li><Link to="/terms">Terms of Service</Link></li>
                    </ul>
                </div>
                <div className="footer-section contact">
                    <h3>Contact Us</h3>
                    <p>Email: support@constromart.com</p>
                    <p>Phone: +1 (555) 123-4567</p>
                </div>
            </div>
            <div className="footer-bottom">
                &copy; {new Date().getFullYear()} ConstroMart E-commerce. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;