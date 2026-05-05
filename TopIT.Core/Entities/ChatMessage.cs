namespace TopIT.Core.Entities
{
    public class ChatMessage
    {
        public int Id { get; set; }

        public int SenderId { get; set; }
        public User Sender { get; set; } = null!;

        public int ReceiverId { get; set; }
        public User Receiver { get; set; } = null!;

        /// <summary>Nội dung tin nhắn</summary>
        public string Content { get; set; } = string.Empty;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public bool IsRead { get; set; } = false;

        /// <summary>JobId liên quan (tuỳ chọn, giúp nhóm hội thoại theo job)</summary>
        public int? JobId { get; set; }
        public Job? Job { get; set; }
    }
}
