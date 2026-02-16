"use client";

import { useState } from "react";
import { Search, Download, Calendar, ChevronDown, Receipt } from "lucide-react";

type TransactionStatus = "all" | "not-arrived" | "awaiting-link" | "completed";

export default function AllTransactionsTab() {
  const [activeTab, setActiveTab] = useState<"payment" | "refund">("payment");
  const [activeStatus, setActiveStatus] = useState<TransactionStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("All");

  const statusFilters = [
    { id: "all" as TransactionStatus, label: "All" },
    {
      id: "not-arrived" as TransactionStatus,
      label: "Payments not yet arrived",
    },
    {
      id: "awaiting-link" as TransactionStatus,
      label: "Awaiting supplier to link",
    },
    { id: "completed" as TransactionStatus, label: "Completed" },
  ];

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCurrency("All");
    setActiveStatus("all");
  };

  return (
    <div>
      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center shadow-lg">
          <Receipt className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          All transactions
        </h1>
      </div>

      {/* Payment/Refund Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab("payment")}
            className={`pb-4 px-2 border-b-2 transition-all ${
              activeTab === "payment"
                ? "border-[#7c3aed] text-[#7c3aed] font-bold"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            Payment
          </button>
          <button
            onClick={() => setActiveTab("refund")}
            className={`pb-4 px-2 border-b-2 transition-all ${
              activeTab === "refund"
                ? "border-[#7c3aed] text-[#7c3aed] font-bold"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            Refunds
          </button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-gray-700">Status:</span>
          {statusFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveStatus(filter.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeStatus === filter.id
                  ? "bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] text-white shadow-lg shadow-purple-200/50"
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Inputs */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Select time"
            className="pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent text-sm w-48 bg-white transition-all"
          />
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by payment amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent text-sm bg-white transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent text-sm w-32 bg-white transition-all"
          >
            <option>All</option>
            <option>AED</option>
            <option>EGP</option>
            <option>EUR</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <button
          onClick={handleClearFilters}
          className="px-4 py-2.5 text-gray-700 hover:text-[#7c3aed] transition-colors text-sm font-semibold rounded-xl hover:bg-purple-50"
        >
          Clear filters
        </button>
        <button className="px-5 py-2.5 bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export details
        </button>
      </div>

      {/* Table Header */}
      <div className="bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] text-white rounded-t-xl overflow-hidden shadow-lg">
        <div className="grid grid-cols-5 gap-4 px-6 py-4">
          <div className="font-bold">Time Sent (PST)</div>
          <div className="font-bold">Payment method</div>
          <div className="font-bold">Amount</div>
          <div className="font-bold">Status</div>
          <div className="font-bold">Action</div>
        </div>
      </div>

      {/* Empty State */}
      <div className="border-2 border-gray-200 border-t-0 rounded-b-xl bg-white">
        <div className="flex flex-col items-center justify-center py-16 rounded-b-xl bg-gradient-to-br from-gray-50 to-purple-50/20">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-4">
            <Receipt className="w-10 h-10 text-purple-400" />
          </div>
          <p className="text-gray-700 text-lg font-medium">No data</p>
        </div>
      </div>
    </div>
  );
}
