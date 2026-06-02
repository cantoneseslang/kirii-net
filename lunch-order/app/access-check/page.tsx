export default function AccessCheck() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Access Check</h1>
      <p>Open devtools Network and request <code>/api/debug-headers</code> from the portal and directly to compare Referer.</p>
      <div className="space-x-3">
        <a className="underline text-blue-600" href="/api/debug-headers">/api/debug-headers</a>
      </div>
    </div>
  );
}




