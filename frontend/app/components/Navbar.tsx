import Link from "next/link";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/forecast", label: "Forecast" },
  { href: "/overflow", label: "Overflow Risk" },
  { href: "/humidity-bin-usage", label: "Weather Correlation" },
  { href: "/perception", label: "Perception" },
];

export default function Navbar({ active }: { active: string }) {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm mb-6">
      <div className="max-w-5xl mx-auto px-6 flex items-center gap-1 h-14">
        <span className="text-lg font-bold text-gray-800 mr-4">CheckBin</span>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              active === link.href
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
