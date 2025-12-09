import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { execa } from "execa";

export async function generatePDF(latex: string): Promise<Buffer> {
  const tempDir = tmpdir();
  const texFile = join(tempDir, `temp-${Date.now()}.tex`);
  const pdfFile = texFile.replace(".tex", ".pdf");

  // Write LaTeX content to temp file
  await writeFile(texFile, latex, "utf8");

  try {
    // Compile using tectonic
    await execa("tectonic", [texFile, "--outdir", tempDir]);

    // Read the generated PDF
    const pdfBuffer = await import("fs").then((fs) =>
      fs.promises.readFile(pdfFile),
    );

    return pdfBuffer;
  } catch (error) {
    console.error("LaTeX compile error:", error);
    throw new Error("Failed to compile LaTeX to PDF");
  } finally {
    // Clean up temp files
    await unlink(texFile).catch(() => {});
    await unlink(pdfFile).catch(() => {});
  }
}
