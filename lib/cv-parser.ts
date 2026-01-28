/**
 * Extract text content from a PDF file
 * Note: pdf-parse has compatibility issues with ESM, so we use a try-catch approach
 */
export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to parse PDF file");
  }
}

/**
 * Extract text content from a DOCX file
 */
export async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("Error parsing DOCX:", error);
    throw new Error("Failed to parse DOCX file");
  }
}


/**
 * Parse CV file and extract text based on file type
 */
export async function parseCV(
  file: File | Buffer,
  fileType?: string
): Promise<string> {
  let buffer: Buffer;
  let type: string;

  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
    type = file.type;
  } else {
    buffer = file;
    type = fileType || "";
  }

  if (type === "application/pdf" || type.endsWith(".pdf")) {
    return parsePDF(buffer);
  } else if (
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    type.endsWith(".docx")
  ) {
    return parseDOCX(buffer);
  } else {
    throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
  }
}

/**
 * Clean and normalize extracted CV text
 */
export function cleanCVText(text: string): string {
  return (
    text
      // Remove excessive whitespace
      .replace(/\s+/g, " ")
      // Remove excessive newlines
      .replace(/\n{3,}/g, "\n\n")
      // Trim
      .trim()
  );
}

/**
 * Extract sections from CV text (basic heuristic)
 */
export function extractCVSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const sectionHeaders = [
    "summary",
    "profile",
    "objective",
    "experience",
    "work experience",
    "employment",
    "education",
    "skills",
    "certifications",
    "projects",
    "achievements",
    "awards",
    "languages",
    "references",
  ];

  const lines = text.split("\n");
  let currentSection = "header";
  let currentContent: string[] = [];

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();
    const isHeader = sectionHeaders.some(
      (header) =>
        lowerLine === header ||
        lowerLine.startsWith(header + ":") ||
        lowerLine.startsWith(header + " ")
    );

    if (isHeader) {
      // Save previous section
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join("\n").trim();
      }
      // Start new section
      currentSection = lowerLine.split(":")[0].split(" ")[0];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join("\n").trim();
  }

  return sections;
}
