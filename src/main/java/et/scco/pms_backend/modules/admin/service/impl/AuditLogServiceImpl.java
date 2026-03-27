package et.scco.pms_backend.modules.admin.service.impl;

import et.scco.pms_backend.modules.admin.dto.response.AuditLogResponseDto;
import et.scco.pms_backend.modules.admin.model.AuditLog;
import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.repository.AuditLogRepository;
import et.scco.pms_backend.modules.admin.service.AuditLogService;
import et.scco.pms_backend.modules.auth.AuthUtility;
import et.scco.pms_backend.utility.AuthContext;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final AuthContext authContext;

    public void auditLog(String action, String detailMessage) {

        Employee employee = authContext.getEmployee();
        String performedBy;
        if (employee != null) {
            performedBy = employee.getFullName();
        }else{
            performedBy = "System";
        }
        performedBy = performedBy +" ("+AuthUtility.getUserName()+")";
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setPerformedBy(performedBy);
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
