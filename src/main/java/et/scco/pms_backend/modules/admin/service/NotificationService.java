package et.scco.pms_backend.modules.admin.service;

import et.scco.pms_backend.modules.admin.dto.response.NotificationResponseDto;

import java.util.List;

public interface NotificationService {
    void sendNotification(Long owner, Long receiver, String message, String url);
    List<NotificationResponseDto> getMyNotifications();
    void markAsRead(Long id);
}
