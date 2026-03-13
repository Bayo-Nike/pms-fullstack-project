package et.scco.pms_backend.modules.dashboard.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import et.scco.pms_backend.modules.dashboard.dto.DashboardSummaryDTO;
import et.scco.pms_backend.modules.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary() {

        return ResponseEntity.ok(dashboardService.getSummary());
    }

}
