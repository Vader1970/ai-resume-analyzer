// WipeApp route: Allows the user to delete all files and key-value data in the app
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const WipeApp = () => {
    const { auth, isLoading, error, clearError, fs, ai, kv } = usePuterStore(); // Zustand store for auth, file system, AI, and kv
    const navigate = useNavigate(); // React Router navigation
    const [files, setFiles] = useState<FSItem[]>([]); // List of files in root directory

    // Load all files in the root directory
    const loadFiles = async () => {
        const files = (await fs.readDir("./")) as FSItem[];
        setFiles(files);
    };

    // On mount, load files
    useEffect(() => {
        loadFiles();
    }, []);

    // Redirect to auth page if not authenticated
    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate("/auth?next=/wipe");
        }
    }, [isLoading]);

    // Delete all files and flush key-value store
    const handleDelete = async () => {
        files.forEach(async (file) => {
            await fs.delete(file.path);
        });
        await kv.flush();
        loadFiles();
    };

    // Show loading state
    if (isLoading) {
        return <div>Loading...</div>;
    }

    // Show error state
    if (error) {
        return <div>Error {error}</div>;
    }

    return (
        <div>
            {/* Show authenticated user */}
            Authenticated as: {auth.user?.username}
            <div>Existing files:</div>
            <div className="flex flex-col gap-4">
                {/* List all files */}
                {files.map((file) => (
                    <div key={file.id} className="flex flex-row gap-4">
                        <p>{file.name}</p>
                    </div>
                ))}
            </div>
            <div>
                {/* Button to wipe all app data */}
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer"
                    onClick={() => handleDelete()}
                >
                    Wipe App Data
                </button>
            </div>
        </div>
    );
};

export default WipeApp;
