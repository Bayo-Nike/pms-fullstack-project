package et.scco.pms_backend.modules.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PositionResponseDto {
    private Long id;
    private String name;
    private Long parentId;
    private String parentName;
    private Long divisionId;
    private String divisionName;
    private List<Children> children;

    @Data
    @AllArgsConstructor
    public static class Children {
        private Long id;
        private String name;
    }
}
