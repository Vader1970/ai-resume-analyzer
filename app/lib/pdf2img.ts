// PDF to Image conversion utilities using pdfjs-dist

// Result type for PDF conversion
export interface PdfConversionResult {
    imageUrl: string; // URL for the generated image
    file: File | null; // Image file object
    error?: string; // Optional error message
}

let pdfjsLib: any = null; // Cached pdfjs library
let isLoading = false; // Loading state for pdfjs
let loadPromise: Promise<any> | null = null; // Promise for loading pdfjs

// Dynamically load pdfjs library and set up worker
async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    isLoading = true;
    // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
    loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
      // Set the worker source to use local file
      lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      pdfjsLib = lib;
      isLoading = false;
      return lib;
    });

    return loadPromise;
}

// Convert the first page of a PDF file to a PNG image
export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
      const lib = await loadPdfJs();

      // Read PDF as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1); // Only first page

      // Set up canvas for rendering
      const viewport = page.getViewport({ scale: 4 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (context) {
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
      }

      // Render PDF page to canvas
      await page.render({ canvasContext: context!, viewport }).promise;

      // Convert canvas to PNG blob and return result
      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create a File from the blob with the same name as the pdf
              const originalName = file.name.replace(/\.pdf$/i, "");
              const imageFile = new File([blob], `${originalName}.png`, {
                type: "image/png",
              });

              resolve({
                imageUrl: URL.createObjectURL(blob),
                file: imageFile,
              });
            } else {
              resolve({
                imageUrl: "",
                file: null,
                error: "Failed to create image blob",
              });
            }
          },
          "image/png",
          1.0
        ); // Set quality to maximum (1.0)
      });
    } catch (err) {
      return {
        imageUrl: "",
        file: null,
        error: `Failed to convert PDF: ${err}`,
      };
    }
}
  