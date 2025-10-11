import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold">
                Shop<span className="text-indigo-600">Vibe</span>
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              Your Style, Your Vibe, Delivered Daily
            </p>
            <p className="text-sm text-gray-500">
              Discover fashion and accessories that match your unique style.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-indigo-600">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/listing" className="hover:text-indigo-600">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-indigo-600">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/listing?category=clothing" className="hover:text-indigo-600">
                  Clothing
                </Link>
              </li>
              <li>
                <Link href="/listing?category=accessories" className="hover:text-indigo-600">
                  Accessories
                </Link>
              </li>
              <li>
                <Link href="/listing?gender=men" className="hover:text-indigo-600">
                  Men's Fashion
                </Link>
              </li>
              <li>
                <Link href="/listing?gender=women" className="hover:text-indigo-600">
                  Women's Fashion
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Email: support@shopvibe.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Hours: Mon-Fri 9AM-6PM</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} ShopVibe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}