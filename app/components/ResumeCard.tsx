// ResumeCard component: Displays a summary card for a resume with preview and score
import { Link } from "react-router";
import ScoreCircle from "./ScoreCircle";
import { usePuterStore } from "~/lib/puter";
import { useEffect, useState } from "react";

// Props: expects a resume object
const ResumeCard = ({
  resume: { id, companyName, jobTitle, feedback, imagePath },
}: {
  resume: Resume;
}) => {
  const { fs } = usePuterStore(); // File system access from store
  const [resumeUrl, setResumeUrl] = useState(""); // Local URL for resume image

  // Load resume image as blob and create object URL
  useEffect(() => {
    const loadResume = async () => {
      const blob = await fs.read(imagePath);
      if (!blob) return;
      let url = URL.createObjectURL(blob);
      setResumeUrl(url);
    }

    loadResume();
  }, [imagePath])

  return (
    <Link
      to={`/resume/${id}`}
      className="resume-card animate-in fade-in duration-1000"
    >
      {/* Header: company, job title, or fallback, and score */}
      <div className="resume-card-header">
        <div className="flex flex-col gap-2">
          {companyName && <h2 className="!text-black font-bold break-words">{companyName}</h2>}
          {jobTitle && <h3 className="text-lg break-words text-gray-500">{jobTitle}</h3>}
          {!companyName && !jobTitle && <h3 className="!text-black font-bold">Resume</h3>}
        </div>
        <div className="flex-shrink-0">
          <ScoreCircle score={feedback.overallScore} />
        </div>
      </div>
      {/* Resume image preview, if available */}
      {resumeUrl && (
        <div className="gradient-border animate-in fade-in duration-1000">
          <div className="w-full h-full">
            <img
              src={resumeUrl}
              alt="resume"
              className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
            />
          </div>
        </div>
      )}
    </Link>
  );
};

export default ResumeCard;
