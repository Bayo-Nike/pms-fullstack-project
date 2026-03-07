package et.scco.pms_backend.modules.admin.service.impl;

import et.scco.pms_backend.modules.admin.model.AuditLog;
import et.scco.pms_backend.modules.admin.repository.AuditLogRepository;
import et.scco.pms_backend.modules.admin.service.AuditLogService;
import et.scco.pms_backend.modules.auth.AutUtility;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void auditLog(String action, String object, String detailMessage) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setObject(object);
        auditLog.setPerformedBy(AutUtility.getUserName());
        auditLog.setDetails(detailMessage);
        auditLogRepository.save(auditLog);
    }
}
