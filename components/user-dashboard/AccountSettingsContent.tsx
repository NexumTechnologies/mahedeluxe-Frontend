"use client";

import Image from "next/image";
import {
  User,
  Settings,
  Sliders,
  ChevronRight,
  Copy,
  LogOut,
  ArrowLeft,
  Camera,
  Shield,
  Bell,
  Lock,
  Mail,
  Phone,
  Globe,
  CreditCard,
  FileText
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { clearAllClientAuthState } from "@/lib/authStorage";

type SettingsView = "main" | "profile" | "member_profile" | "connected_accounts" | "tax_info" | "password" | "email" | "phone" | "privacy" | "notifications" | "ads";

export default function AccountSettingsContent() {
  const [currentView, setCurrentView] = useState<SettingsView>("main");
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    clearAllClientAuthState();
    router.replace("/");
    router.refresh();
  };

  const handleCopyMemberId = () => {
    navigator.clipboard.writeText("eg39126748602orzd");
  };

  const renderBreadcrumb = (title: string) => (
    <button 
      onClick={() => setCurrentView("main")}
      className="flex items-center gap-2 text-blue hover:text-orange transition-colors mb-6 group"
    >
      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      <span className="font-semibold text-lg">Back to settings / {title}</span>
    </button>
  );

  const renderSectionHeader = (icon: any, title: string, description: string) => (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue to-blue-600 flex items-center justify-center shadow-lg shadow-blue/20">
        {icon}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
    </div>
  );

  if (currentView === "main") {
    return (
      <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Profile Banner */}
        <div className="rounded-3xl p-6 lg:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-gradient-to-r from-blue via-blue-700 to-indigo-900 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-orange/20 rounded-full blur-3xl" />
          
          <div className="flex items-center gap-6 relative z-10">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-2xl ring-4 ring-white/10">
                <Image
                  src="/dummy-product.png"
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 bg-orange text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User Info */}
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-2 tracking-tight">Mohamed Hassan</h2>
              <p className="text-blue-100 opacity-90 mb-1 flex items-center gap-2">
                <Mail className="w-4 h-4" /> hs****@gmail.com
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-blue-100 opacity-80">ID: eg39126748602orzd</p>
                <button
                  onClick={handleCopyMemberId}
                  className="hover:opacity-80 transition-opacity p-1.5 rounded-lg hover:bg-white/10"
                  title="Copy Member ID"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 relative z-10">
            <button 
              onClick={() => setCurrentView("profile")}
              className="px-8 py-3 bg-white/10 backdrop-blur-md text-white rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/20 shadow-xl"
            >
              Edit Profile
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-8 py-3 bg-orange text-white rounded-2xl font-bold hover:shadow-orange/30 hover:shadow-2xl transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Sign out
            </button>
          </div>
        </div>

        {/* Settings Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Account Information */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shadow-inner">
                <User className="w-6 h-6 text-blue" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Account Information
              </h3>
            </div>
            
            <div className="space-y-2">
              {[
                { label: "My Profile", view: "profile" as SettingsView, icon: <User className="w-4 h-4" /> },
                { label: "Member Profile", view: "member_profile" as SettingsView, icon: <FileText className="w-4 h-4" /> },
                { label: "Connected Accounts", view: "connected_accounts" as SettingsView, icon: <Globe className="w-4 h-4" /> },
                { label: "Tax Information", view: "tax_info" as SettingsView, icon: <CreditCard className="w-4 h-4" /> }
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => setCurrentView(item.view)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-blue-50/50 transition-all text-left group border border-transparent hover:border-blue/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-blue/10 group-hover:text-blue transition-colors">
                      {item.icon}
                    </span>
                    <span className="text-lg font-semibold text-gray-700 group-hover:text-blue transition-colors">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shadow-inner">
                <Shield className="w-6 h-6 text-orange" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Account Security
              </h3>
            </div>
            
            <div className="space-y-2">
              {[
                { label: "Change Password", view: "password" as SettingsView, icon: <Lock className="w-4 h-4" /> },
                { label: "Change Email", view: "email" as SettingsView, icon: <Mail className="w-4 h-4" />, detail: "hs****@gmail.com" },
                { label: "Change Phone", view: "phone" as SettingsView, icon: <Phone className="w-4 h-4" /> }
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => setCurrentView(item.view)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-orange-50/50 transition-all text-left group border border-transparent hover:border-orange/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-orange/10 group-hover:text-orange transition-colors">
                      {item.icon}
                    </span>
                    <div>
                      <span className="text-lg font-semibold text-gray-700 group-hover:text-orange transition-colors">
                         {item.label}
                      </span>
                      {item.detail && <p className="text-xs text-gray-400">{item.detail}</p>}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-orange group-hover:translate-x-1 transition-all" />
                </button>
              ))}
              <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-red-50/50 transition-all text-left group border border-transparent hover:border-red-100">
                <span className="text-lg font-semibold text-red-500 group-hover:text-red-600 transition-colors pl-11">
                  Delete account
                </span>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 lg:col-span-2 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shadow-inner">
                <Sliders className="w-6 h-6 text-blue" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Preferences
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Privacy Settings", view: "privacy" as SettingsView, icon: <Shield className="w-4 h-4" />, desc: "Adjust your visibility" },
                { label: "Email Preferences", view: "notifications" as SettingsView, icon: <Bell className="w-4 h-4" />, desc: "Choose what you hear" },
                { label: "Ads Preferences", view: "ads" as SettingsView, icon: <Settings className="w-4 h-4" />, desc: "Personalize your ads" }
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => setCurrentView(item.view)}
                  className="flex flex-col p-6 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-2xl hover:scale-105 transition-all text-left group border border-transparent hover:border-blue/10"
                >
                  <div className="flex items-center justify-between mb-4 w-full">
                    <span className="p-3 rounded-2xl bg-white text-blue shadow-sm group-hover:bg-blue group-hover:text-white transition-colors">
                      {item.icon}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue transition-all" />
                  </div>
                  <span className="text-xl font-extrabold text-gray-800 mb-1 group-hover:text-blue transition-colors">
                    {item.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sub-section detail views
  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      {/* Account Information Views */}
      {currentView === "profile" && (
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl border border-gray-100">
          {renderBreadcrumb("Account Information")}
          {renderSectionHeader(<User className="w-6 h-6 text-white" />, "My Profile", "Update your public profile and personal information")}
          
          <form className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-3">
              <label className="text-sm font-extrabold text-blue ml-1 uppercase tracking-wider">Full Name</label>
              <input type="text" defaultValue="Mohamed Hassan" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue/10 focus:border-blue transition-all font-medium" />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-extrabold text-blue ml-1 uppercase tracking-wider">Job Title</label>
              <input type="text" placeholder="e.g. CEO, Manager" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue/10 focus:border-blue transition-all font-medium" />
            </div>
            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-extrabold text-blue ml-1 uppercase tracking-wider">Company Website</label>
              <input type="url" placeholder="https://example.com" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue/10 focus:border-blue transition-all font-medium" />
            </div>
            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-extrabold text-blue ml-1 uppercase tracking-wider">About Me</label>
              <textarea rows={4} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue/10 focus:border-blue transition-all resize-none font-medium" placeholder="Tell us about your business goals..." />
            </div>
            <div className="md:col-span-2 pt-6 flex justify-end">
              <button className="px-12 py-4 bg-blue text-white rounded-2xl font-black hover:shadow-2xl hover:shadow-blue/40 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm">
                Update Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {currentView === "member_profile" && (
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl border border-gray-100">
          {renderBreadcrumb("Account Information")}
          {renderSectionHeader(<FileText className="w-6 h-6 text-white" />, "Member Profile", "Professional verification and business standing")}
          
          <form className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-3">
              <label className="text-sm font-extrabold text-blue ml-1 uppercase tracking-wider">Business Legal Name</label>
              <input type="text" placeholder="Legal name of your company" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue/10 transition-all font-medium" />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-extrabold text-blue ml-1 uppercase tracking-wider">Business Type</label>
              <div className="relative">
                <select className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue/10 appearance-none font-medium text-gray-700">
                  <option>Manufacturer / OEM</option>
                  <option>Wholesale Distributor</option>
                  <option>Export Agent</option>
                  <option>Service Provider</option>
                </select>
                <ChevronRight className="w-5 h-5 absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-extrabold text-blue ml-1 uppercase tracking-wider">Primary Market</label>
              <input type="text" placeholder="e.g. Middle East, North America, Global" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue/10 transition-all font-medium" />
            </div>
            <div className="md:col-span-2 pt-6 flex justify-end">
              <button className="px-12 py-4 bg-blue text-white rounded-2xl font-black hover:shadow-2xl transition-all uppercase tracking-widest text-sm">
                Verify Membership
              </button>
            </div>
          </form>
        </div>
      )}

      {currentView === "connected_accounts" && (
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl border border-gray-100">
          {renderBreadcrumb("Account Information")}
          {renderSectionHeader(<Globe className="w-6 h-6 text-white" />, "Connected Accounts", "Social logins and business API access")}
          
          <div className="mt-10 space-y-4">
            {[
              { name: "Google", desc: "Connected for quick login", connected: true, color: "text-red-500" },
              { name: "Facebook", desc: "Connect to share products", connected: false, color: "text-blue-600" },
              { name: "LinkedIn", desc: "Professional network sync", connected: false, color: "text-blue-700" },
              { name: "Apple", desc: "Secure ID connection", connected: false, color: "text-black" }
            ].map((account) => (
              <div key={account.name} className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:border-blue/20 transition-all group">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-xl border border-gray-100 group-hover:scale-110 transition-transform ${account.color}`}>
                    {account.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{account.name}</h4>
                    <p className={`text-sm ${account.connected ? "text-green-600 font-semibold" : "text-gray-500"}`}>
                      {account.connected ? "Connected" : account.desc}
                    </p>
                  </div>
                </div>
                <button className={`px-8 py-3 rounded-xl font-bold transition-all ${
                  account.connected 
                    ? "bg-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600" 
                    : "bg-white border-2 border-blue text-blue hover:bg-blue hover:text-white"
                }`}>
                  {account.connected ? "Disconnect" : "Connect"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentView === "tax_info" && (
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl border border-gray-100">
          {renderBreadcrumb("Account Information")}
          {renderSectionHeader(<CreditCard className="w-6 h-6 text-white" />, "Tax Information", "Crucial for VAT and international trade compliance")}
          
          <form className="space-y-8 mt-10 max-w-3xl" onSubmit={(e) => e.preventDefault()}>
            <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex gap-4 items-start">
              <Shield className="w-6 h-6 text-blue shrink-0 mt-1" />
              <p className="text-blue-900 text-sm font-medium leading-relaxed">
                Your tax identity is encrypted and stored securely. This information is only used for generating valid business invoices and complying with regional tax laws.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-extrabold text-blue ml-1 uppercase tracking-wider">Tax ID / VAT No.</label>
                <input type="text" placeholder="Enter Registration Number" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue/10 transition-all font-medium" />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-extrabold text-blue ml-1 uppercase tracking-wider">Legal Entity</label>
                <input type="text" placeholder="Full Registered Name" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue/10 transition-all font-medium" />
              </div>
              <div className="space-y-3 md:col-span-2">
                <label className="text-sm font-extrabold text-blue ml-1 uppercase tracking-wider">Registered Address</label>
                <textarea rows={3} placeholder="Complete physical address" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue/10 transition-all resize-none font-medium" />
              </div>
            </div>
            
            <div className="pt-6">
              <button className="w-full py-4 bg-blue text-white rounded-2xl font-black hover:shadow-2xl transition-all uppercase tracking-widest">
                Save Tax Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Account Security Views */}
      {currentView === "password" && (
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl border border-gray-100 max-w-2xl">
          {renderBreadcrumb("Account Security")}
          {renderSectionHeader(<Lock className="w-6 h-6 text-white" />, "Update Password", "Strong passwords help protect your trade data")}
          
          <form className="space-y-6 mt-10" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-3">
              <label className="text-sm font-extrabold text-orange ml-1 uppercase tracking-wider">Current Password</label>
              <input type="password" underline-none className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange/10 focus:border-orange transition-all font-medium" />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-extrabold text-orange ml-1 uppercase tracking-wider">New Password</label>
              <input type="password" underline-none className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange/10 focus:border-orange transition-all font-medium" />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-extrabold text-orange ml-1 uppercase tracking-wider">Confirm New Password</label>
              <input type="password" underline-none className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange/10 focus:border-orange transition-all font-medium" />
            </div>
            <div className="pt-6">
              <button className="w-full py-5 bg-orange text-white rounded-2xl font-black hover:shadow-2xl hover:shadow-orange/40 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
                Confirm Update
              </button>
            </div>
          </form>
        </div>
      )}

      {currentView === "email" && (
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl border border-gray-100 max-w-2xl">
          {renderBreadcrumb("Account Security")}
          {renderSectionHeader(<Mail className="w-6 h-6 text-white" />, "Change Email Address", "Your primary point of contact for orders")}
          
          <form className="space-y-6 mt-10" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-3">
              <label className="text-sm font-extrabold text-orange ml-1 uppercase tracking-wider">New Email Address</label>
              <input type="email" placeholder="new.email@MaheDeluxe.com" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange/10 transition-all font-medium" />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-extrabold text-orange ml-1 uppercase tracking-wider">Account Password</label>
              <input type="password" underline-none className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange/10 transition-all font-medium" />
            </div>
            <div className="pt-6">
              <button className="w-full py-5 bg-orange text-white rounded-2xl font-black hover:shadow-2xl transition-all uppercase tracking-widest text-sm">
                Verify Identity & Update
              </button>
            </div>
          </form>
        </div>
      )}

      {currentView === "phone" && (
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl border border-gray-100 max-w-2xl">
          {renderBreadcrumb("Account Security")}
          {renderSectionHeader(<Phone className="w-6 h-6 text-white" />, "SMS Verification", "Secure your account with two-factor authentication")}
          
          <form className="space-y-8 mt-10" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-3">
              <label className="text-sm font-extrabold text-orange ml-1 uppercase tracking-wider">Verified Phone Number</label>
              <div className="flex gap-3">
                <input type="text" defaultValue="+20" className="w-24 px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none font-bold text-center" />
                <input type="tel" placeholder="100 000 0000" className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange/10 transition-all font-medium" />
              </div>
            </div>
            <div className="pt-6">
              <button className="w-full py-5 bg-orange text-white rounded-2xl font-black hover:shadow-2xl transition-all uppercase tracking-widest">
                Send SMS Code
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Preferences Views */}
      {(currentView === "privacy" || currentView === "notifications" || currentView === "ads") && (
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl border border-gray-100">
          {renderBreadcrumb("User Preferences")}
          {renderSectionHeader(
            currentView === "privacy" ? <Shield className="w-6 h-6 text-white" /> : 
            currentView === "notifications" ? <Bell className="w-6 h-6 text-white" /> : 
            <Settings className="w-6 h-6 text-white" />,
            currentView === "privacy" ? "Privacy Controls" : 
            currentView === "notifications" ? "Notification Hub" : "Targeting Preferences",
            "Tailor your MaheDeluxe experience to your needs"
          )}
          
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-8 rounded-[2rem] bg-gray-50 border border-gray-100 hover:shadow-xl hover:bg-white transition-all group">
                <div className="max-w-[70%]">
                  <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight mb-2 group-hover:text-blue transition-colors">Preference Key {i}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">Toggle this option to control how your data is processed for this specific feature.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer scale-110">
                  <input type="checkbox" className="sr-only peer" defaultChecked={i % 2 === 0} />
                  <div className="w-16 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-8 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue"></div>
                </label>
              </div>
            ))}
            <div className="md:col-span-2 pt-8 flex justify-center">
              <button onClick={() => setCurrentView("main")} className="px-16 py-5 bg-blue text-white rounded-3xl font-black hover:shadow-2xl hover:shadow-blue/30 scale-105 transition-all uppercase tracking-widest text-sm">
                Apply Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


