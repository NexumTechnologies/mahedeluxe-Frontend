"use client";

import Link from "next/link";
import { useI18n } from "@/components/LanguageProvider";

export default function SignInPromo() {
  const { dir, t } = useI18n();

  return (
    <div className="h-full bg-linear-to-bl from-blue-light to-blue flex flex-col items-center justify-center px-8 py-16" dir={dir}>
      <h2 className="text-white text-[25px] font-bold leading-8.75 text-center">
        {t("auth.signInPromoTitle")}
      </h2>
      <p className="text-white text-[20px] font-medium leading-7 text-center mt-4">
        {t("auth.signInPromoDescription")}
      </p>
      <Link
        href="/auth/signin"
        className="mt-4 w-94 h-12 border-2 border-white rounded-lg flex items-center justify-center text-white text-[16px] font-medium hover:bg-white/10 transition-colors"
      >
        {t("auth.signIn")}
      </Link>
    </div>
  );
}
