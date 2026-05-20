package et.scco.pms_backend.utility;

import et.scco.pms_backend.enums.AccessType;
import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class EndpointPermission {

    private String method;
    private String path;
    private AccessType accessType;
    private String permission;
}