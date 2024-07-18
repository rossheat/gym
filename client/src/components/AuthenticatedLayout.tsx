import { ReactNode } from "react";
import FullWidthThreeColumnLayout from "./FullWidthThreeColumnLayout";

export default function AuthenticatedLayout({
  children,
  asideContent,
}: {
  children: ReactNode;
  asideContent?: ReactNode;
}): JSX.Element {
  return (
    <FullWidthThreeColumnLayout asideContent={asideContent}>
      {children}
    </FullWidthThreeColumnLayout>
  );
}
