"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import styles from "@/styles/ui/admin-nav.module.css";

const ITEMS = [
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/verifications", label: "Verifications" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/photos", label: "Photos" },
  { href: "/admin/success-stories", label: "Stories" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Admin">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(styles.link, pathname?.startsWith(item.href) && styles.linkActive)}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
