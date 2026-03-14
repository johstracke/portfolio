export function Footer() {
  return (
    <footer className="border-t-[3px] border-black bg-surface mt-auto">
      <div className="container mx-auto px-4 py-6 text-sm text-ink/70">
        © {new Date().getFullYear()} Portfolio
      </div>
    </footer>
  );
}
