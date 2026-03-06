package et.scco.pms_backend.modules.admin.dto;
 
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String username;
    private String remark;
    private String password;
    private String isActive;


}
