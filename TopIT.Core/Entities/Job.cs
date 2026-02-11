using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TopIT.Core.Entities
{
    public class Job
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty; // Tên công việc
        public string? Description { get; set; } //  tả công việc
        //---- Các trường để lọc
        // Theo vị trí
        public string Location { get; set; } = "Hồ Chí Minh";// Vị trí làm việc        
        //Theo mức lương
        public decimal? SalaryMax { get; set; }// Lương tối đa
        public decimal? SalaryMin { get; set; }// Lương tối thiểu
        public bool? IsNegotiable { get; set; }// Lương thỏa thuận

        //Theo kinh nghiệm, cấp bậc, loại công việc
        public string Level { get; set; } = string.Empty; // Junior, Senior...
        public string JobType { get; set; } = string.Empty; // Full-time, Remote...
        public int ExperienceYears { get; set; }// Năm kinh nghiệm 

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;//Thời gian tạo bài đăng

        //Theo tên công ty
        public int CompanyId { get; set; } //Id Công ty đang tuyển
        public Company? Company { get; set; }

    }
}
