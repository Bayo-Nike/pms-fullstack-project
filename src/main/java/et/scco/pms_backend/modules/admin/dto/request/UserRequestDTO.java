package et.scco.pms_backend.modules.admin.dto.request;

import java.util.List;

import lombok.Data;

@Data
public class UserRequestDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String password;
    private Boolean isActive;
    private String remark;

    private List<Long> roleIds;   // important
    private String principalType;

}
