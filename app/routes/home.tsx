// Home route: Displays the dashboard with user's resumes and feedback
import { Link, useNavigate, type MetaFunction } from "react-router";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { Footer } from "~/components/Footer";
import SignOutButton from "../components/SignOutButton";

// Page metadata for SEO
export const meta: MetaFunction = () => {
  return [
    { title: "ResumeAI" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { auth, kv, fs } = usePuterStore(); // Zustand store for auth and key-value
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

        const parsedResumes = resumes?.map((resume) => {
          try {
            return JSON.parse(resume.value) as Resume;
          } catch (parseError) {
            console.error('Failed to parse resume:', resume.key, parseError);
            return null;
          }
        }).filter(Boolean) as Resume[];

        setResumes(parsedResumes || []);
      } catch (err) {
        console.error("Failed to load resumes", err);
      } finally {
        setLoadingResumes(false);
      }
    }
    loadResumes();
  }, [])

  // Refresh resumes from KV store
  const refreshResumes = async () => {
    try {
      setLoadingResumes(true);
      const resumes = (await kv.list('resume:*', true)) as KVItem[];

      const parsedResumes = resumes?.map((resume) => {
        try {
          return JSON.parse(resume.value) as Resume;
        } catch (parseError) {
          console.error('Failed to parse resume on refresh:', resume.key, parseError);
          return null;
        }
      }).filter(Boolean) as Resume[];

      setResumes(parsedResumes || []);
    } catch (err) {
      console.error("Failed to refresh resumes", err);
    } finally {
      setLoadingResumes(false);
    }
  };

  // Handle resume deletion
  const handleResumeDelete = (deletedId: string) => {
    setResumes(prevResumes => prevResumes.filter(resume => resume.id !== deletedId));
  };

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
              <>
                <h2>Review your submissions and check AI-powered feedback.</h2>
                <div className="flex flex-col items-center justify-center mt-4 mb-4">
                  <SignOutButton />
                </div>
              </>
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
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  onDelete={handleResumeDelete}
                  onRefresh={refreshResumes}
                />
              ))}
            </div>
          )}

          {/* Show upload button if no resumes exist */}
          {!loadingResumes && resumes?.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-10 gap-4">
              <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
                Upload Resume
              </Link>
              <div className="flex flex-col items-center justify-center mt-4 mb-4">
                <SignOutButton />
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
