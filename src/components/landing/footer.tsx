export function Footer() {
  return (
    <footer className="border-t border-warm-200 bg-warm-50 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warm-800">
              <span className="font-serif text-sm font-medium text-warm-50">S</span>
            </div>
            <span className="font-serif text-lg font-medium text-warm-800">Studium</span>
          </div>
          <p className="text-sm text-warm-500">
            &copy; {new Date().getFullYear()} Studium. Made for learners.
          </p>
        </div>
      </div>
    </footer>
  );
}
