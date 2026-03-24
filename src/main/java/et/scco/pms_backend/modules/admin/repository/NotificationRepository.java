package et.scco.pms_backend.modules.admin.repository;

import et.scco.pms_backend.modules.admin.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByReceiver(Long receiver);
}
