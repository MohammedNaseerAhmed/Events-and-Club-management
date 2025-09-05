import React from 'react';
import { Mail, Phone, MapPin, Instagram, ExternalLink, Heart } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/ieeevnrvijet', handle: '@ieeevnrvijet' },
    { name: 'IEEE Main', icon: ExternalLink, url: 'https://ieee.org', handle: 'IEEE.org' }
  ];

  const quickLinks = [
    { name: 'About VNR VJIET', href: '#about' },
    { name: 'Academic Calendar', href: '#calendar' },
    { name: 'Student Portal', href: '#portal' },
    { name: 'Campus Map', href: '#map' },
    { name: 'Library', href: '#library' },
    { name: 'Placements', href: '#placements' }
  ];

  const clubLinks = [
    { name: 'IEEE Student Branch', href: '#ieee' },
    { name: 'Computing Society', href: '#computing' },
    { name: 'Cultural Committee', href: '#cultural' },
    { name: 'Sports Committee', href: '#sports' },
    { name: 'Photography Club', href: '#photography' },
    { name: 'Social Service Club', href: '#social' }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-16">
          {/* College Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">V</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">VNR VJIET</h3>
                  <p className="text-blue-200 text-sm">Student Clubs & Events</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Empowering students through innovative clubs, exciting events, and collaborative learning experiences.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span className="text-sm">Bachupally, Hyderabad, Telangana 500090</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="w-5 h-5 text-green-400" />
                <span className="text-sm">+91 40 2300 5001</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="w-5 h-5 text-purple-400" />
                <span className="text-sm">info@vnrvjiet.in</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Student Clubs */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Student Clubs</h4>
            <ul className="space-y-3">
              {clubLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-purple-400 transition-colors duration-200 text-sm flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media & Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Stay Connected</h4>

            {/* Social Links */}
            <div className="space-y-4 mb-6">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{social.name}</div>
                      <div className="text-xs text-gray-400">{social.handle}</div>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Newsletter Signup */}
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-white">Event Updates</h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-r-lg hover:shadow-lg transition-all duration-200">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white/10 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-300 text-sm">
              <span>© 2024 VNR VJIET. All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">Made with</span>
              <Heart className="w-4 h-4 text-red-400 hidden md:inline" />
              <span className="hidden md:inline">by Students</span>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <a href="#privacy" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#terms" className="text-gray-300 hover:text-purple-400 transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#contact" className="text-gray-300 hover:text-pink-400 transition-colors duration-200">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
    </footer>
  );
};

export default Footer;
