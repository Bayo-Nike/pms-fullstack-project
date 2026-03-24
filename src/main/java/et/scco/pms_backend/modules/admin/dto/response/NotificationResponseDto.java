package et.scco.pms_backend.modules.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@AllArgsConstructor
@Getter
public class NotificationResponseDto {
    private Long id;
    private String receiver;
    private String message;
    private String notificationUrl;
    private boolean isRead;
    private LocalDateTime createdAt;
}
