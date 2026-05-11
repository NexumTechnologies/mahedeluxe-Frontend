import Image from "next/image";
import Link from "next/link";

export default function AppDownloadSection() {
  return (
    <section className="pb-14 sm:pb-18 lg:pb-24">
      <div className="mx-auto w-full max-w-350 px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#e1deda] px-6 py-8 text-slate-900 shadow-[0_24px_80px_rgba(225,222,218,0.22)] sm:px-10 sm:py-12 lg:px-12 lg:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_1px,transparent_1.5px)] [background-size:28px_28px] opacity-40" />
          <div className="absolute right-[-8rem] top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#e1deda]/35 blur-[2px]" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.25fr_0.8fr_0.8fr]">
            <div className="max-w-xl space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-700">
                Application Mobile
              </p>
              <div className="space-y-3">
                <h2 className="max-w-xl text-4xl font-black leading-[0.95] sm:text-5xl lg:text-6xl">
                  Download the app.
                  <br />
                  Sell or buy.
                  <br />
                  Almost everything.
                </h2>
                <p className="max-w-md text-lg text-slate-700 sm:text-2xl">
                  Earn money. Save.
                  <br />
                  Fund your next discovery.
                </p>
              </div>

              <Link
                href="#"
                className="inline-flex min-w-[270px] items-center gap-4 rounded-2xl  px-6 py-4 shadow-[0_12px_32px_rgba(0,0,0,0.16)] transition "
              >
                <Image src="/apple.svg" alt="App Store" width={38} height={46} className="h-11 w-11" />
                <span className="text-left">
                  <span className="block text-xs font-medium text-black/75">Download on the</span>
                  <span className="block text-3xl font-extrabold leading-none">App Store</span>
                </span>
              </Link>
            </div>

            <div className="space-y-4 text-center lg:justify-self-center">
              <p className="text-lg font-semibold text-slate-700">
                Scan me
                <br />
                to download the app.
              </p>
              <div className="mx-auto flex h-[270px] w-[270px] items-center justify-center rounded-[1.6rem] bg-[#e9ebc8] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.15)]">
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white text-center text-sm font-medium text-slate-500">
                  <Image src="/qrcode.jpeg" alt="QR Code" width={240} height={240} className="object-contain" />
                </div>
              </div>
            </div>

            <div className="hidden lg:flex lg:justify-end">
              <div className="relative h-[360px] w-[210px] rounded-[2.2rem] border-[14px] border-[#1b2f1f] bg-[#f7f6f0] shadow-[0_28px_60px_rgba(0,0,0,0.22)]">
                <div className="absolute left-1/2 top-0 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-[#1b2f1f]" />
                <div className="grid h-full grid-cols-2 gap-4 p-4 pt-8">
                  <div className="rounded-2xl bg-[#e6f4eb] p-3">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#b8e2c2] text-2xl text-[#2d995d]">↑</div>
                    <div className="h-2 w-12 rounded-full bg-[#335145]" />
                    <div className="mt-2 h-2 w-9 rounded-full bg-[#3ba56b]" />
                  </div>
                  <div className="rounded-2xl bg-[#fff0d8] p-3">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#ffd8a6] text-2xl text-[#ff9b25]">◉</div>
                    <div className="h-2 w-12 rounded-full bg-[#335145]" />
                    <div className="mt-2 h-2 w-9 rounded-full bg-[#ff9b25]" />
                  </div>
                  <div className="rounded-2xl bg-[#edf7ef] p-3">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#bce4c7] text-2xl text-[#37a162]">■</div>
                    <div className="h-2 w-12 rounded-full bg-[#335145]" />
                    <div className="mt-2 h-2 w-9 rounded-full bg-[#3ba56b]" />
                  </div>
                  <div className="rounded-2xl bg-[#f8deea] p-3">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#f5c5d9] text-2xl text-[#e85c94]">▼</div>
                    <div className="h-2 w-12 rounded-full bg-[#335145]" />
                    <div className="mt-2 h-2 w-9 rounded-full bg-[#ef5e98]" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-4">
                  <span className="h-5 w-5 rounded-full bg-[#2fa15b]" />
                  <span className="h-5 w-5 rounded-full bg-[#d9d9d9]" />
                  <span className="h-5 w-5 rounded-full bg-[#d9d9d9]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}