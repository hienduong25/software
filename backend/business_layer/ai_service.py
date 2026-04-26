import json
import os
import re
from typing import Any, Dict

import requests

from business_layer.exceptions import ValidationError


class AIService:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY", "")
        self.model = os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001")
        self.api_url = "https://api.anthropic.com/v1/messages"

    def _build_prompt(self, payload: Dict[str, Any]) -> str:
        return (
            "Bạn là chuyên gia tuyển dụng giàu kinh nghiệm. Nhiệm vụ của bạn là chấm điểm mức độ phù hợp "
            "giữa hồ sơ ứng viên và vị trí tuyển dụng một cách khách quan, chi tiết.\n\n"

            "## TIÊU CHÍ CHẤM ĐIỂM (tổng 100 điểm)\n\n"

            "### 1. Kỹ năng chuyên môn (35 điểm)\n"
            "- Đối chiếu từng kỹ năng trong CV với yêu cầu công việc\n"
            "- Kỹ năng bắt buộc (must-have) có trọng số cao hơn kỹ năng tốt có thêm (nice-to-have)\n"
            "- Xem xét cả kỹ năng tương đương hoặc liên quan\n\n"

            "### 2. Kinh nghiệm làm việc (25 điểm)\n"
            "- Số năm kinh nghiệm so với yêu cầu\n"
            "- Mức độ liên quan của các vị trí đã từng làm\n"
            "- Chất lượng và độ phức tạp của công việc đã thực hiện\n\n"

            "### 3. Vị trí & định hướng nghề nghiệp (20 điểm)\n"
            "- Vị trí mong muốn của ứng viên có khớp với vị trí tuyển dụng không\n"
            "- Lộ trình nghề nghiệp có phù hợp không\n"
            "- Mức lương kỳ vọng (nếu có) so với mức lương đăng tuyển\n\n"

            "### 4. Chất lượng & độ đầy đủ của hồ sơ (10 điểm)\n"
            "- CV có đầy đủ thông tin cần thiết không\n"
            "- Nội dung CV rõ ràng, mạch lạc, chuyên nghiệp không\n"
            "- Có portfolio, link dự án, chứng chỉ liên quan không\n\n"

            "### 5. Yếu tố địa điểm & điều kiện (10 điểm)\n"
            "- Địa điểm làm việc có phù hợp không\n"
            "- Các điều kiện khác phù hợp không\n\n"

            "## QUY TẮC CHẤM\n"
            "- Score 90-100: Ứng viên xuất sắc, đáp ứng vượt mức yêu cầu\n"
            "- Score 70-89: Phù hợp tốt, đáp ứng hầu hết yêu cầu\n"
            "- Score 50-69: Phù hợp trung bình, còn một số điểm chưa đáp ứng\n"
            "- Score 30-49: Phù hợp thấp, thiếu nhiều yêu cầu quan trọng\n"
            "- Score 0-29: Không phù hợp, thiếu hầu hết yêu cầu cốt lõi\n\n"
            "- Nếu thông tin ứng viên quá ít (thiếu skills, experience, cv_content) thì score không vượt quá 40\n"
            "- Phải chấm dựa trên dữ liệu thực tế, không suy đoán hay thêm thông tin không có\n\n"

            "## OUTPUT\n"
            "Trả về CHỈ một JSON hợp lệ, không có markdown, không có giải thích ngoài JSON:\n"
            "{\n"
            '  "score": <số nguyên 0-100>,\n'
            '  "summary": "<tóm tắt 2-3 câu bằng tiếng Việt, nêu rõ lý do điểm số>",\n'
            '  "strengths": ["<điểm mạnh cụ thể 1>", "<điểm mạnh cụ thể 2>", ...],\n'
            '  "weaknesses": ["<điểm còn thiếu/yếu cụ thể 1>", "<điểm còn thiếu/yếu cụ thể 2>", ...]\n'
            "}\n\n"

            "## DỮ LIỆU ĐẦU VÀO\n"
            f"{json.dumps(payload, ensure_ascii=False, indent=2)}"
        )

    def _extract_json(self, text: str) -> Dict[str, Any]:
        if not text:
            return {}

        text = text.strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                return {}

        return {}

    def analyze_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if not isinstance(payload, dict):
            raise ValidationError("Payload phân tích không hợp lệ.")

        if not self.api_key:
            raise ValidationError("Chưa cấu hình ANTHROPIC_API_KEY trong file .env.")

        prompt = self._build_prompt(payload)

        response = requests.post(
            self.api_url,
            headers={
                "x-api-key": self.api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": self.model,
                "max_tokens": 1024,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
            },
            timeout=60,
        )
        response.raise_for_status()

        raw_text = response.json()["content"][0]["text"]
        analysis = self._extract_json(raw_text)

        if not isinstance(analysis, dict) or "score" not in analysis:
            raise ValidationError("AI trả về kết quả không hợp lệ. Vui lòng thử lại.")

        try:
            score = int(float(analysis["score"]))
        except (TypeError, ValueError):
            score = 0

        analysis["score"] = max(0, min(score, 100))
        analysis.setdefault("summary", "")
        analysis.setdefault("strengths", [])
        analysis.setdefault("weaknesses", [])
        return analysis
