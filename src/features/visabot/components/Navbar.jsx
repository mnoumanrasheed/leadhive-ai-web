import React from "react";

export const Navbar = () => {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <div className="text-xl font-bold text-gray-800">Logo</div>
      <div className="flex space-x-6 text-gray-600 font-medium mx-auto">
        <a href="#" className="hover:text-blue-600 transition">Home</a>
        <a href="#" className="hover:text-blue-600 transition">About</a>
        <a href="#" className="hover:text-blue-600 transition">Services</a>
        <a href="#" className="hover:text-blue-600 transition">Contact</a>
      </div>
      <div className="w-12"></div>
    </nav>
  );
};