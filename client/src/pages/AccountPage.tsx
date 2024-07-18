import { UserProfile } from "@clerk/clerk-react";

export default function AccountPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <UserProfile />
    </div>
  );
}
