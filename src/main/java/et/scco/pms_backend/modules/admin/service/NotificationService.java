package et.scco.pms_backend.modules.admin.service;

import et.scco.pms_backend.modules.admin.dto.response.NotificationResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    void sendNotification(Long owner, Long receiver, String message, String url);

    Page<NotificationResponseDto> getMyNotifications(Pageable pageable);

    Boolean markAsRead(Long id);
}
