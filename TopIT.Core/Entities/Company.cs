using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TopIT.Core.Entities
{
    public class Company
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty; //Tên công ty

        public string? Description { get; set; } // Giới thiệu về công ty

        public string? LogoPath { get; set; } // Lưu đường dẫn ảnh logo 

        public string? Website { get; set; } // Link website công ty

        public string Address { get; set; } = string.Empty; //Địa chỉ công ty

        public string? Size { get; set; } //Quy mô công ty

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<Job> Jobs { get; set; } = new List<Job>();// Danh sách tin đăng tuyển của công ty
    }
}
