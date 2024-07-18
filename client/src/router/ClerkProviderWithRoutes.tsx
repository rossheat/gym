import { PUBLISHABLE_KEY } from "@/App";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import ExerciseList from "@/components/ExerciseList";
import ExercisePage from "@/components/ExercisePage";
import WorkoutList from "@/components/WorkoutList";
import WorkoutShell from "@/components/WorkoutShell";
import AccountPage from "@/pages/AccountPage";
import PageNotFoundPage from "@/pages/PageNotFoundPage";
import ProfilePage from "@/pages/ProfilePage";
import SignInPage from "@/pages/SignInPage";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";

export default function ClerkProviderWithRoutes() {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      <Routes>
        <Route
          path="/"
          element={
            <>
              <SignedIn>
                <Navigate replace to="/workouts" />
              </SignedIn>
              <SignedOut>
                <SignInPage />
              </SignedOut>
            </>
          }
        />
        <Route
          element={
            <SignedIn>
              <Outlet />
            </SignedIn>
          }
        >
          <Route
            path="/workouts"
            element={
              <AuthenticatedLayout asideContent={<WorkoutList />}>
                <Outlet />
              </AuthenticatedLayout>
            }
          >
            <Route index element={<WorkoutShell />} />
            <Route path=":id" element={<WorkoutShell />} />
          </Route>
          <Route
            path="/exercises"
            element={
              <AuthenticatedLayout asideContent={<ExerciseList />}>
                <Outlet />
              </AuthenticatedLayout>
            }
          >
            <Route index element={<ExercisePage />} />
            <Route path=":id" element={<ExercisePage />} />
          </Route>
          <Route
            path="/profile"
            element={
              <AuthenticatedLayout>
                <ProfilePage />
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/account"
            element={
              <AuthenticatedLayout>
                <AccountPage />
              </AuthenticatedLayout>
            }
          />
        </Route>
        <Route path="*" element={<PageNotFoundPage />} />
      </Routes>
    </ClerkProvider>
  );
}
