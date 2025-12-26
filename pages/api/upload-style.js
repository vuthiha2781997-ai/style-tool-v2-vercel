import formidable from "formidable";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    const form = formidable({ multiples: true, uploadDir, keepExtensions: true });
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: "Upload failed" });

      const uploadedFiles = Array.isArray(files.pdfs) ? files.pdfs : [files.pdfs];
      const pdfData = [];

      for (let file of uploadedFiles) {
        const buffer = fs.readFileSync(file.filepath);
        const data = await pdfParse(buffer);
        pdfData.push({ filename: file.newFilename, text: data.text });
      }

      fs.writeFileSync(path.join(uploadDir, "pdfData.json"), JSON.stringify(pdfData, null, 2));
      res.status(200).json({ message: "PDF(s) uploaded and parsed!", files: uploadedFiles.map(f => f.newFilename) });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
