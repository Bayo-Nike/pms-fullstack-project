package et.scco.pms_backend.modules.admin.service;

import java.util.List;

import et.scco.pms_backend.modules.admin.dto.request.ClientRequestDTO;
import et.scco.pms_backend.modules.admin.dto.response.ClientResponseDTO;
import et.scco.pms_backend.modules.admin.model.Client;

public interface ClientService {

    ClientResponseDTO createClient(ClientRequestDTO clientRequestDTO) throws Exception;

    ClientResponseDTO getClientById(Long clientId);

    List<ClientResponseDTO> getAllClients();

    ClientResponseDTO updateClient(Long clientId, ClientRequestDTO clientRequestDTO) throws Exception;

    void deleteClient(Long clientId);

    Client getClientEntityById(Long clientId);
 
}
