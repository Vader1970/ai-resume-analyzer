// Upload route: Handles uploading, analyzing, and storing a resume for feedback
import { prepareInstructions } from "../../constants";
import { useState } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import { Footer } from "~/components/Footer";
import Navbar from "~/components/Navbar";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore(); // Zustand store for auth, file system, AI, and kv
  const navigate = useNavigate(); // React Router navigation
  const [isProcessing, setIsProcessing] = useState(false); // Processing state
  const [statusText, setStatusText] = useState(""); // Status message for user
  const [file, setFile] = useState<File | null>(null); // Selected file

  // Handle file selection from FileUploader
  const handleFileSelect = (file: File | null) => {
    setFile(file);
  }

  // Handle the full analysis workflow: upload, convert, analyze, store
  const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File }) => {
    setIsProcessing(true);
    setStatusText("Uploading the file...");
    const uploadedFile = await fs.upload([file]);
    if (!uploadedFile) return setStatusText("Failed to upload the file");

    setStatusText("Converting to image...");
    const imageFile = await convertPdfToImage(file);
    if (!imageFile.file) return setStatusText("Failed to convert PDF to image");

    setStatusText("Uploading the image...");
    const uploadedImage = await fs.upload([imageFile.file]);
    if (!uploadedImage) return setStatusText("Failed to upload the image");

    setStatusText("Preparing data...");

    // Prepare and store initial resume data
    const uuid = generateUUID();
    const data = {
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      companyName,
      jobTitle,
      jobDescription,
      feedback: "",
    }
    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    setStatusText("Analyzing...");

    // Run AI feedback analysis
    const feedback = await ai.feedback(
      uploadedImage.path,
      prepareInstructions({ jobTitle, jobDescription })
    )
    if (!feedback) return setStatusText("Error:Failed to analyze the resume");

    // Extract feedback text from AI response
    const feedbackText = typeof feedback.message.content === "string"
      ? feedback.message.content
      : feedback.message.content[0].text;

    // Remove Markdown code block if present
    const cleanedFeedbackText = feedbackText.replace(/```json|```/g, "").trim();

    // Store feedback in resume data
    data.feedback = JSON.parse(cleanedFeedbackText);
    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setStatusText("Analysis complete, redirecting...");
    navigate(`/resume/${uuid}`);
  }

  // Handle form submission for resume upload and analysis
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);

    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    if (!file) return;

    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart feedback for your dream job</h1>
          {/* Show status and animation while processing */}
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img
                src="/images/resume-scan.gif"
                alt="resume-scan"
                className="w-full"
              />
            </>
          ) : (
            <h2>
              Drop your resume for an Automtic Tracking System score and
              improvement tips
            </h2>
          )}
          {/* Show upload form if not processing */}
          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Company Name"
                  id="company-name"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="Job Title"
                  id="job-title"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={5}
                  name="job-description"
                  placeholder="Job Description"
                  id="job-description"
                />
              </div>
              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} id="uploader" />
              </div>

              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default Upload;
