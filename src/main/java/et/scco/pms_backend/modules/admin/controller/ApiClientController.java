package et.scco.pms_backend.modules.admin.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import et.scco.pms_backend.config.ApiResponse;
import et.scco.pms_backend.modules.admin.dto.request.ApiClientPrincipalRequestDTO;
import et.scco.pms_backend.modules.admin.dto.request.UserCreateRequest;
import et.scco.pms_backend.modules.admin.dto.response.ApiClientResponseDTO;
import et.scco.pms_backend.modules.admin.dto.response.UserResponseDTO;
import et.scco.pms_backend.modules.admin.service.ApiClientService;
import et.scco.pms_backend.utility.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/api-clients")
@RequiredArgsConstructor
public class ApiClientController {

        private final ApiClientService apiClientService;


        @PostMapping
        public ResponseEntity<ApiClientResponseDTO> register(
                @Valid @RequestBody ApiClientPrincipalRequestDTO request) {
        

        ApiClientResponseDTO response =
                apiClientService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
        }
    
        @GetMapping("/{id}")
        public ResponseEntity<ApiClientResponseDTO> getById(
                @PathVariable Long id
        ) {
    
            return ResponseEntity.ok(
                    apiClientService.getById(id)
            );
        }
    
        @PutMapping("{id}")
        public ApiResponse<ApiClientResponseDTO> updateApiClient(@PathVariable("id") Long apiClientId, @RequestBody ApiClientPrincipalRequestDTO requestDTO){
                return ResponseUtil.success("Api Client updated", apiClientService.updateApiClient(apiClientId,requestDTO));
        }

        @GetMapping
        public ResponseEntity<List<ApiClientResponseDTO>> getAll() {
    
            return ResponseEntity.ok(
                    apiClientService.getAll()
            );
        }
    
        @PatchMapping("/{id}/suspend")
        public ResponseEntity<ApiClientResponseDTO> suspend(
                @PathVariable Long id
        ) {
    
            return ResponseEntity.ok(
                    apiClientService.suspend(id)
            );
        }
    
        @PatchMapping("/{id}/activate")
        public ResponseEntity<ApiClientResponseDTO> activate(
                @PathVariable Long id
        ) {
    
            return ResponseEntity.ok(
                    apiClientService.activate(id)
            );
        }
    
        @PatchMapping("/{id}/revoke")
        public ResponseEntity<ApiClientResponseDTO> revoke(
                @PathVariable Long id
        ) {
    
            return ResponseEntity.ok(
                    apiClientService.revoke(id)
            );
        }

}
