package et.scco.pms_backend.modules.admin.service;

import et.scco.pms_backend.modules.admin.dto.response.NotificationResponseDto;

import java.util.List;

public interface NotificationService {
    void sendNotification(String owner, String receiver, String message, String url);
    List<NotificationResponseDto> getMyNotifications();
    void deleteMyNotification(Long id);
}
