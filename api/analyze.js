import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: "No image provided" });

  try {
    const dataPath = path.join(process.cwd(), "public/uploads/pdfData.json");
    if (!fs.existsSync(dataPath)) return res.status(400).json({ error: "Please upload PDFs first" });

    const pdfData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    // Mô phỏng: bạn có thể dùng OpenAI/CLIP để so sánh ảnh vs text PDF
    const style = "Scandinavian";
    const reason = "Light colors, clean lines, minimalism, matching style guide text.";

    res.status(200).json({ style, reason });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failed" });
  }
}
