import FullWidthThreeColumnLayoutProps from "@/interfaces/full_width_three_column_layout_props";
import { UserButton, useUser } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";
import {
  Bars3Icon,
  BookOpenIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  DocumentDuplicateIcon,
  HeartIcon,
  ScaleIcon,
  TrophyIcon,
  UserIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ClipboardListIcon, DumbbellIcon } from "lucide-react";

const navigation = [
  { name: "Workouts", href: "/workouts", icon: CalendarIcon },
  { name: "Exercises", href: "/exercises", icon: DocumentDuplicateIcon },
  { name: "Progress", href: "/progress", icon: ChartBarIcon },
  { name: "Routines", href: "/routines", icon: ClipboardListIcon },
  { name: "Measurements", href: "/measurements", icon: ScaleIcon },
  { name: "Goals", href: "/goals", icon: TrophyIcon },
  { name: "Health", href: "/health", icon: HeartIcon },
  { name: "Knowledge Base", href: "/knowledge", icon: BookOpenIcon },
  { name: "Community", href: "/community", icon: UsersIcon },
  { name: "Profile", href: "/profile", icon: UserIcon },
  { name: "Account", href: "/account", icon: CogIcon },
];

import {
  Dialog as HeadlessDialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import { useState } from "react";
import toTitleCase from "../utils/to_title_case";
import classNames from "../utils/classnames";

export default function FullWidthThreeColumnLayout({
  children,
  asideContent,
}: FullWidthThreeColumnLayoutProps): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useUser();
  const currentPageTitle = toTitleCase(
    location.pathname.split("/")[1] || "Dashboard"
  );

  return (
    <>
      <div>
        <HeadlessDialog
          open={sidebarOpen}
          onClose={setSidebarOpen}
          className="relative z-50 lg:hidden"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="-m-2.5 p-2.5"
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-white"
                    />
                  </button>
                </div>
              </TransitionChild>
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                <div className="flex h-16 shrink-0 items-center">
                  <DumbbellIcon className="h-8 w-8" />
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <Link
                              to={item.href}
                              className={classNames(
                                location.pathname.startsWith(item.href)
                                  ? "bg-gray-50 text-blue-600"
                                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600",
                                "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                              )}
                            >
                              <item.icon
                                aria-hidden="true"
                                className={classNames(
                                  location.pathname.startsWith(item.href)
                                    ? "text-blue-600"
                                    : "text-gray-400 group-hover:text-blue-600",
                                  "h-6 w-6 shrink-0"
                                )}
                              />
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                    <li className="-mx-6 mt-auto">
                      <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                        <UserButton />
                        <span className="sr-only">Your profile</span>
                        <span aria-hidden="true">
                          {user?.fullName || "User"}
                        </span>
                      </div>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </HeadlessDialog>

        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
            <div className="flex h-16 shrink-0 items-center">
              <DumbbellIcon className="h-8 w-8" />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={classNames(
                            location.pathname.startsWith(item.href)
                              ? "bg-gray-50 text-blue-600"
                              : "text-gray-700 hover:bg-gray-50 hover:text-blue-600",
                            "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                          )}
                        >
                          <item.icon
                            aria-hidden="true"
                            className={classNames(
                              location.pathname.startsWith(item.href)
                                ? "text-blue-600"
                                : "text-gray-400 group-hover:text-blue-600",
                              "h-6 w-6 shrink-0"
                            )}
                          />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="-mx-6 mt-auto">
                  <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50">
                    <UserButton />
                    <span className="sr-only">Your profile</span>
                    <span aria-hidden="true">{user?.fullName || "User"}</span>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
            {currentPageTitle}
          </div>
          <UserButton />
        </div>

        <main className="lg:pl-72">
          {asideContent && (
            <div className="xl:hidden">
              <div className="bg-gray-50 py-6 px-4 sm:px-6 max-h-[25vh] overflow-y-auto">
                {asideContent}
              </div>
            </div>
          )}
          <div className={asideContent ? "xl:pl-96" : ""}>
            <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">{children}</div>
          </div>
        </main>

        {asideContent && (
          <aside className="fixed inset-y-0 left-72 hidden w-96 overflow-y-auto border-r border-gray-200 px-4 py-6 sm:px-6 lg:px-8 xl:block">
            {asideContent}
          </aside>
        )}
      </div>
    </>
  );
}
