package et.scco.pms_backend.modules.admin.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import et.scco.pms_backend.modules.admin.dto.PermissionDto;
import et.scco.pms_backend.modules.admin.service.PermissionService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/admin/permissions")
@RequiredArgsConstructor
public class PermissionsController {

    private final PermissionService permissionService;

    @GetMapping
    public ResponseEntity<List<PermissionDto>>getAllPermissions(){
        List<PermissionDto> allPermissionsDto=permissionService.getAllPermissions();
        return ResponseEntity.ok(allPermissionsDto);

    }
}
