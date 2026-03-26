package et.scco.pms_backend.modules.admin.service.impl;

import et.scco.pms_backend.modules.admin.dto.response.NotificationResponseDto;
import et.scco.pms_backend.modules.admin.model.Notification;
import et.scco.pms_backend.modules.admin.repository.NotificationRepository;
import et.scco.pms_backend.modules.admin.service.NotificationService;
import et.scco.pms_backend.utility.AuthContext;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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
    public Page<NotificationResponseDto> getMyNotifications(Pageable pageable) {
        if (authContext.getEmployee() == null) {
            return Page.empty();
        }
        return repository.findAllByReceiverWithName(authContext.getEmployee().getId(), pageable);
    }

    @Override
    public Boolean markAsRead(Long id) {
        Notification notification = repository.findById(id)
                        .orElseThrow();
        notification.setSeen(true);
        repository.save(notification);
        return notification.isSeen();
    }
}
