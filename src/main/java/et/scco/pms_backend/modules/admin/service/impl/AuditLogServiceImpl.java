package et.scco.pms_backend.modules.admin.service.impl;

import et.scco.pms_backend.modules.admin.dto.response.AuditLogResponseDto;
import et.scco.pms_backend.modules.admin.model.AuditLog;
import et.scco.pms_backend.modules.admin.repository.AuditLogRepository;
import et.scco.pms_backend.modules.admin.service.AuditLogService;
import et.scco.pms_backend.modules.auth.AuthUtility;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void auditLog(String action, String object, String detailMessage) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setPerformedBy(AuthUtility.getUserName());
        auditLog.setDetails(detailMessage);
        auditLogRepository.save(auditLog);
    }

    public Page<AuditLogResponseDto> getAllAuditLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable)
                .map(this::mapToDto);
    }

    private AuditLogResponseDto mapToDto(AuditLog auditLog) {
        return new AuditLogResponseDto(
                auditLog.getId(),
                auditLog.getAction(),
                auditLog.getPerformedBy(),
                auditLog.getDetails(),
                auditLog.getTimestamp()
        );
    }
}
