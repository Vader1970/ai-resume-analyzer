// Auth route: Handles user authentication and login/logout UI
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter"

// Page metadata for SEO
export const meta = () => ([
  { title: 'ResumeAI | Auth' },
  { name: 'description', content: 'Log into your account' },
])

// Auth component: Shows login/logout button and handles redirect after login
const Auth = () => {
  const { isLoading, auth } = usePuterStore(); // Zustand store for auth state
  const location = useLocation(); // React Router location
  const next = location.search.split('next=')[1]; // Get redirect path from query string
  const navigate = useNavigate(); // React Router navigation

  // Redirect to 'next' page after successful authentication
  useEffect(() => {
    if (auth.isAuthenticated) navigate(next);
  }, [auth.isAuthenticated, next]);

  return (
    <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
      <div className='gradient-border shadow-lg'>
        <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1>Welcome</h1>
            <h2>Log In to Continue Your Job Journey</h2>
          </div>
          <div>
            {isLoading ? (
              // Show loading state while signing in
              <button className="auth-button animate-pulse">
                <p>Signing you in...</p>
              </button>
            ) : (
              <>
                {auth.isAuthenticated ? (
                  // Show logout button if authenticated
                  <button className="auth-button" onClick={auth.signOut}>
                    <p>Log Out</p>
                  </button>
                ) : (
                  // Show login button if not authenticated
                  <button className="auth-button" onClick={auth.signIn}>
                    <p>Log In</p>
                  </button>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default Auth