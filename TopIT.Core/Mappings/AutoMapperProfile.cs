using AutoMapper;
using TopIT.Core.DTOs;
using TopIT.Core.Entities;

namespace TopIT.Core.Mappings
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<RegisterDto, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordSalt, opt => opt.Ignore());
            
            // Map other entities if needed
        }
    }
}
