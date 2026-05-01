package et.scco.pms_backend.modules.admin.mapper;

import et.scco.pms_backend.enums.Category;
import et.scco.pms_backend.enums.ContractorStatus;
import et.scco.pms_backend.modules.admin.dto.request.ContractorRequestDTO;
import et.scco.pms_backend.modules.admin.dto.response.ContractorResponseDTO;
import et.scco.pms_backend.modules.admin.model.Contractor;

public class ContractorMapper {

    public static ContractorResponseDTO mapToContractorResponseDTO(Contractor contractor) {

        if (contractor == null) return null;

        ContractorResponseDTO dto = new ContractorResponseDTO();

        dto.setId(contractor.getId());
        dto.setContractorName(contractor.getContractorName());
        dto.setCategory(contractor.getCategory());
        dto.setLicenseExpiryDate(contractor.getLicenseExpiryDate());
        dto.setStatus(contractor.getStatus());
        dto.setCreatedDate(contractor.getCreatedDate());
        dto.setDocument(contractor.getDocument());
        dto.setRegisteredDate(contractor.getRegisteredDate());


        return dto;
    }

    public static Contractor mapToContractor(ContractorRequestDTO dto) {

        if (dto == null) return null;

        Contractor contractor = new Contractor();
        contractor.setContractorName(dto.getContractorName());
        contractor.setCategory(Category.valueOf(dto.getCategory()));
        contractor.setLicenseExpiryDate(dto.getLicenseExpiryDate());
        contractor.setStatus(ContractorStatus.valueOf(dto.getStatus()));
        if (dto.getRegisteredDate()!=null) {
            contractor.setRegisteredDate(dto.getRegisteredDate().atStartOfDay());
        }
        

        return contractor;
    }

}
