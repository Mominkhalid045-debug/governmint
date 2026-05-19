

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <h1 className="text-5xl font-extrabold text-white mb-4">GovernMINT</h1>
      <p className="text-lg text-slate-300 mb-6 text-center max-w-2xl">
        A premium committee & meeting management system. Use the button below to access the dashboard.
      </p>
      <a
        href="/dashboard"
        className="rounded-xl bg-emerald-600 px-6 py-3 text-white font-semibold hover:bg-emerald-500 transition-colors"
      >
        Go to Dashboard
      </a>
    </main>
  );
}

