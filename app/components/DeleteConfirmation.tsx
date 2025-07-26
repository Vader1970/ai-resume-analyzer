// DeleteConfirmation component: Shows a confirmation popup for deleting a resume
import { useEffect } from "react";

interface DeleteConfirmationProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    resumeName: string;
}

const DeleteConfirmation = ({ isOpen, onClose, onConfirm, resumeName }: DeleteConfirmationProps) => {
    // Close modal when Escape key is pressed
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <img src="/icons/warning.svg" alt="warning" className="w-6 h-6" />
                        <h3 className="text-xl font-semibold text-gray-900">Delete Resume</h3>
                    </div>

                    <p className="text-gray-600">
                        You are about to delete <span className="font-semibold">{resumeName}</span>, do you wish to continue?
                    </p>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            No
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Yes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmation; 