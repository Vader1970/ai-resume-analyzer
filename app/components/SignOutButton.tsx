import { usePuterStore } from "~/lib/puter";

export default function SignOutButton() {
  const { auth, isLoading } = usePuterStore();

  const handleSignOut = async () => {
    await auth.signOut();
  };

  return (
    <button
      onClick={handleSignOut}
      className="primary-button w-[186px] text-xl font-semibold"
      disabled={isLoading}
      type="button"
    >
      {isLoading ? "Signing out..." : "Sign Out"}
    </button>
  );
} 