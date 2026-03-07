package et.scco.pms_backend.modules.admin.repository;

import et.scco.pms_backend.modules.admin.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}
