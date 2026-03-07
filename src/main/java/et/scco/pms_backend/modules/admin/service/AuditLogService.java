package et.scco.pms_backend.modules.admin.service;

public interface AuditLogService {
    void auditLog(String action, String object, String messageDetail);
}
