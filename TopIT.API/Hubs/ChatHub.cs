using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TopIT.Core.DTOs;
using TopIT.Core.Entities;
using TopIT.Infrastructure.Data;

namespace TopIT.API.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly AppDbContext _context;

        public ChatHub(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Khi kết nối, mỗi user join vào Group riêng theo UserId
        /// để có thể gửi tin nhắn trực tiếp đến đúng người.
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
            }
            await base.OnConnectedAsync();
        }

        /// <summary>
        /// Client gọi hub method này để gửi tin nhắn.
        /// Hub lưu vào DB và push real-time cho người nhận.
        /// </summary>
        public async Task SendMessage(SendMessageDto dto)
        {
            var senderIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(senderIdStr)) return;

            var senderId = int.Parse(senderIdStr);
            var sender = await _context.Users.FindAsync(senderId);
            if (sender == null) return;

            // Lưu tin nhắn vào DB
            var message = new ChatMessage
            {
                SenderId = senderId,
                ReceiverId = dto.ReceiverId,
                Content = dto.Content,
                JobId = dto.JobId,
                SentAt = DateTime.UtcNow,
                IsRead = false
            };
            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync();

            var receiverName = (await _context.Users.FindAsync(dto.ReceiverId))?.FullName ?? "Unknown";

            var messageDto = new ChatMessageDto
            {
                Id = message.Id,
                SenderId = senderId,
                SenderName = sender.FullName,
                ReceiverId = dto.ReceiverId,
                ReceiverName = receiverName,
                Content = dto.Content,
                SentAt = message.SentAt,
                IsRead = false,
                JobId = dto.JobId
            };

            // Push tới người nhận
            await Clients.Group($"user-{dto.ReceiverId}").SendAsync("ReceiveMessage", messageDto);

            // Push lại cho chính người gửi (để confirm và hiển thị ở client)
            await Clients.Caller.SendAsync("ReceiveMessage", messageDto);
        }
    }
}
