package et.scco.pms_backend.modules.admin.dto.request;

import lombok.Data;

@Data
public class DivisionRequestDto {
    private String name;
    private Long parentId;
}
