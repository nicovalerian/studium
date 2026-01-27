export function Footer() {
  return (
    <footer className="bg-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Studium. All rights reserved.
          </p>
          <p className="text-sm text-slate-500">Built with Next.js, Supabase, and AI</p>
        </div>
      </div>
    </footer>
  );
}
