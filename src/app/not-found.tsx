import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFBF8] px-4">
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-playfair)] text-6xl font-bold text-primary mb-4">
          404
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Oops! This page seems to have melted away.
        </p>
        <Link
          href="/"
          className="inline-block bg-gradient-to-r from-primary to-secondary text-white font-semibold px-6 py-3 rounded-full hover:shadow-lg transition-shadow"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
