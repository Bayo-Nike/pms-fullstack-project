package et.scco.pms_backend.modules.admin.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class RoleRequestDto {
    private Long id;
    private String roleName;
    private String description;
    private List<Long> permissions;
}
