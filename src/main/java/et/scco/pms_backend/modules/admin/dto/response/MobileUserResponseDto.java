package et.scco.pms_backend.modules.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MobileUserResponseDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String userCode;
    private String status;
    private LocalDateTime registrationDate;
}