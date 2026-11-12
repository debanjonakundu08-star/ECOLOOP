import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, Mail, Phone, MapPin, ArrowUpRight, ShieldCheck, Leaf } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-[#041a10] via-[#02130b] to-[#010c07] text-slate-300 pt-16 pb-12 border-t border-emerald-500/20 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-emerald-900/40">

          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-forest-950 font-black shadow-md">
                <Recycle className="w-5 h-5 text-forest-950" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Eco<span className="text-emerald-400">Loop</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Turning Leftovers into Leverages. A dedicated B2B circular economy marketplace connecting commercial waste generators with industrial recyclers and remanufacturers across India.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-emerald-400/90 font-medium">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/50 border border-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified B2B Network
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/50 border border-emerald-800">
                <Leaf className="w-4 h-4 text-emerald-400" />
                Zero Landfill Mission
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/marketplace" className="hover:text-emerald-400 transition-colors">
                  Explore Marketplace
                </Link>
              </li>
              <li>
                <Link to="/seller/add-listing" className="hover:text-emerald-400 transition-colors">
                  Add New Listing
                </Link>
              </li>
              <li>
                <Link to="/buyer/dashboard" className="hover:text-emerald-400 transition-colors">
                  Buyer Hub
                </Link>
              </li>
              <li>
                <Link to="/seller/dashboard" className="hover:text-emerald-400 transition-colors">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-emerald-400 transition-colors">
                  Track Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Material Types</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/marketplace?category=Paper/Cardboard" className="hover:text-emerald-400">Paper & Cardboard</Link></li>
              <li><Link to="/marketplace?category=Plastic" className="hover:text-emerald-400">HDPE & Polymer Scrap</Link></li>
              <li><Link to="/marketplace?category=Metal" className="hover:text-emerald-400">Ferrous & Non-Ferrous</Link></li>
              <li><Link to="/marketplace?category=Textile" className="hover:text-emerald-400">Cotton & Textile Trims</Link></li>
              <li><Link to="/marketplace?category=Wood" className="hover:text-emerald-400">Wood Pallets & Chips</Link></li>
              <li><Link to="/marketplace?category=Food waste" className="hover:text-emerald-400">Organic Food Waste</Link></li>
            </ul>
          </div>

          {/* Contact & Regional Hubs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Regional Hubs</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Kolkata & Howrah (HQ)</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Siliguri Industrial Cluster</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Guwahati Northeast Hub</span>
              </li>
              <li className="flex items-center gap-2 pt-2 text-emerald-300">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>support@ecoloop.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} EcoLoop Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-emerald-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-emerald-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-emerald-400 cursor-pointer">Security Protocol</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
