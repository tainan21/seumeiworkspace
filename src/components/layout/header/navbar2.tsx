"use client";

import type { Session } from "~/lib/server/auth/session";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import LogoutButton from "~/components/shared/logout-button";
import LocaleToggler from "~/components/shared/locale-toggler";
import { buttonVariants } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { cn } from "~/lib/utils";
import { Logo } from "~/components/seumei/logo";
export default function Navbar({
  session,
  headerText,
}: {
  session: Session;
  headerText: {
    changelog: string;
    about: string;
    login: string;
    dashboard: string;
    [key: string]: string;
  };
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <nav className="flex h-full items-center justify-between">
      <Link href="/" className="flex items-center text-2xl font-bold">
        <Logo size="sm" />
        <p>Seumei</p>
      </Link>
      <div className="hidden items-center gap-12 lg:flex 2xl:gap-16">
        <div className="text-muted-foreground space-x-4 text-center text-sm leading-loose md:text-left">
          <Link
            href="/changelog"
            className="font-semibold hover:underline hover:underline-offset-4"
          >
            {headerText.changelog}
          </Link>
          <Link
            href="/about"
            className="font-semibold hover:underline hover:underline-offset-4"
          >
            {headerText.about}
          </Link>
        </div>
        <div className="flex items-center gap-x-2">
          <LocaleToggler />
          {session ? (
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "bg-secondary"
              )}
              onClick={() => setIsModalOpen(false)}
            >
              {headerText.dashboard}
            </Link>
          ) : (
            <Link href="/login" className={buttonVariants()}>
              {headerText.login}
            </Link>
          )}
        </div>
      </div>
      <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <SheetTrigger className="lg:hidden">
          <span className="sr-only">Open Menu</span>
          <MenuIcon />
        </SheetTrigger>
        <SheetContent>
          <div className="flex flex-col items-center space-y-10 py-10">
            <div className="flex justify-center mb-4">
              <LocaleToggler />
            </div>
            <div className="text-muted-foreground space-y-4 text-center text-sm leading-loose">
              <Link
                href="/changelog"
                className="block font-semibold hover:underline hover:underline-offset-4"
                onClick={() => setIsModalOpen(false)}
              >
                {headerText.changelog}
              </Link>
              <Link
                href="/about"
                className="block font-semibold hover:underline hover:underline-offset-4"
                onClick={() => setIsModalOpen(false)}
              >
                {headerText.about}
              </Link>
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block font-semibold hover:underline hover:underline-offset-4"
                    onClick={() => setIsModalOpen(false)}
                  >
                    {headerText.dashboard}
                  </Link>
                  <LogoutButton className="!mt-20" />
                </>
              ) : (
                <Link
                  href="/login"
                  className={buttonVariants()}
                  onClick={() => setIsModalOpen(false)}
                >
                  {headerText.login}
                </Link>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
