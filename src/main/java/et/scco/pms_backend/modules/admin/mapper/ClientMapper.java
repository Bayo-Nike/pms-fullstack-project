package et.scco.pms_backend.modules.admin.mapper;

import et.scco.pms_backend.enums.Category;
import et.scco.pms_backend.enums.ClientStatus;
import et.scco.pms_backend.modules.admin.dto.request.ClientRequestDTO;
import et.scco.pms_backend.modules.admin.dto.response.ClientResponseDTO;
import et.scco.pms_backend.modules.admin.model.Client;

public class ClientMapper {
    public static ClientResponseDTO mapToClientResponseDTO(Client client) {

        if (client == null) return null;

        ClientResponseDTO dto = new ClientResponseDTO();

        dto.setId(client.getId());
        dto.setClientName(client.getClientName());
        dto.setCategory(client.getCategory());
        dto.setStatus(client.getStatus());
        dto.setCreatedBy(client.getCreatedBy());
        dto.setCreatedDate(client.getCreatedDate());
        if (client.getRegisteredDate()!=null) {
            dto.setRegisteredDate(client.getRegisteredDate().toLocalDate());
        }
        dto.setDocument(client.getDocument());

        return dto;
    }

    public static Client mapToClient(ClientRequestDTO dto) {

        if (dto == null) return null;

        Client client  = new Client();
        client.setClientName(dto.getClientName());
        client.setCategory(Category.valueOf(dto.getCategory()));
        if (dto.getRegisteredDate()!=null) {
            client.setRegisteredDate(dto.getRegisteredDate().atStartOfDay());
        }
        
        client.setStatus(ClientStatus.valueOf(dto.getStatus()));
        

        return client;
    }

}
