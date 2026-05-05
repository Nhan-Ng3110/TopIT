using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TopIT.Core.DTOs;
using TopIT.Infrastructure.Data;

namespace TopIT.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChatController(AppDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        /// <summary>
        /// GET /api/chat/conversations
        /// Trả về danh sách các hội thoại (gần nhất) của user hiện tại.
        /// </summary>
        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations()
        {
            var userId = GetCurrentUserId();

            var messages = await _context.ChatMessages
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Include(m => m.Job)
                .OrderByDescending(m => m.SentAt)
                .ToListAsync();

            // Nhóm theo partner
            var conversations = messages
                .GroupBy(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
                .Select(g =>
                {
                    var last = g.First(); // đã sort desc
                    var partner = last.SenderId == userId ? last.Receiver : last.Sender;
                    return new ConversationDto
                    {
                        PartnerId = partner.Id,
                        PartnerName = partner.FullName,
                        LastMessage = last.Content,
                        LastMessageTime = last.SentAt,
                        UnreadCount = g.Count(m => m.ReceiverId == userId && !m.IsRead),
                        JobId = last.JobId,
                        JobTitle = last.Job?.Title
                    };
                })
                .OrderByDescending(c => c.LastMessageTime)
                .ToList();

            return Ok(conversations);
        }

        /// <summary>
        /// GET /api/chat/messages/{partnerId}?jobId=X
        /// Lấy lịch sử tin nhắn giữa user hiện tại và partner.
        /// </summary>
        [HttpGet("messages/{partnerId}")]
        public async Task<IActionResult> GetMessages(int partnerId, [FromQuery] int? jobId)
        {
            var userId = GetCurrentUserId();

            var query = _context.ChatMessages
                .Where(m =>
                    (m.SenderId == userId && m.ReceiverId == partnerId) ||
                    (m.SenderId == partnerId && m.ReceiverId == userId));

            if (jobId.HasValue)
                query = query.Where(m => m.JobId == jobId);

            var messages = await query
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .OrderBy(m => m.SentAt)
                .Select(m => new ChatMessageDto
                {
                    Id = m.Id,
                    SenderId = m.SenderId,
                    SenderName = m.Sender.FullName,
                    ReceiverId = m.ReceiverId,
                    ReceiverName = m.Receiver.FullName,
                    Content = m.Content,
                    SentAt = m.SentAt,
                    IsRead = m.IsRead,
                    JobId = m.JobId
                })
                .ToListAsync();

            // Đánh dấu đã đọc
            await _context.ChatMessages
                .Where(m => m.SenderId == partnerId && m.ReceiverId == userId && !m.IsRead)
                .ExecuteUpdateAsync(s => s.SetProperty(m => m.IsRead, true));

            return Ok(messages);
        }
    }
}
