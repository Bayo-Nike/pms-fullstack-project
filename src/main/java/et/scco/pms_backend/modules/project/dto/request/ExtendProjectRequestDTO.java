package et.scco.pms_backend.modules.project.dto.request;

import lombok.Data;

@Data
public class ExtendProjectRequestDTO {

    private int extendedDays;
    private String reason;
}
