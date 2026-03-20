package et.scco.pms_backend.modules.admin.controller;


import et.scco.pms_backend.config.ApiResponse;
import et.scco.pms_backend.modules.admin.dto.response.NotificationResponseDto;
import et.scco.pms_backend.modules.admin.service.NotificationService;
import et.scco.pms_backend.utility.ResponseUtil;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    ApiResponse<List<NotificationResponseDto>> getMyNotifications(){
        return ResponseUtil.success(
                "Notification found",
                notificationService.getMyNotifications()
        );
    }


    @DeleteMapping("/{id}")
    void deleteMyNotification(@PathVariable Long id){
        notificationService.deleteMyNotification(id);
    }
}
