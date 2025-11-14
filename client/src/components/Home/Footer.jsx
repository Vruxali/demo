function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-6 md:px-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h3 className="text-white font-bold text-xl mb-2">BloodConnect</h3>
          <p className="text-sm">
            Connecting lives through blood donation. Building a healthier community together.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#">🌐</a>
            <a href="#">🐦</a>
            <a href="#">💼</a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-1 text-sm">
            <li>About Us</li>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
            <li>FAQs</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-2">Contact</h4>
          <ul className="space-y-1 text-sm">
            <li>📧 info@bloodconnect.com</li>
            <li>📞 (555) 123-4567</li>
            <li>🏠 123 Health St, Medical City</li>
          </ul>
        </div>
      </div>

      <p className="text-center text-xs mt-10 text-gray-500">
        © 2025 BloodConnect. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
