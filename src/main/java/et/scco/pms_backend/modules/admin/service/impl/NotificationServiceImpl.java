package et.scco.pms_backend.modules.admin.service.impl;

import et.scco.pms_backend.modules.admin.dto.response.NotificationResponseDto;
import et.scco.pms_backend.modules.admin.model.Notification;
import et.scco.pms_backend.modules.admin.repository.NotificationRepository;
import et.scco.pms_backend.modules.admin.service.NotificationService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository repository;

    @Override
    public void sendNotification(String owner, String receiver, String message, String url) {
        Notification notification = new Notification();
        notification.setOwner(owner);
        notification.setReceiver(receiver);
        notification.setMessage(message);
        notification.setNotificationUrl(url);
        repository.save(notification);
    }

    @Override
    public List<NotificationResponseDto> getMyNotifications() {
        List<Notification> notifications =
                repository.findTopByDeletedFalse();
        return notifications
                .stream()
                .map(not -> new NotificationResponseDto(
                        not.getId(),
                        not.getReceiver(),
                        not.getMessage(),
                        not.getNotificationUrl(),
                        not.getCreatedAt()
                ))
                .toList();
    }

    @Override
    public void deleteMyNotification(Long id) {
        repository.deleteById(id);
    }
}
