package et.scco.pms_backend.modules.admin.mapper;
 
import et.scco.pms_backend.enums.Category;
import et.scco.pms_backend.enums.ConsultantStatus;
import et.scco.pms_backend.modules.admin.dto.request.ConsultancyRequestDTO;
import et.scco.pms_backend.modules.admin.dto.response.ConsultancyResponseDTO;
import et.scco.pms_backend.modules.admin.dto.response.EmployeeSimpleDto;
import et.scco.pms_backend.modules.admin.model.Consultancy;
import et.scco.pms_backend.modules.admin.model.Employee;

public class ConsultancyMapper {
    public static ConsultancyResponseDTO mapToConsultancyResponseDTO(Consultancy consultancy) {

        if (consultancy == null) return null;

        ConsultancyResponseDTO dto = new ConsultancyResponseDTO();

        dto.setId(consultancy.getId());
        dto.setConsultantName(consultancy.getConsultantName());
        dto.setCategory(consultancy.getCategory());
        dto.setLicenseExpiryDate(consultancy.getLicenseExpiryDate());
        dto.setStatus(consultancy.getStatus());
        dto.setCreatedDate(consultancy.getCreatedDate());
        dto.setRegisteredDate(consultancy.getRegisteredDate());
        dto.setDocument(consultancy.getDocument());
        // ✅ FIX: map Employee → EmployeeResponseDto
        if (consultancy.getCreatedBy() != null) {
            Employee emp = consultancy.getCreatedBy();
            dto.setCreatedBy(new EmployeeSimpleDto(
                    emp.getId(),
                    emp.getFullName()
            ));
        }

        return dto;
    }

    public static Consultancy mapToConsultancy(ConsultancyRequestDTO dto) {

        if (dto == null) return null;

        Consultancy consultancy = new Consultancy();
        consultancy.setConsultantName(dto.getConsultantName());
        consultancy.setCategory(Category.valueOf(dto.getCategory()));
        consultancy.setLicenseExpiryDate(dto.getLicenseExpiryDate());
        consultancy.setStatus(ConsultantStatus.valueOf(dto.getStatus()));
        if (dto.getRegisteredDate()!=null) {
            consultancy.setRegisteredDate(dto.getRegisteredDate());
        }
        
        return consultancy;
    }

}
