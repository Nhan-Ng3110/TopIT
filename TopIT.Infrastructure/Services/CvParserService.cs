using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using TopIT.Core.DTOs;
using UglyToad.PdfPig;

namespace TopIT.Infrastructure.Services
{
    public class CvParserService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _apiKey;
        private readonly string _modelName;

        private static readonly JsonSerializerOptions _parseOptions = new()
        {
            PropertyNameCaseInsensitive = true,
            AllowTrailingCommas = true,
            ReadCommentHandling = JsonCommentHandling.Skip
        };

        public CvParserService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _apiKey = configuration["GeminiSettings:ApiKey"] ?? throw new InvalidOperationException("GeminiSettings:ApiKey not configured.");
            _modelName = configuration["GeminiSettings:ModelName"] ?? "gemini-flash-latest";
        }

        /// <summary>
        /// Trích xuất text từ file PDF bằng PdfPig.
        /// </summary>
        public async Task<string> ExtractTextFromPdfAsync(IFormFile file)
        {
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            ms.Position = 0;

            var sb = new StringBuilder();
            using var document = PdfDocument.Open(ms.ToArray());
            foreach (var page in document.GetPages())
            {
                sb.AppendLine(page.Text);
            }

            var text = sb.ToString();
            text = Regex.Replace(text, @"\r\n+", "\n");
            text = Regex.Replace(text, @"\n+", "\n");
            text = Regex.Replace(text, @"[ \t]+", " ");

            return text.Trim();
        }

        /// <summary>
        /// Gọi Gemini AI để phân tích text CV và trả về ParsedCvDto.
        /// Sử dụng response_mime_type để ép Gemini trả về JSON thuần.
        /// </summary>
        public async Task<ParsedCvDto> ParseCvTextAsync(string cvText)
        {
            if (cvText.Length < 80)
                throw new InvalidOperationException("PDF_TOO_SHORT");

            // Prompt chỉ mô tả schema và yêu cầu, không cần cấm markdown vì đã dùng response_mime_type
            var prompt =
                "Bạn là AI chuyên phân tích CV xin việc. Hãy đọc nội dung CV bên dưới và trích xuất thông tin vào đúng JSON schema sau.\n\n" +
                "Quy tắc:\n" +
                "- Nếu không có thông tin, để chuỗi rỗng \"\" hoặc mảng rỗng [].\n" +
                "- technicalSkills và softSkills là chuỗi phẳng, phân cách nhau bằng dấu phẩy.\n" +
                "- Giữ nguyên tiếng Việt, không dịch.\n\n" +
                "JSON schema:\n" +
                "{\n" +
                "  \"fullName\": \"string\",\n" +
                "  \"email\": \"string\",\n" +
                "  \"phone\": \"string\",\n" +
                "  \"summary\": \"string\",\n" +
                "  \"technicalSkills\": \"string\",\n" +
                "  \"softSkills\": \"string\",\n" +
                "  \"experiences\": [{\"company\":\"string\",\"position\":\"string\",\"duration\":\"string\",\"description\":\"string\"}],\n" +
                "  \"educations\": [{\"school\":\"string\",\"major\":\"string\",\"duration\":\"string\",\"description\":\"string\"}],\n" +
                "  \"projects\": [{\"name\":\"string\",\"duration\":\"string\",\"description\":\"string\"}]\n" +
                "}\n\n" +
                "Nội dung CV:\n" +
                cvText;

            // Serialize request body thủ công để kiểm soát hoàn toàn cấu trúc
            var requestObj = new
            {
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[] { new { text = prompt } }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.1,
                    maxOutputTokens = 4096,
                    responseMimeType = "application/json"
                }
            };

            var requestJson = JsonSerializer.Serialize(requestObj);
            var httpContent = new StringContent(requestJson, Encoding.UTF8, "application/json");

            var client = _httpClientFactory.CreateClient("Gemini");
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_modelName}:generateContent?key={_apiKey}";

            var response = await client.PostAsync(url, httpContent);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Gemini API lỗi {(int)response.StatusCode}: {errorBody}");
            }

            var responseBody = await response.Content.ReadAsStringAsync();

            // Trích xuất chuỗi JSON từ response của Gemini
            string rawJson;
            try
            {
                using var doc = JsonDocument.Parse(responseBody);
                rawJson = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString() ?? "{}";
            }
            catch (Exception ex)
            {
                throw new HttpRequestException($"Không đọc được response từ Gemini. Body: {responseBody}", ex);
            }

            // Vì đã dùng responseMimeType=application/json, rawJson phải là JSON sạch.
            // Vẫn dùng CleanJson phòng trường hợp model cũ không hỗ trợ.
            var cleanedJson = CleanJson(rawJson);

            try
            {
                var parsed = JsonSerializer.Deserialize<ParsedCvDto>(cleanedJson, _parseOptions);
                return parsed ?? new ParsedCvDto();
            }
            catch (JsonException ex)
            {
                throw new JsonException($"AI trả về JSON không hợp lệ. Raw: {rawJson}", ex);
            }
        }

        /// <summary>
        /// Dự phòng: loại bỏ markdown fence nếu model bọc JSON trong code block.
        /// </summary>
        private static string CleanJson(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return "{}";

            // Tìm trong code block ```json ... ``` hoặc ``` ... ```
            var match = Regex.Match(raw, @"```(?:json)?\s*([\s\S]*?)\s*```");
            if (match.Success)
            {
                var json = match.Groups[1].Value.Trim();
                if (!string.IsNullOrEmpty(json)) return json;
            }

            // Tìm cặp ngoặc nhọn {} ngoài cùng
            var startIdx = raw.IndexOf('{');
            var endIdx = raw.LastIndexOf('}');
            if (startIdx >= 0 && endIdx > startIdx)
                return raw.Substring(startIdx, endIdx - startIdx + 1).Trim();

            return raw.Trim();
        }
    }
}
