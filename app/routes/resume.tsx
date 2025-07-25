// Resume review route: Shows detailed feedback and preview for a specific resume
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router"
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Summary from "~/components/Summary";
import { usePuterStore } from "~/lib/puter";

// Page metadata for SEO
export const meta = () => ([
    { title: 'ResumeAI | Review' },
    { name: 'description', content: 'Detailed overview of your resume' },
])

const resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore(); // Zustand store for auth, file system, and kv
    const { id } = useParams(); // Resume ID from URL
    const [imageUrl, setImageUrl] = useState(""); // URL for resume image preview
    const [resumeUrl, setResumeUrl] = useState(""); // URL for resume PDF
    const [feedback, setFeedback] = useState<any>(null); // Feedback data
    const navigate = useNavigate(); // React Router navigation

    // Redirect to auth page if not authenticated
    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading]);

    // Load resume data, image, and feedback from storage
    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);

            if (!resume) return;

            const data = JSON.parse(resume);

            // Load PDF file and create object URL
            const resumeBlob = await fs.read(data.resumePath);
            if (!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            // Load image preview and create object URL
            const imageBlob = await fs.read(data.imagePath);
            if (!imageBlob) return;

            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);

            // Set feedback data
            setFeedback(data.feedback);
        }

        loadResume();
    }, [id]);

    return (
        <main className="!pt-0">
            {/* Navigation back to homepage */}
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                {/* Left: Resume image preview */}
                <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-w-xl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img src={imageUrl} className="w-full h-full object-contain rounded-2xl" title="resume" />
                            </a>
                        </div>
                    )}
                </section>
                {/* Right: Feedback and details */}
                <section className="feedback-section">
                    <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        // Loading animation while feedback is loading
                        <img src="/images/resume-scan-2.gif" className="w-full" alt="resume-scan" />
                    )}
                </section>
            </div>
        </main>
    )
}

export default resume