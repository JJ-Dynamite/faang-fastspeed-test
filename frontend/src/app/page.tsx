'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [result, setResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('');

  const runTest = async () => {
    setTesting(true);
    setProgress(0);
    setPhase('Connecting to server...');
    
    // Simulate test phases
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 100));
      setProgress(i);
      if (i < 30) setPhase('Testing download speed...');
      else if (i < 60) setPhase('Testing upload speed...');
      else if (i < 90) setPhase('Testing ping...');
      else setPhase('Finalizing results...');
    }

    try {
      const res = await fetch('http://localhost:3001/api/test', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) setResult(data.data);
    } catch (error) {
      console.error('Speed test failed:', error);
    } finally {
      setTesting(false);
      setPhase('');
    }
  };

  const getSpeedRating = (speed: number, type: 'download' | 'upload') => {
    if (type === 'download') {
      if (speed > 100) return { label: 'Excellent', color: 'text-green-400' };
      if (speed > 50) return { label: 'Good', color: 'text-blue-400' };
      if (speed > 25) return { label: 'Fair', color: 'text-yellow-400' };
      return { label: 'Poor', color: 'text-red-400' };
    } else {
      if (speed > 20) return { label: 'Excellent', color: 'text-green-400' };
      if (speed > 10) return { label: 'Good', color: 'text-blue-400' };
      if (speed > 5) return { label: 'Fair', color: 'text-yellow-400' };
      return { label: 'Poor', color: 'text-red-400' };
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl">⚡</span>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              FastSpeed Test
            </h1>
          </div>
          <p className="text-gray-300 text-lg">Check your internet connection speed</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-2xl mb-8">
          {!testing && !result && (
            <div className="text-center py-12">
              <div className="w-40 h-40 mx-auto mb-6 rounded-full border-4 border-slate-600 flex items-center justify-center">
                <span className="text-6xl">⚡</span>
              </div>
              <button
                onClick={runTest}
                className="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-semibold text-lg transition-all"
              >
                Start Speed Test
              </button>
            </div>
          )}

          {testing && (
            <div className="text-center py-12">
              <div className="relative w-40 h-40 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="#374151" strokeWidth="8" fill="none" />
                  <circle
                    cx="80" cy="80" r="70"
                    stroke="#10b981"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${progress * 4.4} 440`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{progress}%</span>
                </div>
              </div>
              <p className="text-xl text-gray-300">{phase}</p>
            </div>
          )}

          {result && !testing && (
            <div>
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="#374151" strokeWidth="8" fill="none" />
                      <circle
                        cx="64" cy="64" r="56"
                        stroke="#10b981"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(result.download_mbps / 100) * 352} 352`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold">{result.download_mbps}</span>
                      <span className="text-xs text-gray-400">Mbps</span>
                    </div>
                  </div>
                  <p className="text-lg font-semibold">Download</p>
                  <p className={`text-sm ${getSpeedRating(result.download_mbps, 'download').color}`}>
                    {getSpeedRating(result.download_mbps, 'download').label}
                  </p>
                </div>

                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="#374151" strokeWidth="8" fill="none" />
                      <circle
                        cx="64" cy="64" r="56"
                        stroke="#3b82f6"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(result.upload_mbps / 50) * 352} 352`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold">{result.upload_mbps}</span>
                      <span className="text-xs text-gray-400">Mbps</span>
                    </div>
                  </div>
                  <p className="text-lg font-semibold">Upload</p>
                  <p className={`text-sm ${getSpeedRating(result.upload_mbps, 'upload').color}`}>
                    {getSpeedRating(result.upload_mbps, 'upload').label}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-700/30 rounded-xl text-center">
                  <p className="text-3xl font-bold text-green-400">{result.ping_ms}</p>
                  <p className="text-gray-400 text-sm">Ping (ms)</p>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-xl text-center">
                  <p className="text-3xl font-bold text-blue-400">{result.jitter_ms}</p>
                  <p className="text-gray-400 text-sm">Jitter (ms)</p>
                </div>
              </div>

              <div className="p-4 bg-slate-700/30 rounded-xl text-center mb-6">
                <p className="text-gray-400 text-sm">Server: {result.server_location}</p>
                <p className="text-gray-400 text-sm">ISP: {result.isp}</p>
              </div>

              <button
                onClick={runTest}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-semibold transition-all"
              >
                🔄 Test Again
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700 text-center">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-semibold text-sm">Fast</h4>
            <p className="text-gray-400 text-xs">30 second test</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700 text-center">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-semibold text-sm">Accurate</h4>
            <p className="text-gray-400 text-xs">Precise results</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700 text-center">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-semibold text-sm">History</h4>
            <p className="text-gray-400 text-xs">Track changes</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700 text-center">
            <div className="text-2xl mb-2">🌍</div>
            <h4 className="font-semibold text-sm">Global</h4>
            <p className="text-gray-400 text-xs">Many servers</p>
          </div>
        </div>
      </div>
    </main>
  );
}
