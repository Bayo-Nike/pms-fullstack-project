package et.scco.pms_backend.modules.admin.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import et.scco.pms_backend.enums.ClientStatus;
import et.scco.pms_backend.enums.ConsultantStatus;
import et.scco.pms_backend.exception.ResourceNotFoundException;
import et.scco.pms_backend.modules.admin.dto.request.ClientRequestDTO;
import et.scco.pms_backend.modules.admin.dto.response.ClientResponseDTO;
import et.scco.pms_backend.modules.admin.mapper.ClientMapper;
import et.scco.pms_backend.modules.admin.mapper.ConsultancyMapper;
import et.scco.pms_backend.modules.admin.model.Client;
import et.scco.pms_backend.modules.admin.model.Consultancy;
import et.scco.pms_backend.modules.admin.repository.ClientRepository;
import et.scco.pms_backend.modules.admin.service.ClientService;
import et.scco.pms_backend.utility.FileStorageService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService{

    private final ClientRepository clientRepository;
    private final FileStorageService fileStorageService;

    @Override
    public ClientResponseDTO createClient(ClientRequestDTO clientRequestDTO)  throws Exception{
        Client client = ClientMapper.mapToClient(clientRequestDTO);

        if (clientRequestDTO.getDocument() != null && !clientRequestDTO.getDocument().isEmpty()) {
            String fileName = fileStorageService.storeFile(clientRequestDTO.getDocument());
            client.setDocument(fileName);
        }
        

        Client savedClient = clientRepository.save(client);

        return ClientMapper.mapToClientResponseDTO(savedClient);
    }

    @Override
    public ClientResponseDTO getClientById(Long clientId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client is Not found with given id: " + clientId));
        return ClientMapper.mapToClientResponseDTO(client);
    }

    @Override
    public List<ClientResponseDTO> getAllClients() {
        List<Client> clienties = clientRepository.findAll();
        return clienties.stream().map(ClientMapper::mapToClientResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ClientResponseDTO updateClient(Long clientId, ClientRequestDTO clientRequestDTO)  throws Exception {
        Client client = clientRepository.findById(clientId)
            .orElseThrow(() ->
                new ResourceNotFoundException("Client does not exist with given id: " + clientId));

        // Update clientName and status
        client.setClientName(clientRequestDTO.getClientName());
        // contractor.setStatus(contractorRequestDTO.getStatus());
        client.setStatus(ClientStatus.valueOf(clientRequestDTO.getStatus()));

        // Only update file if a new one is uploaded
        if (clientRequestDTO.getDocument() != null && !clientRequestDTO.getDocument().isEmpty()) {
            String fileName = fileStorageService.storeFile(clientRequestDTO.getDocument());
            client.setDocument(fileName);
        }
        // else: keep the existing file

        Client updatedClient = clientRepository.save(client);
        return ClientMapper.mapToClientResponseDTO(updatedClient);
    }

    @Override
    public void deleteClient(Long clientId) {
        Client client  = clientRepository.findById(clientId)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Client is not Exist with given id:" + clientId));
        clientRepository.delete(client);
    }

    @Override
    public Client getClientEntityById(Long clientId) {
        return clientRepository.findById(clientId)
            .orElseThrow(() -> new RuntimeException("Client not found with id: "+clientId));
    }
}
