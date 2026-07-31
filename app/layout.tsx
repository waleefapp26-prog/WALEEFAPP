import type { Metadata } from "next";
import "@/styles/globals.css";
import { getServerLocale } from "@/lib/i18n/getServerLocale";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import shellStyles from "@/styles/layout/shell.module.css";

export const metadata: Metadata = {
  title: "Waleef — Find Your Life Partner",
  description:
    "Waleef connects you with compatible Muslims seeking marriage. Built on Islamic values, privacy, and family involvement.",
  icons: {
    icon: "/images/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body className={shellStyles.shell}>
        <LanguageProvider initialLocale={locale}>
          <div className={shellStyles.main}>{children}</div>
        </LanguageProvider>
      </body>
    </html>
  );
}
