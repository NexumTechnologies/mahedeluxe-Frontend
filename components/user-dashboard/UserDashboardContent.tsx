"use client";

import UserProfileCard from "./UserProfileCard";
import { getStoredUser } from "@/lib/authStorage";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export default function UserDashboardContent() {
  const user = getStoredUser();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["user-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await api.get(`/users/${user.id}/stats`);
      return res.data?.data;
    },
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Only show profile card for logged-in user */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-1">
          <UserProfileCard user={user ?? undefined} />
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white border rounded-lg">
            <p className="text-sm text-gray-500">Total Orders</p>
            <div className="mt-2 text-2xl font-semibold">{statsLoading ? "-" : statsData?.totalOrders ?? 0}</div>
          </div>
          <div className="p-4 bg-white border rounded-lg">
            <p className="text-sm text-gray-500">Pending Orders</p>
            <div className="mt-2 text-2xl font-semibold">{statsLoading ? "-" : statsData?.pendingOrders ?? 0}</div>
          </div>
          <div className="p-4 bg-white border rounded-lg">
            <p className="text-sm text-gray-500">Completed Orders</p>
            <div className="mt-2 text-2xl font-semibold">{statsLoading ? "-" : statsData?.completedOrders ?? 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
