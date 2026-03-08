package et.scco.pms_backend.modules.admin.controller;

import et.scco.pms_backend.config.ApiResponse;
import et.scco.pms_backend.modules.admin.dto.response.AuditLogResponseDto;
import et.scco.pms_backend.modules.admin.service.impl.AuditLogServiceImpl;
import et.scco.pms_backend.utility.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/admin/logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogServiceImpl auditLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AuditLogResponseDto>>> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<AuditLogResponseDto> auditLogs = auditLogService.getAllAuditLogs(pageable);

        return ResponseEntity.ok(
                ResponseUtil.success("Audit logs fetched successfully", auditLogs)
        );
    }
}