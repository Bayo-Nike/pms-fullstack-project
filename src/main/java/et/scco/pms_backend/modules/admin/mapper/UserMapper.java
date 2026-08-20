package et.scco.pms_backend.modules.admin.mapper;

import java.util.List;
import java.util.stream.Collectors;

import et.scco.pms_backend.enums.DivisionGroup;
import et.scco.pms_backend.enums.PrincipalType;
import et.scco.pms_backend.enums.UserType;
import et.scco.pms_backend.modules.admin.dto.request.UserCreateRequest;
import et.scco.pms_backend.modules.admin.dto.response.UserResponseDTO;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.Permission;
import et.scco.pms_backend.modules.admin.model.Roles;
import et.scco.pms_backend.modules.admin.model.User;
import et.scco.pms_backend.modules.auth.UserResponseLoginDto;

public class UserMapper {

    public static UserResponseDTO mapToUserDTO(User user) {
        if (user == null) return null;
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        if (user.getUserType().equals(UserType.EMPLOYEE)){
            dto.setFullName(user.getEmployee().getFullName());
        }else{
            dto.setFullName(UserType.SYSTEM.name());
        }
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        if (user.getRoles() != null) {
            dto.setRoles(user.getRoles().stream()
                .map(RoleMapper::mapToRoleDTO)
                .collect(Collectors.toList()));
        }
        dto.setMobileAllowed(user.getMobileAllowed());
        dto.setPrincipalType(user.getPrincipalType());
        
        if (user.getPrincipalType().equals(PrincipalType.API_CLIENT)){
            dto.setApiClientId(
                user.getApiClient() != null
                    ? user.getApiClient().getId()
                    : null
            );            
        }
        dto.setUserType(user.getUserType());
        

        return dto;
    }

    public static User mapToUser(UserCreateRequest dto, Employee employee) {
        if (dto == null) return null;
        User user = new User();
        user.setEmployee(employee);
        user.setEmail(employee.getEmail());
        user.setUsername(dto.getUsername());
        user.setUserType(UserType.EMPLOYEE);
        return user;
    }

    public static UserResponseLoginDto toResponseDto(User user) {

        List<String> roles = user.getRoles()
                .stream()
                .map(Roles::getRoleName)
                .toList();

        List<String> permissions = user.getRoles()
                .stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::getSlug)
                .distinct()
                .toList();

        Employee employee = user.getEmployee();

        Long divisionId = null;
        DivisionGroup divisionGroup = null;
        Long subCityId = null;
        String fullName = UserType.SYSTEM.name();
        Long positionId = null;

        if (employee != null) {
            fullName = employee.getFullName();

            if (employee.getDivision() != null) {
                divisionId = employee.getDivision().getId();
                divisionGroup = employee.getDivision().getDivisionGroup();
            }

            if (employee.getSubCity() != null) {
                subCityId = employee.getSubCity().getId();
            }

            if (employee.getPosition() != null) {
                positionId = employee.getPosition().getId();
            }
        }

        return new UserResponseLoginDto(
                user.getId(),
                user.getUsername(),
                fullName,
                user.getEmail(),
                positionId,
                divisionId,
                divisionGroup,
                subCityId,
                roles,
                permissions
        );
    }
}
