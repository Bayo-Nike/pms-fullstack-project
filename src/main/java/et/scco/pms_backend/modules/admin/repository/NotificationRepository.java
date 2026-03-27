package et.scco.pms_backend.modules.admin.repository;

import et.scco.pms_backend.modules.admin.dto.response.NotificationResponseDto;
import et.scco.pms_backend.modules.admin.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT new et.scco.pms_backend.modules.admin.dto.response.NotificationResponseDto(n.id, e.fullName, n.message, n.notificationUrl, n.seen, n.createdAt) " +
            "FROM Notification n JOIN Employee e ON n.receiver = e.id " +
            "WHERE n.receiver = :receiver")
    Page<NotificationResponseDto> findAllByReceiverWithName(@Param("receiver") Long receiver, Pageable pageable);
}
