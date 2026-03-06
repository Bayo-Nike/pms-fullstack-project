package et.scco.pms_backend.modules.admin.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class UserCreateRequest {
    private Long employeeId;
    private String username;
    private String email;
    private String password;
    private List<Long> roleIds;
}
