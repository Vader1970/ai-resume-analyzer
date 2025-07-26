// ResumeCard component: Displays a summary card for a resume with preview and score
import { Link } from "react-router";
import ScoreCircle from "./ScoreCircle";
import DeleteConfirmation from "./DeleteConfirmation";
import { usePuterStore } from "~/lib/puter";
import { useEffect, useState } from "react";

// Props: expects a resume object and optional onDelete callback
const ResumeCard = ({
  resume: { id, companyName, jobTitle, feedback, imagePath, resumePath },
  onDelete,
  onRefresh,
}: {
  resume: Resume;
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
}) => {
  const { fs, kv } = usePuterStore(); // File system and KV store access
  const [resumeUrl, setResumeUrl] = useState(""); // Local URL for resume image
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Delete confirmation state
  const [isDeleting, setIsDeleting] = useState(false); // Deletion in progress state

  // Load resume image as blob and create object URL
  useEffect(() => {
    const loadResume = async () => {
      try {
        const blob = await fs.read(imagePath);
        if (!blob) {
          return;
        }
        let url = URL.createObjectURL(blob);
        setResumeUrl(url);
      } catch (error) {
        // Don't set resumeUrl if image fails to load
        setResumeUrl("");
      }
    }

    loadResume();
  }, [imagePath])

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    let deletionErrors: string[] = [];

    try {
      // Delete the resume file
      try {
        await fs.delete(resumePath);
      } catch (error) {
        deletionErrors.push(`Resume file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Delete the image file
      try {
        await fs.delete(imagePath);
      } catch (error) {
        deletionErrors.push(`Image file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Delete from KV store
      try {
        const kvResult = await kv.del(`resume:${id}`);
        if (kvResult === false) {
          throw new Error('KV store deletion returned false');
        }
      } catch (error) {
        deletionErrors.push(`KV store: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Call the onDelete callback to update the parent component
      onDelete?.(id);

      // Also call refresh as a fallback to ensure UI updates
      onRefresh?.();

      // If KV store deletion failed, force a refresh after a short delay
      if (deletionErrors.some(error => error.includes('KV store'))) {
        setTimeout(() => {
          onRefresh?.();
        }, 1000);
      }

      // Show success message if there were no errors, or partial success if some operations failed
      if (deletionErrors.length === 0) {
        // Success - no message needed
      } else {
        alert(`Resume deleted with some issues:\n${deletionErrors.join('\n')}`);
      }

    } catch (error) {
      alert(`Failed to delete resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Get display name for the resume
  const getResumeName = () => {
    if (companyName && jobTitle) {
      return `${companyName} - ${jobTitle}`;
    } else if (companyName) {
      return companyName;
    } else if (jobTitle) {
      return jobTitle;
    }
    return "Resume";
  };

  return (
    <>
      <div className="resume-card animate-in fade-in duration-1000 relative">
        {/* Delete button positioned in top-left corner */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowDeleteConfirm(true);
          }}
          className="relative w-full z-10 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium"
          disabled={isDeleting}
        >
          Delete Submission
        </button>

        <Link to={`/resume/${id}`} className="block">
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
      </div>

      {/* Delete confirmation popup */}
      <DeleteConfirmation
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        resumeName={getResumeName()}
      />
    </>
  );
};

export default ResumeCard;
