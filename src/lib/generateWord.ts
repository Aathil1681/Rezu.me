import { Document, Packer, Paragraph } from "docx";

export async function generateDoc(content: string) {
  const doc = new Document({
    sections: [{ children: [new Paragraph(content)] }],
  });

  const buffer = await Packer.toBlob(doc);
  return buffer;
}
