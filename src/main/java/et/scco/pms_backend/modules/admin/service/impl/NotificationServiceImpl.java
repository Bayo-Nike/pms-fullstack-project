package et.scco.pms_backend.modules.admin.service.impl;

import et.scco.pms_backend.modules.admin.dto.response.NotificationResponseDto;
import et.scco.pms_backend.modules.admin.model.Notification;
import et.scco.pms_backend.modules.admin.repository.NotificationRepository;
import et.scco.pms_backend.modules.admin.service.NotificationService;
import et.scco.pms_backend.utility.AuthContext;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository repository;
    private final AuthContext authContext;

    @Override
    public void sendNotification(Long owner, Long receiver, String message, String url) {
        Notification notification = new Notification();
        notification.setOwner(owner);
        notification.setReceiver(receiver);
        notification.setMessage(message);
        notification.setNotificationUrl(url);
        repository.save(notification);
    }

    @Override
    public List<NotificationResponseDto> getMyNotifications() {

        if (authContext.getEmployee() == null) {
            return List.of();
        }

        List<Notification> notifications =
                repository.findAllByReceiver(authContext.getEmployee().getId());
        return notifications
                .stream()
                .map(not -> new NotificationResponseDto(
                        not.getId(),
                        not.getReceiver().toString(),
                        not.getMessage(),
                        not.getNotificationUrl(),
                        not.isSeen(),
                        not.getCreatedAt()
                ))
                .toList();
    }

    @Override
    public void markAsRead(Long id) {
        Notification notification = repository.findById(id)
                        .orElseThrow();
        notification.setSeen(true);
        repository.save(notification);
    }
}
