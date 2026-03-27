package et.scco.pms_backend.modules.admin.controller;


import et.scco.pms_backend.config.ApiResponse;
import et.scco.pms_backend.modules.admin.dto.response.NotificationResponseDto;
import et.scco.pms_backend.modules.admin.service.NotificationService;
import et.scco.pms_backend.utility.ResponseUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ApiResponse<Page<NotificationResponseDto>> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        return ResponseUtil.success(
                "Notifications found",
                notificationService.getMyNotifications(PageRequest.of(page, size, Sort.by("createdAt").descending()))
        );
    }

    @PostMapping("/{id}")
    ApiResponse<Boolean> markAsRead(@PathVariable Long id){
        return ResponseUtil.success(
                "Set read",
                notificationService.markAsRead(id)
        );
    }
}
