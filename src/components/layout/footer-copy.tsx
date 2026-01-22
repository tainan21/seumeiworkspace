import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { siteConfig } from "~/config/site";
import LocaleToggler from "../shared/locale-toggler";
import ThemeToggle from "../shared/theme-toggle";
import {Logo} from "~/components/shared/logo";
export default function Footer() {
  return (
    <footer className="md:py- relative z-10 w-full border-t py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 md:h-14 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
          <Logo size="sm" />
          <p className="text-muted-foreground text-center text-sm leading-loose md:text-left">
            Developed by{" "}
            <Link
              href={siteConfig().links.twitter}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Matriz
            </Link>
          </p>
        </div>

        <div className="space-x-5">
          <Suspense>
            <LocaleToggler />
          </Suspense>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
