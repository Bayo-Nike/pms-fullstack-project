package et.scco.pms_backend.modules.planning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentResponseDTO {

    private Long id;
    private String fileName;
}
