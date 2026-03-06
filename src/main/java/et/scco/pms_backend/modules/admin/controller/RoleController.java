package et.scco.pms_backend.modules.admin.controller;

import java.util.List;

import et.scco.pms_backend.modules.admin.dto.request.RoleRequestDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import et.scco.pms_backend.modules.admin.dto.RoleDto;
import et.scco.pms_backend.modules.admin.service.RoleService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/roles")
public class RoleController {

    private final RoleService roleService;

     @PostMapping
     public ResponseEntity<RoleDto>createRole(@RequestBody RoleRequestDto roleDto){
         RoleDto savedRoleDto=roleService.createRole(roleDto);
         return  new ResponseEntity<>(savedRoleDto,HttpStatus.CREATED);
     }
 
     // Build Get Role REST API
     @GetMapping("{id}")
     public ResponseEntity<RoleDto>getRole(@PathVariable("id") Long roleId){
         RoleDto roleDTO=roleService.getRoleById(roleId);
         return ResponseEntity.ok(roleDTO);
 
     }
 
     // Build Get All Roles REST API
     @GetMapping
     public ResponseEntity<List<RoleDto>>getAllRoles(){
         List<RoleDto> allRolesDto=roleService.getAllRoles();
         return ResponseEntity.ok(allRolesDto);
 
     }
 
     // Build Update Project REST API
     @PutMapping("{id}")
     public ResponseEntity<RoleDto>updateRolEntity(@PathVariable("id") Long roleId,@RequestBody RoleRequestDto roleDto){
        RoleDto updateRoleDto=roleService.updateRole(roleId,roleDto);
         return ResponseEntity.ok(updateRoleDto);
     }

     // Build Delete Project REST API
     @DeleteMapping("{id}")
     public ResponseEntity<String> deleteRole(@PathVariable("id") Long roleId){
         roleService.deleteRole(roleId);
         return ResponseEntity.ok("Role deleted successfully.");
     }
}
