package et.scco.pms_backend.modules.admin.mapper;

import java.util.List;
import java.util.stream.Collectors;

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

        return new UserResponseLoginDto(
                user.getId(),
                user.getUsername(),
                user.getUserType().equals(UserType.EMPLOYEE) ? user.getEmployee().getFullName(): UserType.SYSTEM.name(),
                user.getEmail(),
                roles,
                permissions
        );
    }
}
