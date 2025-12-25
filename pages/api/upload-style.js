import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // cực kỳ quan trọng
  },
};

// helper để dùng promise với formidable
const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    const form = formidable({ multiples: true, uploadDir, keepExtensions: true });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { files } = await parseForm(req);

    // frontend gửi key "pdfs"
    const uploadedFiles = Array.isArray(files.pdfs) ? files.pdfs : [files.pdfs];

    uploadedFiles.forEach(file => console.log("Uploaded PDF:", file.newFilename));

    return res.status(200).json({
      message: `${uploadedFiles.length} PDF(s) uploaded successfully!`,
      files: uploadedFiles.map(f => f.newFilename),
    });

  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
}
