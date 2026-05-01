"use client";

import { StoredAuthUser } from "@/lib/authStorage";

function initials(name?: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

type Props = {
  user?: StoredAuthUser;
};

export default function UserProfileCard({ user }: Props) {
  const name = user?.name || "User";
  const email = (user?.email as string) || "";
  const role = user?.role || "user";

  return (
    <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md border border-gray-100">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-gray-100 flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-500">
          <span className="text-white text-2xl font-semibold">{initials(name)}</span>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
          <div className="text-sm text-gray-600">{email}</div>
          <div className="text-xs text-gray-500 mt-1">Role: {role}</div>
        </div>
      </div>
    </div>
  );
}
