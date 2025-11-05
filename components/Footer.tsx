
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white text-center p-4 mt-12">
      <p>جميع الحقوق محفوظة لقناة Jana Kids &copy; {new Date().getFullYear()}. تم التحديث للمزامنة.</p>
    </footer>
  );
};

export default Footer;