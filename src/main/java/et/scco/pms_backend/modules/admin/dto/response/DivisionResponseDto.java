package et.scco.pms_backend.modules.admin.dto.response;

import et.scco.pms_backend.enums.DivisionGroup;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DivisionResponseDto {
    private Long id;
    private String name;
    private DivisionGroup divisionGroup;
    private Long parentId;
    private String parentName;
    private List<Children> children;

    @Data
    @AllArgsConstructor
    public static class Children {
        private Long id;
        private String name;
    }
}
