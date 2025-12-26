import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { imageBase64, pdfDataList } = req.body;

  if (!imageBase64 || !pdfDataList || pdfDataList.length === 0) {
    return res.status(400).json({ error: "Thiếu dữ liệu ảnh hoặc file PDF style guide." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 1. Chuẩn bị dữ liệu PDF (Chuyển từ base64 frontend gửi lên)
    const pdfParts = pdfDataList.map(base64Str => ({
      inlineData: {
        data: base64Str.split(",")[1],
        mimeType: "application/pdf"
      }
    }));

    // 2. Chuẩn bị dữ liệu ảnh sản phẩm
    const productImagePart = {
      inlineData: {
        data: imageBase64.split(",")[1],
        mimeType: "image/jpeg"
      }
    };

    // 3. Prompt hướng dẫn AI so sánh
    const prompt = `
      Bạn là một chuyên gia phân tích phong cách thiết kế. 
      Tôi đã gửi cho bạn các file PDF chứa Style Guide (quy định về phong cách) và một ảnh sản phẩm.
      
      NHIỆM VỤ:
      1. Đọc kỹ nội dung chữ và xem các hình ảnh minh họa trong (các) file PDF để hiểu các style khác nhau.
      2. Phân tích ảnh sản phẩm tải lên.
      3. So sánh sản phẩm với các style trong PDF và xác định sản phẩm thuộc style nào.
      
      TRẢ VỀ KẾT QUẢ DẠNG JSON:
      {
        "style": "Tên style khớp nhất",
        "reason": "Giải thích chi tiết tại sao (dựa trên màu sắc, chất liệu, kiểu dáng được mô tả trong PDF so với ảnh)"
      }
    `;

    const result = await model.generateContent([prompt, ...pdfParts, productImagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Làm sạch chuỗi JSON nếu AI trả về kèm markdown
    const cleanJson = text.replace(/```json|```/g, "");
    res.status(200).json(JSON.parse(cleanJson));

  } catch (error) {
    console.error("Lỗi AI:", error);
    res.status(500).json({ error: "Lỗi khi phân tích dữ liệu." });
  }
}
