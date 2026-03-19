package et.scco.pms_backend.modules.admin.mapper;
 
import et.scco.pms_backend.enums.ConsultantStatus;
import et.scco.pms_backend.modules.admin.dto.request.ConsultancyRequestDTO;
import et.scco.pms_backend.modules.admin.dto.response.ConsultancyResponseDTO;
import et.scco.pms_backend.modules.admin.model.Consultancy;

public class ConsultancyMapper {
    public static ConsultancyResponseDTO mapToConsultancyResponseDTO(Consultancy consultancy) {

        if (consultancy == null) return null;

        ConsultancyResponseDTO dto = new ConsultancyResponseDTO();

        dto.setId(consultancy.getId());
        dto.setConsultantName(consultancy.getConsultantName());
        dto.setStatus(consultancy.getStatus());
        dto.setCreatedBy(consultancy.getCreatedBy());
        dto.setCreatedDate(consultancy.getCreatedDate());
        dto.setDocument(consultancy.getDocument());

        return dto;
    }

    public static Consultancy mapToConsultancy(ConsultancyRequestDTO dto) {

        if (dto == null) return null;

        Consultancy consultancy = new Consultancy();
        consultancy.setConsultantName(dto.getConsultantName());
        consultancy.setStatus(ConsultantStatus.valueOf(dto.getStatus()));
        

        return consultancy;
    }

}
