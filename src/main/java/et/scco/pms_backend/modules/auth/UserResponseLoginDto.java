package et.scco.pms_backend.modules.auth;

import et.scco.pms_backend.enums.DivisionGroup;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class UserResponseLoginDto {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private Long positionId;
    private Long divisionId;
    private DivisionGroup divisionGroup;
    private Long subCityId;
    private List<String> roles;
    private List<String>permissions;
}
