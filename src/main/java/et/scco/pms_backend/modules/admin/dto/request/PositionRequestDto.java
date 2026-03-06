package et.scco.pms_backend.modules.admin.dto.request;

import lombok.Data;

@Data
public class PositionRequestDto {
    private String name;
    private Long parentId;
    private Long divisionId;
}
