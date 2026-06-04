"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import {
  registerUser,
  createSellerProfile,
  createBuyerProfile,
} from "@/lib/api";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) return maybeMessage;

    const responseMessage = (error as { response?: { data?: { message?: unknown } } })
      .response?.data?.message;
    if (typeof responseMessage === "string" && responseMessage.trim()) return responseMessage;
  }
  return "An error occurred. Please try again.";
}

export default function SellerRegisterStep3({
  role = "seller",
}: {
  role?: "seller" | "buyer";
}) {
  const [businessLicense, setBusinessLicense] = useState<File | null>(null);
  const [taxCertificate, setTaxCertificate] = useState<File | null>(null);
  const [factoryPhoto, setFactoryPhoto] = useState<File | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<{
    business_license_url?: string;
    tax_certificate_url?: string;
    factory_photo_url?: string;
  }>({});
  const [uploadingKey, setUploadingKey] = useState<
    | "business_license_url"
    | "tax_certificate_url"
    | "factory_photo_url"
    | "bulk"
    | null
  >(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const router = useRouter();
  const hasAllDocumentsSelected = Boolean(
    businessLicense && taxCertificate && factoryPhoto,
  );

  useEffect(() => {
    // Load step 1 and 2 data from sessionStorage
    const stored = sessionStorage.getItem("registration");
    if (!stored) {
      // If no previous data, redirect back to step 1
      router.push(`/auth/${role}/register`);
    }
  }, [router, role]);

  const uploadSingleDocument = async (file: File) => {
    const formData = new FormData();
    formData.append("images", file);
    const res = await api.post("/upload/multiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const payload = res.data;
    const urls: string[] =
      (payload?.urls as string[] | undefined) ??
      (payload?.url ? [String(payload.url)] : Array.isArray(payload) ? payload : []);
    return { payload, urls };
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void,
    docKey: "business_license_url" | "tax_certificate_url" | "factory_photo_url",
  ) => {
    const file = e.target.files?.[0] || null;
    setter(file);
    setError("");

    if (!file) {
      setUploadedDocs((prev) => {
        const next = { ...prev };
        delete next[docKey];
        return next;
      });
      return;
    }

    try {
      setUploadingDocs(true);
      setUploadingKey(docKey);
      const { payload, urls } = await uploadSingleDocument(file);
      console.log(`[Register Step3] Upload response (${docKey}):`, payload);
      console.log(`[Register Step3] Uploaded URLs (${docKey}):`, urls);
      const url = urls[0];
      if (!url) throw new Error("Upload failed");
      setUploadedDocs((prev) => ({ ...prev, [docKey]: url }));
    } catch (err) {
      console.error("Document upload failed", err);
      setUploadedDocs((prev) => {
        const next = { ...prev };
        delete next[docKey];
        return next;
      });
      setError("Failed to upload document. Please try again.");
    } finally {
      setUploadingDocs(false);
      setUploadingKey(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!businessLicense || !taxCertificate || !factoryPhoto) {
        setError("Please upload all required documents");
        setLoading(false);
        return;
      }

      // Load all registration data
      const stored = sessionStorage.getItem("registration");
      if (!stored) {
        setError("Please complete all previous steps");
        setLoading(false);
        return;
      }

      const data = JSON.parse(stored);
      const { step1, step2 } = data;

      if (!step1 || !step2) {
        setError("Please complete all previous steps");
        setLoading(false);
        return;
      }

      // Prepare payloads
      // Ensure password fields exist
      if (!step1.password || !step1.confirmPassword) {
        setError("Password not provided. Please go back and set a password.");
        setLoading(false);
        return;
      }

      const userPayload = {
        name: step1.fullName,
        email: step1.workEmail,
        password: step1.password,
        confirm_password: step1.confirmPassword,
        role: role, // send chosen role ('seller' or 'buyer') to backend
      };

      // 1) Register user
      const registerResult = await registerUser(userPayload);

      // 2) Upload documents
      let documents = {
        business_license_url: uploadedDocs.business_license_url,
        tax_certificate_url: uploadedDocs.tax_certificate_url,
        factory_photo_url: uploadedDocs.factory_photo_url,
      };

      if (!documents.business_license_url || !documents.tax_certificate_url || !documents.factory_photo_url) {
        setUploadingDocs(true);
        setUploadingKey("bulk");
        const formData = new FormData();
        formData.append("images", businessLicense);
        formData.append("images", taxCertificate);
        formData.append("images", factoryPhoto);

        const res = await api.post("/upload/multiple", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const uploadData = res.data;
        console.log("[Register Step3] Upload response:", uploadData);

        const urls: string[] =
          (uploadData?.urls as string[] | undefined) ??
          (uploadData?.url ? [String(uploadData.url)] : Array.isArray(uploadData) ? uploadData : []);

        console.log("[Register Step3] Uploaded document URLs:", urls);

        if (!Array.isArray(urls) || urls.length < 3) {
          throw new Error("Failed to upload documents");
        }

        documents = {
          business_license_url: urls[0],
          tax_certificate_url: urls[1],
          factory_photo_url: urls[2],
        };
        setUploadedDocs(documents);
        setUploadingDocs(false);
        setUploadingKey(null);
      }

      // 2) Create profile depending on role
      if (role === "seller") {
        const sellerPayload = {
          shop_name: step2.companyName,
          business_type: step2.businessType,
          description: "",
          business_email: step1.workEmail,
          business_phone: step1.mobileNumber,
          business_address: step2.city,
          city: step2.city,
          country: step2.country,
          id_card_number: step1.mobileNumber, // placeholder; ideally collect proper id
          documents,
        };

        await createSellerProfile(sellerPayload);
      } else {
        const buyerPayload = {
          dob: step2.dob || null,
          gender: step2.gender || "other",
          documents,
        };
        await createBuyerProfile(buyerPayload);
      }

      // Clear sessionStorage
      sessionStorage.removeItem("registration");

      const createdUserPayload =
        (registerResult as { data?: unknown; user?: unknown } | undefined)?.data ??
        (registerResult as { data?: unknown; user?: unknown } | undefined)?.user ??
        {};
      const createdUser = createdUserPayload as { is_varified?: unknown };
      const isVarified = typeof createdUser.is_varified === "boolean" ? createdUser.is_varified : false;

      // If user is not verified, show pending screen (same behavior as login)
      if (isVarified === false) {
        router.push("/auth/verification");
        router.refresh();
        return;
      }

      // Redirect to appropriate dashboard after successful registration
      if (role === "seller") router.push("/seller/dashboard");
      else router.push("/buyer/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setUploadingDocs(false);
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Desktop Title - Hidden on mobile */}
      <div className="hidden md:block text-center">
        <h1 className="text-blue text-[25px] font-bold leading-8.75">
          Verify Your Business
        </h1>
        <p className="text-[#6B6B6B] text-[16px] leading-[18.2px] font-medium mt-1">
          We verify suppliers to a guarantee and safety on the platform
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 md:mt-6">
        {uploadingDocs && (
          <div
            className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
                aria-hidden="true"
              />
              <span>
                {uploadingKey === "bulk" ? "Uploading documents..." : "Uploading document..."}
              </span>
            </div>
          </div>
        )}

        {/* Upload Business License */}
        <div className="mb-6">
          <input
            type="file"
            id="businessLicense"
            accept="image/*,.pdf"
            onChange={(e) =>
              handleFileChange(e, setBusinessLicense, "business_license_url")
            }
            className="hidden"
            disabled={uploadingDocs}
          />
          <div className="w-full border border-[#A6A6A6] bg-transparent rounded-lg py-6.25 px-8.75">
            <label
              htmlFor="businessLicense"
              className={`block w-full bg-blue rounded-lg py-3 px-4 transition-colors ${
                uploadingDocs ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:bg-blue"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 17V11L7 13"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 11L11 13"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 10V15C22 20 20 22 15 22H9C4 22 2 20 2 15V9C2 4 4 2 9 2H14"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 10H18C15 10 14 9 14 6V2L22 10Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-white text-[16px] font-medium">
                  {businessLicense
                    ? businessLicense.name
                    : "Upload business license"}
                </span>
              </div>
            </label>
            <div className="mt-2 text-xs">
              {uploadingKey === "business_license_url" ? (
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <span
                    className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
                    aria-hidden="true"
                  />
                  Uploading...
                </span>
              ) : uploadedDocs.business_license_url ? (
                <span className="text-emerald-700 font-medium">Uploaded</span>
              ) : (
                <span className="text-slate-500">Not uploaded yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Upload Tax Certificate */}
        <div className="mb-6">
          <input
            type="file"
            id="taxCertificate"
            accept="image/*,.pdf"
            onChange={(e) =>
              handleFileChange(e, setTaxCertificate, "tax_certificate_url")
            }
            className="hidden"
            disabled={uploadingDocs}
          />
          <div className="w-full border border-[#A6A6A6] bg-transparent rounded-lg py-6.25 px-8.75">
            <label
              htmlFor="taxCertificate"
              className={`block w-full bg-blue rounded-lg py-3 px-4 transition-colors ${
                uploadingDocs ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:bg-blue"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 17V11L7 13"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 11L11 13"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 10V15C22 20 20 22 15 22H9C4 22 2 20 2 15V9C2 4 4 2 9 2H14"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 10H18C15 10 14 9 14 6V2L22 10Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-white text-[16px] font-medium">
                  {taxCertificate
                    ? taxCertificate.name
                    : "Upload Tax Certificate"}
                </span>
              </div>
            </label>
            <div className="mt-2 text-xs">
              {uploadingKey === "tax_certificate_url" ? (
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <span
                    className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
                    aria-hidden="true"
                  />
                  Uploading...
                </span>
              ) : uploadedDocs.tax_certificate_url ? (
                <span className="text-emerald-700 font-medium">Uploaded</span>
              ) : (
                <span className="text-slate-500">Not uploaded yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Upload Factory/Warehouse Photo */}
        <div className="mb-6">
          <input
            type="file"
            id="factoryPhoto"
            accept="image/*"
            onChange={(e) =>
              handleFileChange(e, setFactoryPhoto, "factory_photo_url")
            }
            className="hidden"
            disabled={uploadingDocs}
          />
          <div className="w-full border border-[#A6A6A6] bg-transparent rounded-lg py-6.25 px-8.75">
            <label
              htmlFor="factoryPhoto"
              className={`block w-full bg-blue rounded-lg py-3 px-4 transition-colors ${
                uploadingDocs ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:bg-blue"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 17V11L7 13"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 11L11 13"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 10V15C22 20 20 22 15 22H9C4 22 2 20 2 15V9C2 4 4 2 9 2H14"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 10H18C15 10 14 9 14 6V2L22 10Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-white text-[16px] font-medium">
                  {factoryPhoto
                    ? factoryPhoto.name
                    : "Factory / Warehouse photo"}
                </span>
              </div>
            </label>
            <div className="mt-2 text-xs">
              {uploadingKey === "factory_photo_url" ? (
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <span
                    className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
                    aria-hidden="true"
                  />
                  Uploading...
                </span>
              ) : uploadedDocs.factory_photo_url ? (
                <span className="text-emerald-700 font-medium">Uploaded</span>
              ) : (
                <span className="text-slate-500">Not uploaded yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

        {/* Submit Application Button */}
        <Button
          type="submit"
          disabled={loading || uploadingDocs || !hasAllDocumentsSelected}
          className="w-full h-12 bg-linear-to-br from-blue to-blue-300 text-white text-[16px] font-medium rounded-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploadingDocs ? "Uploading documents..." : loading ? "Submitting..." : "Submit Application"}
        </Button>
      </form>
    </div>
  );
}
