import React, { useState } from 'react';
import { Cloud, Copy, Check, Terminal, Globe, ArrowRight, ShieldCheck, Code2 } from 'lucide-react';

export const VercelDeployGuide: React.FC = () => {
  const [copiedVercelJson, setCopiedVercelJson] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);

  const vercelJsonContent = `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}`;

  const copyToClipboard = (text: string, type: 'json' | 'cli') => {
    navigator.clipboard.writeText(text);
    if (type === 'json') {
      setCopiedVercelJson(true);
      setTimeout(() => setCopiedVercelJson(false), 2500);
    } else {
      setCopiedCli(true);
      setTimeout(() => setCopiedCli(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="w-6 h-6 text-sky-400" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
              Konfigurasi Vercel Siap Digunakan
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Deploy Online ke Vercel
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            File <code className="text-sky-300 font-mono bg-slate-800 px-1.5 py-0.5 rounded">vercel.json</code> sudah berhasil dibuat di root proyek aplikasi Anda. Aplikasi ini siap di-deploy secara instan ke server global Vercel tanpa perlu pengaturan rumit.
          </p>
        </div>
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Vercel JSON Viewer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-slate-700" />
            <h3 className="font-semibold text-slate-800 text-sm">
              Skema File vercel.json (Tersedia di Root)
            </h3>
          </div>
          <button
            onClick={() => copyToClipboard(vercelJsonContent, 'json')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {copiedVercelJson ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin vercel.json</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 bg-slate-950 overflow-x-auto text-xs sm:text-sm font-mono text-slate-200 leading-relaxed">
          <pre>{vercelJsonContent}</pre>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-700">Fungsi penting dalam skema ini:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>
              <code className="bg-slate-200 px-1 rounded text-slate-800">"rewrites": [{`"source": "/(.*)", "destination": "/index.html"`}]</code>: Menjamin rute Single Page Application (SPA) tetap berjalan mulus saat browser di-refresh.
            </li>
            <li>
              <code className="bg-slate-200 px-1 rounded text-slate-800">"buildCommand": "npm run build"</code>: Menjalankan kompilasi Vite secara otomatis di server Vercel.
            </li>
            <li>
              <code className="bg-slate-200 px-1 rounded text-slate-800">"outputDirectory": "dist"</code>: Menentukan folder output statis produksi.
            </li>
          </ul>
        </div>
      </div>

      {/* Deployment Guide Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Method 1: GitHub & Vercel Dashboard */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">
              Metode 1: Hubungkan via GitHub (Rekomendasi)
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Paling mudah untuk update otomatis setiap kali ada perubahan kode.
            </p>

            <ol className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 font-bold flex items-center justify-center shrink-0 text-slate-700">
                  1
                </span>
                <span>
                  Push kode proyek ini ke repository <strong>GitHub</strong> milik Anda.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 font-bold flex items-center justify-center shrink-0 text-slate-700">
                  2
                </span>
                <span>
                  Buka <strong>vercel.com</strong> lalu klik tombol <strong>"Add New Project"</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 font-bold flex items-center justify-center shrink-0 text-slate-700">
                  3
                </span>
                <span>
                  Pilih repositori Anda, Vercel akan otomatis mendeteksi <code className="bg-slate-100 px-1 rounded">vercel.json</code>, lalu klik <strong>"Deploy"</strong>.
                </span>
              </li>
            </ol>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-700">
            <span>Siap online dalam waktu &lt; 1 menit</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Method 2: Vercel CLI */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold mb-3">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">
              Metode 2: Deploy Cepat via Terminal (CLI)
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Langsung kirim ke Vercel langsung dari command line.
            </p>

            <div className="bg-slate-900 rounded-xl p-3 text-xs font-mono text-emerald-400 relative">
              <code>npx vercel --prod</code>
              <button
                onClick={() => copyToClipboard('npx vercel --prod', 'cli')}
                className="absolute right-2 top-2 p-1 text-slate-400 hover:text-white"
                title="Salin perintah CLI"
              >
                {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <ol className="mt-4 space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 font-bold flex items-center justify-center shrink-0 text-slate-700">
                  1
                </span>
                <span>Jalankan perintah di atas pada terminal folder proyek.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 font-bold flex items-center justify-center shrink-0 text-slate-700">
                  2
                </span>
                <span>Ikuti petunjuk login browser (cukup sekali).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 font-bold flex items-center justify-center shrink-0 text-slate-700">
                  3
                </span>
                <span>Vercel akan memberikan link URL publik langsung!</span>
              </li>
            </ol>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
            <span>Koneksi Firebase Realtime tetap tersambung</span>
          </div>
        </div>
      </div>
    </div>
  );
};
