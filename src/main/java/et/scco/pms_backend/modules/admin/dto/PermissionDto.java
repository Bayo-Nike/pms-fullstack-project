package et.scco.pms_backend.modules.admin.dto;
  

import java.util.List;

import lombok.Data;

@Data
public class PermissionDto {
    private Long id;
    private String slug;
    private String name;
    private Long moduleId;
    private String moduleName;
    private List<Long> roleIds;
}
