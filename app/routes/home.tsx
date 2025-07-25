// Home route: Displays the dashboard with user's resumes and feedback
import { Link, useNavigate, type MetaFunction } from "react-router";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { Footer } from "~/components/Footer";

// Page metadata for SEO
export const meta: MetaFunction = () => {
  return [
    { title: "ResumeAI" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore(); // Zustand store for auth and key-value
  const navigate = useNavigate(); // React Router navigation
  const [resumes, setResumes] = useState<Resume[]>([]); // List of resumes
  const [loadingResumes, setLoadingResumes] = useState(false); // Loading state

  // Redirect to auth page if not authenticated
  useEffect(() => {
    if (!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated]);

  // Load resumes from key-value store on mount
  useEffect(() => {
    const loadResumes = async () => {
      try {
        setLoadingResumes(true);
        const resumes = (await kv.list('resume:*', true)) as KVItem[];
        const parsedResumes = resumes?.map((resume) => (
          JSON.parse(resume.value) as Resume
        ))
        setResumes(parsedResumes || []);
      } catch (err) {
        // Optionally, set an error state or log
        console.error("Failed to load resumes", err);
      } finally {
        setLoadingResumes(false);
      }
    }
    loadResumes();
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <main className="flex-1">
        <section className="main-section">
          <div className="page-heading py-16">
            <h1>Track Your Application & Resume</h1>
            {/* Show message based on whether resumes exist */}
            {!loadingResumes && resumes?.length === 0 ? (
              <h2>No resumes found. Upload your first resume to get feedback.</h2>
            ) : (
              <h2>Review your submissions and check AI-powered feedback.</h2>
            )}
          </div>
          {/* Loading animation while resumes are loading */}
          {loadingResumes && (
            <div className="flex flex-col items-center justify-center">
              <img src="/images/resume-scan-2.gif" alt="resume-scan" className="w-[200px]" />
            </div>
          )}

          {/* Show resume cards if resumes exist */}
          {!loadingResumes && resumes.length > 0 && (
            <div className="resumes-section">
              {resumes.map((resume) => (
                <ResumeCard key={resume.id} resume={resume} />
              ))}
            </div>
          )}

          {/* Show upload button if no resumes exist */}
          {!loadingResumes && resumes?.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-10 gap-4">
              <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
                Upload Resume
              </Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
