using System.Collections.Generic;

namespace TopIT.Core.DTOs
{
    public class ParsedCvDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string TechnicalSkills { get; set; } = string.Empty;
        public string SoftSkills { get; set; } = string.Empty;
        public List<ExperienceDto> Experiences { get; set; } = new();
        public List<EducationDto> Educations { get; set; } = new();
        public List<ProjectDto> Projects { get; set; } = new();
    }

    public class ExperienceDto
    {
        public string Company { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class EducationDto
    {
        public string School { get; set; } = string.Empty;
        public string Major { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class ProjectDto
    {
        public string Name { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
