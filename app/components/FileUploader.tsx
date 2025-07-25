// FileUploader component: Handles PDF file selection via drag-and-drop or click
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "../lib/utils";

// Props for FileUploader
interface FileUploaderProps {
    onFileSelect: (file: File | null) => void; // Callback when a file is selected or removed
    id?: string; // Optional id for the input element
}

// FileUploader: Allows user to upload a single PDF file
const FileUploader = ({ onFileSelect, id }: FileUploaderProps) => {
    // Handle file drop event
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0] || null;

            onFileSelect?.(file);
        },
        [onFileSelect]
    );

    // Maximum allowed file size (20MB)
    const maxFileSize = 20 * 1024 * 1024;

    // Set up dropzone for PDF files only
    const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
        useDropzone({
            onDrop,
            multiple: false,
            accept: {
                "application/pdf": [".pdf"],
            },
            maxSize: maxFileSize,
        });

    // Currently selected file (if any)
    const file = acceptedFiles[0] || null;

    return (
        <div className="w-full gradient-border">
            {/* Dropzone clickable area */}
            <div {...getRootProps()} className="w-full h-full">
                <input {...getInputProps({ id })} />

                <div className="space-y-4 cursor-pointer">

                    {file ? (
                        // Show selected file details
                        <div className="uploader-selected-file" onClick={(e) => e.stopPropagation()}>
                            <img src="/images/pdf.png" alt="pdf" className="size-10" />
                            <div className="flex items-center space-x-3">

                                <div>
                                    <p className="text-sm font-medium text-gray-500 truncate max-w-xs">
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            {/* Remove file button */}
                            <button className="p-2 cursor-pointer" onClick={(e) => {
                                onFileSelect?.(null)
                            }}>
                                <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        // Show upload prompt
                        <div>
                            <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                                <img src="/icons/info.svg" alt="upload" className="size-20" />
                            </div>
                            <p className="text-lg text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag
                                and drop
                            </p>
                            <p className="text-lg text-gray-500">
                                PDF (max {formatSize(maxFileSize)})
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileUploader;
