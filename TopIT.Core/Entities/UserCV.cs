using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TopIT.Core.Entities
{
    public class UserCV
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }
        public User User { get; set; }

        [Required]
        [MaxLength(255)]
        public string FileName { get; set; }

        [Required]
        public string FileUrl { get; set; }

        public DateTime UploadDate { get; set; } = DateTime.Now;

        public bool IsDefault { get; set; } = false;
    }
}
